import Koa from "koa";
import { createServer } from "http";
import { networkInterfaces } from 'os';
import { Server as SocketIOServer } from "socket.io";

import { clientSocket, identifySocketAs } from "./socket";
import { socketInterface, multiSocketInterface } from "./messagingInterface";
import { convertAlgebra } from "./decodeAlgebra";

import { sortCardsArr, cardsToAlgebra } from "../algebra/observer";
import { setupSocketIO } from "./setupSocketIO";

const port = process.env.PORT;
const isDevEnvironment = process.env.ENV === "DEV" || !process.env.ENV;
if (isDevEnvironment)
  console.log("In dev environment");

const app = new Koa();
const httpServer = createServer(app.callback());

const obsSockets = setupSocketIO(httpServer);

httpServer.listen(port, () => {
  const ipAddress = networkInterfaces()?.['Wi-Fi']
    ?.find(intf => intf.family === 'IPv4')
    ?.address;

  console.log(`Translator listening at ${ipAddress}:${port}`);
});

app.listen(3000);

