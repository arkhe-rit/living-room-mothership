async function getImageCapture(navigator, video) {
  return navigator.mediaDevices
    .getUserMedia({
      video: {
        mandatory: {
          minWidth: 1280,
          minHeight: 720
          // minWidth: 1920,
          // minHeight: 1080
        }
      }
    })
    .then(mediaStream => {
      video.srcObject = mediaStream;

      const track = mediaStream.getVideoTracks()[0];
      imageCapture = new ImageCapture(track);
      return imageCapture;
    })
    .catch(error => {
      console.log(error);
      throw error;
    });
}

function drawCanvas(canvas, img) {
  canvas.width = getComputedStyle(canvas).width.split("px")[0];
  canvas.height = getComputedStyle(canvas).height.split("px")[0];
  let ratio = Math.min(canvas.width / img.width, canvas.height / img.height);
  let x = (canvas.width - img.width * ratio) / 2;
  let y = (canvas.height - img.height * ratio) / 2;
  canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
  canvas
    .getContext("2d")
    .drawImage(
      img,
      0,
      0,
      img.width,
      img.height,
      x,
      y,
      img.width * ratio,
      img.height * ratio
    );
}

export { getImageCapture, drawCanvas };
