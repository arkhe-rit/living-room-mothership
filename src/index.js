/* Observer */
import { getImageCapture, drawCanvas } from "./observer/src/getFrame.js";
import { socketInterface } from "./translator/messagingInterface.js";
import observerSocket from "./translator/socket/observerSocket.js";

/* Projector */
import projectorSocket from "./translator/socket/projectorSocket.js";
import { decodeAlgebra } from "./projector/decodeCodeAlgebra";

/* Observer */
const video = document.querySelector("video");

const observerToTranslator = socketInterface(observerSocket());
const projectorToTranslator = socketInterface(projectorSocket());

document
  .querySelector("#getUserMediaButton")
  .addEventListener("click", onGetUserMediaButtonClick);

async function onGetUserMediaButtonClick() {
  let imageCapture = await getImageCapture(navigator, video);

  sendFrame();

  async function sendFrame() {
    let bitmap = await imageCapture.grabFrame();
    //drawCanvas(canvas, bitmap);
    const canvas = document.querySelector("#grabFrameCanvas");
    // canvas.style.display = "inline";
    canvas.getContext("bitmaprenderer").transferFromImageBitmap(bitmap);
    //console.log(canvas.toDataURL());
    const response = await observerToTranslator.send(
      "observer/bitmap-frame",
      canvas.toDataURL("image/png")
    );
    console.log("bitmapFrame response", response); //for debug
    setTimeout(() => requestAnimationFrame(sendFrame), 5);
    // requestAnimationFrame(sendFrame);
  }
}

/* Projector */
let stringText = "x => x";
let lastText = "x => x";

window.onload = function () {
  init();
};

async function onCopyButtonClick() {
  console.log("Copied", getDisplayText(), "to your clipboard");
  await navigator.clipboard.writeText(getDisplayText());

  if (stringText === lastText) {
    document.querySelector("#copyButton").innerText = "Copied!";
  } else {
    document.querySelector("#copyButton").innerText = "Copy";
  }
}

function getDisplayText() {
  return document.querySelector("#display").innerText;
}

async function init() {
  document
    .querySelector("#copyButton")
    .addEventListener("click", onCopyButtonClick);

  const initialState = await projectorToTranslator.send(
    "projector/initial-state"
  );

  let currentState = decodeAlgebra(initialState);

  const codeElement = document.querySelector("#display");
  document.querySelector("#display").innerText = currentState;

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

  stringText = currentState;
  lastText = initialState;
}
