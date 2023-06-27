/*
  clientSocket just creates and sets up a socket.io socket
  for a client to use. Attaches some handshake messaging,
  reconnection timeout, logging etc.
*/
import { io } from "socket.io-client";
const isDevEnvironment = process.env.ENV === "DEV" || !process.env.ENV;
const clientSocket = () => {
  // Establish a connection
  const socket = io(
    isDevEnvironment
      ? "http://localhost:5555"
      : "https://arkhe-api.herokuapp.com/",
    {
      transports: ["websocket"],
      "force new connection": true,
      reconnectionAttempts: Infinity,
      timeout: 10000
    }
  );
  let id = null;

  socket.on("connect", () => {
    id = socket.id;
    console.log(`Connected to socket ${socket.id}`);
  });

  const reconnect = reconnectionTimeout => {
    reconnectionTimeout = reconnectionTimeout * 2;

    const s = Math.floor(reconnectionTimeout / 1000);
    const ms = reconnectionTimeout % 1000;
    const timeoutStr =
      s === 0 ? `${ms}ms` : `${s}s ${ms > 0 ? `${ms}ms` : ""}`.trim();

    console.log(`Attempting reconnection in ${timeoutStr}...`);
    setTimeout(() => {
      socket.connect();
    }, reconnectionTimeout);
  };

  socket.on("disconnect", (reason, details) => {
    console.log(`Disconnected from socket ${id}: ${reason}`);
    // in that case, details is an error object
    console.log("--", "Msg: ", details.message);
    ("xhr post error");
    console.log("--", "Desc: ", details.description); // 413 (the HTTP status of the response)

    // details.context refers to the XMLHttpRequest object
    console.log("--", "Status: ", details.context.status); // 413
    console.log("--", "RespText: ", details.context.responseText); // ""

    reconnect(25);
    //id = null;
  });

  let reconnectionTimeout = 250;
  socket.on("connect_error", err => {
    console.log(`Socket connection error: ${err.message}`);
    reconnect(25);
  });



  return socket;
};

export default clientSocket;
