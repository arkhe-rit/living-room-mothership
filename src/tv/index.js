import { interpretCount, interpretLeft, interpretRight } from "../algebra/interpret";
import { clientSocket } from "../translator/socket";

const video = document.querySelector("video");

const projectorToTranslator = clientSocket();
projectorToTranslator.on("connect", () => {
  projectorToTranslator.emit('identify/tv');
});

// const initialState = await projectorToTranslator.send(
//   "projector/initial-state"
// );

// let currentState = decodeAlgebra(initialState);

projectorToTranslator.on('algebra', (alg, reply) => {
  const left = interpretLeft(alg);
  const right = interpretRight(alg);
  const count = interpretCount(alg);
  console.log(`Left: ${left}, Right: ${right}, Count: ${count}`);
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
