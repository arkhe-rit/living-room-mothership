import cp from "child_process";

export const startPython = (refs, debug) => {
  let stdErrChunks = [];

  console.log("Spawning...");
  const pythonProcess = cp.spawn("python", [
    "./src/observer/src/detectCard.py"
  ]); //Child process

  //On receiving error output data
  pythonProcess.stderr.on("data", async data => {
    stdErrChunks = stdErrChunks.concat(data);
    console.log("Logging error...");
    console.log(data.toString());
  });

  //On error output ended
  pythonProcess.stderr.on("end", async () => {
    let stderrContent = Buffer.concat(stdErrChunks).toString();
    console.log("stderr chars:", stderrContent.length);
    console.log(stderrContent);
    // if (stderrContent.length > 0) reject(stderrContent);
  });

  //On process closed
  pythonProcess.on("close", async (code, signal) => {
    console.log(
      `Child process closed all stdio with code ${code} and ${signal}`
    );
  });

  pythonProcess.on("error", async err => {
    console.log("Fatal error in python process:");
    console.log(err);
    throw err;
  });

  let params = {
    refs: refs,
    debug: debug
  };

  console.log("writing initial params", params);
  pythonProcess.stdin.write(JSON.stringify(params) + "\n");

  return pythonProcess;
};

let i = 0;

export const processFrame = pythonProcess => async image => {
  return new Promise((resolve, reject) => {
    let cardsDetected = [];

    //Write data to standard input
    const frameData = {
      image
    };
    console.log("writing frame");
    pythonProcess.stdin.write(JSON.stringify(frameData) + "\n");

    pythonProcess.stdout.once("data", resultsListener);
    pythonProcess.stderr.on("data", errorListener);

    async function resultsListener(data) {
      console.log("Pipe data from python script...");
      const results = JSON.parse(data.toString());
      console.log(results);

      cardsDetected = results.map(cardObj => ({
        object: cardObj.object,
        corners: cardObj.points,
        center: cardObj.center
      }));

      pythonProcess.stderr.off("data", errorListener);

      resolve(cardsDetected);
    }

    async function errorListener(data) {
      const dataS = data.toString();
      if (dataS.startsWith("LOG") === false) {
        pythonProcess.stderr.off("data", errorListener);
        reject(new Error(dataS));
      }
    }
  });
};

import { readFileSync } from "fs";
export const _testRelay = async imageFile => {
  const bitmapBase64 = readFileSync(imageFile, { encoding: "base64" });

  const refs = {
    // geranium: "./src/observer/img/geraniumCard_small.png",
    // lavender: "./src/observer/img/lavenderCard_small.png",
    // rose: "./src/observer/img/roseCard_small.png",
    // tulip: "./src/observer/img/tulipCard_small.png"

    // officeToZoom: "./src/observer/img/office_to_zoom.jpg",
    // homeToOffice: "./src/observer/img/home_to_office.jpg",

    // addOne: "./src/observer/img/travis_testing/addOne.png",
    // addThree: "./src/observer/img/travis_testing/addThree.png",
    // homeToRIT: "./src/observer/img/travis_testing/homeToRIT.png",
    // RITtoClass: "./src/observer/img/travis_testing/RITtoClass.png"
    addOne: "./src/observer/img/travis_testing/addOne_nb.png",
    addThree: "./src/observer/img/travis_testing/addThree_nb.png",
    homeToRIT: "./src/observer/img/travis_testing/homeToRIT_nb.png",
    RITtoClass: "./src/observer/img/travis_testing/RITtoClass_nb.png"
  };

  try {
    const process = await startPython(refs, true);

    const findCards = processFrame(process);

    const results = await findCards(bitmapBase64);
    console.log("Results:\n", results);

    // const results2 = await findCards(bitmapBase64);
    // console.log("Results2:\n", results2);

    return results;
  } catch (e) {
    console.log("Errors:\n", e);
    return [];
  }
};
