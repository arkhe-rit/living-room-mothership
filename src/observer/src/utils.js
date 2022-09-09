//import refCardPaths from "../../translator/refCards";

//ENCODE REFPATHS TO B64
// const encodeRefPaths = () => {
//   const reader = new FileReader();
//   Object.values(refCardPaths).forEach(val => {
//     reader.readAsDataURL(val);
//     reader.onload = () => {
//       val = reader.result.split(",")[1];
//     }
//   });
// }

//THROTTLE
const throttle = (func, limit) => {
  let isThrottled;
  return function () {
    const args = arguments;
    const context = this;
    if (!isThrottled) {
      func.apply(context, args);
      isThrottled = true;
      setTimeout(() => (isThrottled = false), limit);
    }
  };
};

//GET VIDEO
const getVideo = async video => {
  console.log("Loading webcam...");
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      mandatory: {
        minWidth: 1920, //1280,
        minHeight: 1080 //720
      }
    }
  });
  video.srcObject = stream;
  console.log("Webcam loaded.");
};

//ALGEBRA
const arkheAppend = operands => {
  return {
    arkhe_tag: "append",
    operands: operands
  };
};

const arkheValue = (value, details) => {
  return {
    arkhe_tag: "value",
    value: value,
    details
  };
};

const arkheIdentity = () => {
  return {
    arkhe_tag: "identity"
  };
};

const arkheValueFromPy = pyData => {
  if (!pyData || pyData.length === 0) {
    return arkheIdentity();
  }

  if (pyData.length === 1) {
    return arkheValue(pyData[0].object, {
      corners: pyData[0].corners,
      center: pyData[0].center
    });
  }

  return arkheAppend(
    pyData.map(cardObj => {
      return arkheValue(cardObj.object, {
        corners: cardObj.corners,
        center: cardObj.center
      });
    })
  );
};

export {
  throttle,
  getVideo,
  arkheAppend,
  arkheValueFromPy
  //encodeRefPaths
};
