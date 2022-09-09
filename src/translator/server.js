import Koa from "koa";
import { createServer } from "http";
import { Server } from "socket.io";

import { clientSocket, identifySocketAs } from "./socket";
import { socketInterface, multiSocketInterface } from "./messagingInterface";
import translateAlgebra from "./translateAlgebra";
import refCardPaths from "./refCards";
import * as pyr from "../observer/src/pythonRelay.js";
import * as utils from "../observer/src/utils.js";
import { convertAlgebra } from "./decodeAlgebra";

import { sortCardsArr, cardsToAlgebra } from "../algebra/observer";
//FIREBASE
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onValue } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// This server is largely unnecessary and should probably be replaced
// with a simplest-possible server or no server at all.
// Added initially because Koa is a lovely HTTP server, and it turns
// out that the socket.io plugging-in here does much use the Koa
// middleware.
// Would be useful and retainable if we wanted to keep HTTP endpoints
// around as an alternative interface to the server.
const isDevEnvironment = process.env.ENV === "DEV" || !process.env.ENV;
isDevEnvironment && console.log("In dev environment");
const app = new Koa();
const httpServer = createServer(app.callback());
const io = new Server(httpServer, {
  cors: {
    origin: isDevEnvironment ? "" : "https://web-client-arkhe.herokuapp.com"
  },
  maxHttpBufferSize: 1e8
});

const port = process.env.PORT;

const pythonProcess = pyr.startPython(refCardPaths, false);
const processFrame = pyr.processFrame(pythonProcess);

let lastTranslatedAlgebra = { arkhe_tag: "identity" };
let projectorSockets = [];
let observerSockets = [];

io.engine.on("connection_error", err => {
  console.log(err.req); // the request object
  console.log(err.code); // the error code, for example 1
  console.log(err.message); // the error message, for example "Session ID unknown"
  console.log(err.context); // some additional error context
});

io.on("connection", socket => {
  let id = socket.id;
  console.log(`Server Connected to socket ${socket.id}`);

  socket.on("disconnect", reason => {
    console.log(`Disconnected from socket ${id}: ${reason}`);
    id = null;
  });

  socket.on("connect_error", err => {
    console.log(`Socket connection error: ${err.message}`);
    id = null;
  });

  const connection = socketInterface(socket);

  //projector code
  socket.on("projector/identify", reply => {
    console.log("Received:", "projector/identify");
    projectorSockets.push(socket);
    reply("hi projector from translator");

    const projectorConn = connection;

    projectorConn.on("projector/initial-state", ({ reply }) => {
      //may need to decode file into algebra for the projector
      reply(lastTranslatedAlgebra);
    });
  });

  //observer code
  socket.on("observer/identify", reply => {
    console.log("Received:", "observer/identify");
    observerSockets.push(socket);
    reply("hi observer from translator");

    const observerConn = connection;
    const translatorConn = socketInterface(clientSocket());
    let lastObservedAlgebra = { arkhe_tag: "identity" };

    observerConn.on("observer/bitmap-frame", async ({ data, reply }) => {
      console.log("bitmap frame");
      let arr = data[0].split(",");

      let dataSet = [];
      try {
        console.time("frame");
        dataSet = await processFrame(arr[1]);
        console.timeEnd("frame");
      } catch (e) {
        reply(e);
        return;
      }

      const observedAlgebra = cardsToAlgebra(dataSet);
      reply(observedAlgebra);

      if (
        JSON.stringify(observedAlgebra) !== JSON.stringify(lastObservedAlgebra)
      ) {
        translatorConn.send("observer/algebra-observed", observedAlgebra);

        lastObservedAlgebra = observedAlgebra;
      }
    });
  });

  connection.on("observer/algebra-observed", ({ data, reply }) => {
    lastTranslatedAlgebra = translateAlgebra(data[0]);

    multiSocketInterface(projectorSockets).send(
      "translator/algebra-translated",
      lastTranslatedAlgebra
    );

    //reply(data[0]); //For debugging
  });
});

httpServer.listen(port, () => {
  console.log("Translator listening on port", port);
});

// logger

app.use(async (ctx, next) => {
  console.log("in middleware 0");

  await next();

  const rt = ctx.response.get("X-Response-Time");
  console.log(`${ctx.method} ${ctx.url} - ${rt}`);
});

// x-response-time

app.use(async (ctx, next) => {
  console.log("in middleware 1");
  const start = Date.now();

  await next();

  const ms = Date.now() - start;
  ctx.set("X-Response-Time", `${ms}ms`);
});

// response

app.use(async ctx => {
  console.log("in middleware 2");

  ctx.body = "Hello World";
});

app.listen(3000);

export { convertAlgebra };
