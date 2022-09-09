import { socketInterface } from "../translator/messagingInterface.js";
import projectorSocket from "../translator/socket/projectorSocket.js";
import { marksToShapes } from "./models/markToShape.js";
import { decodeAlgebra } from "./projector/decodeCodeAlgebra";
import svgWarp from "./svgWarp.js";
window.onload = function () {
  init();
};

async function init() {
  let translatorConn = socketInterface(projectorSocket());

  const initialState = await translatorConn.send("projector/initial-state");

  let currentState = decodeAlgebra(initialState);

  svgWarp(marksToShapes(currentState), document.querySelector("#shape"));

  translatorConn.on("translator/algebra-translated", ({ data, reply }) => {
    console.log("Got data from translator");
    console.log(data);

    currentState = decodeAlgebra(data[0]);

    //draw currentState here

    //reply("sending :" + data);
    svgWarp(marksToShapes(currentState), document.querySelector("#shape"));
  });
}
