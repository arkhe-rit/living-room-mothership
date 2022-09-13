import Koa from "koa";
import { createServer } from "http";
import { networkInterfaces } from 'os';
import { Server as SocketIOServer } from "socket.io";

import { clientSocket, identifySocketAs } from "./socket";
import { socketInterface, multiSocketInterface } from "./messagingInterface";
import { convertAlgebra } from "./decodeAlgebra";

import { sortCardsArr, cardsToAlgebra } from "../algebra/observer";

const isDevEnvironment = process.env.ENV === "DEV" || !process.env.ENV;
if (isDevEnvironment)
  console.log("In dev environment");

const app = new Koa();
const httpServer = createServer(app.callback());
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: isDevEnvironment ? "" : "https://web-client-arkhe.herokuapp.com"
  },
  maxHttpBufferSize: 1e8
});

const port = process.env.PORT;

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

  setTimeout(() => {
    connection.send('test', {a: {b: ['c', 1]}});
  }, 6000);

  // console.time('pressure reading');
  socket.on("pressure_reading", (msg) => {
    // console.timeEnd('pressure reading');
    // console.time('pressure reading');
    console.log("Received:", msg.value);
  });

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

      
      reply('received');
    });
  });

  connection.on("observer/algebra-observed", ({ data, reply }) => {
    // lastTranslatedAlgebra = translateAlgebra(data[0]);

    // multiSocketInterface(projectorSockets).send(
    //   "translator/algebra-translated",
    //   lastTranslatedAlgebra
    // );

    //reply(data[0]); //For debugging
  });
});

httpServer.listen(port, () => {
  const ipAddress = networkInterfaces()?.['Wi-Fi']
    ?.find(intf => intf.family === 'IPv4')
    ?.address;

  console.log(`Translator listening at ${ipAddress}:${port}`);
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
