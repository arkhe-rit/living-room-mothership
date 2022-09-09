const { createWorker, createScheduler } = Tesseract;
const scheduler = createScheduler();
const video = document.querySelector("#webcam");
let timer = null;

window.onload = () => {
  init();
};

const init = async () => {
  getVideo();
  loadOCR();
};

const getVideo = async () => {
  console.log("Loading webcam...");
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
  console.log("Webcam loaded.");
};

const loadOCR = async () => {
  console.log("Loading Tesseract.js...");
  for (let i = 0; i < 4; i++) {
    const worker = createWorker();
    await worker.load();
    await worker.loadLanguage("eng");
    await worker.initialize("eng");
    scheduler.addWorker(worker);
  }
  console.log("Tesseract.js finished loading.");
};

const ocr = async () => {
  const readerCanvas = document.createElement("canvas");
  readerCanvas.width = 640;
  readerCanvas.height = 480;
  readerCanvas.getContext("2d").drawImage(video, 0, 0, 640, 360);
  const now = new Date().toLocaleTimeString();
  const {
    data: { text }
  } = await scheduler.addJob("recognize", readerCanvas);
  console.log(`${now}: [${text}]`);
};

(async () => {
  video.addEventListener("play", () => {
    timer = setInterval(ocr, 1000);
  });
})();
