import { clientSocket } from "../translator/socket";

const video = document.querySelector("video");

const projectorToTranslator = clientSocket();




window.onload = function () {
  init();
};

// const initialState = await projectorToTranslator.send(
//   "projector/initial-state"
// );

let currentState = decodeAlgebra(initialState);

projectorToTranslator.on(eventName, (arg1, arg2, reply) => {

});

projectorToTranslator.on(
  "translator/algebra-translated",
  ({ data, reply }) => {
    console.log("Got data from translator");
    console.log(data);

    currentState = decodeAlgebra(data[0]);

    const codeElement = document.querySelector("#display");
    codeElement.innerText = currentState;

    reply(`Interpreted as:\n${currentState}`);
  }
);
