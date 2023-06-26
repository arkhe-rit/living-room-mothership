import { clientSocket } from "../translator/socket/index.js";

const serverSocket = clientSocket();

serverSocket.on("connect", () => {
  console.log("connected to server through channel.js");
});
serverSocket.emit("publish", { channel: "test", message: "Message" });





function showVideo(i) {
  document.querySelectorAll('video').forEach(elem => {
    elem.style.display = 'none';
  })

  if (i === 0) document.querySelector('#static').style.display = 'block';
  if (i === 1) document.querySelector('#luckyStrike').style.display = 'block';
  if (i === 2) document.querySelector('#heroquest').style.display = 'block';
  if (i === 3) document.querySelector('#rocCommercials').style.display = 'block';
  if (i === 4) document.querySelector('#travis').style.display = 'block';

}

export { showVideo };
