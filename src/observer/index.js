import { getImageCapture, drawCanvas } from "./src/getFrame";
import { socketInterface } from "../translator/messagingInterface.js";
import observerSocket from "../translator/socket/observerSocket.js";
const video = document.querySelector("video");

document
  .querySelector("#getUserMediaButton")
  .addEventListener("click", onGetUserMediaButtonClick);

async function onGetUserMediaButtonClick() {
  document
    .querySelector("#grabFrameButton")
    .addEventListener("click", onGrabFrameButtonClick);

  let imageCapture = await getImageCapture(navigator, video);

  const translatorConn = socketInterface(observerSocket());

  async function onGrabFrameButtonClick() {
    let bitmap = await imageCapture.grabFrame();
    //drawCanvas(canvas, bitmap);
    const canvas = document.querySelector("#grabFrameCanvas");
    canvas.getContext("bitmaprenderer").transferFromImageBitmap(bitmap);
    //console.log(canvas.toDataURL());
    const response = await translatorConn.send(
      "observer/bitmap-frame",
      canvas.toDataURL("image/png")
    );
    console.log("bitmapFrame response", response); //for debug
    requestAnimationFrame(onGrabFrameButtonClick);
  }
}

document.querySelector("video").addEventListener("play", function () {
  document.querySelector("#grabFrameButton").disabled = false;
});
