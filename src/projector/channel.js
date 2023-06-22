import { clientSocket } from "../translator/socket";

// Default Video State (Static)
const video = document.querySelector("video");
showVideo(0);

/*
const projectorToTranslator = clientSocket();
projectorToTranslator.on("connect", () => {
  projectorToTranslator.emit('identify/channel');
});

projectorToTranslator.on('signal/tv/channel', (inputState, reply) => {       // inputState will be an integer between 0-9
  console.log("CHANGE CHANNEL");
  let channel = Math.floor(inputState / 2);                                  // Converts inputState to a number between 0-4 for showVideo
  showVideo(channel);
})
*/

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
