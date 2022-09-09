import { interpolate } from "flubber";
import { decodeAlgebra } from "./decodeFlowerAlgebra.js";
import { marksToShapes } from "./models/markToShape.js";

const paths = {
  geranium:
    "M237.8,215.6c-1.5,0.1-5.7,1-3.8,0.1c25.3-15.8,54.4-29.3,76.6-50.4c35.2-30.8,19.1-81.2-0.9-117.1c-26.5-40.5-88-17-117.1,10.7c-3.3,4.7-4.2-0.7-9-3.6C142.4,24.9,121.7,49.3,88,74c-40.5,20.2-33.6,69.3-11.6,100.1c-44.9-7.9-77.9,16.6-73.8,63.2c3.3,21.6-13.4,41,10.4,53.5c28.8,17.3,58.7,60.3,95.3,40.1c-17.1,47.3,31.2,81.2,69.9,95.9c46.5-3.1,98.4-32.8,104.2-82.1c5.6-18.6-34.9-63.3-29.2-66.3c56.7,97.7,120.1,75.5,149.6-23.3C385.1,134.4,313.9,180.4,237.8,215.6L237.8,215.6z",
  lavender:
    "M217.8,109.9c2.9-2.2,11.2-10.4,5.7-12.2-1.1-.6-6,3.9-7.8,5.7,1.7-16.5-11.4,2.2-9.2,11.6-1.1,7-.1-8.7-1.5-9.2-6.1-6.8-9.1,1.3-9.7,12.6-1.2,9,.9,17.2-4.3,24.1,0-.7,.5-1.6,.8-3,5.2-15.1-4.5-13.9-6.4-6.4-13.3-6.4-5.1,19.5-4.6,26.4,.8,1.2-1.4,4.4-1.7,5-.3-2-.8-5-2.6-5.2-5.6-4-6.1,12.5-5.9,6.2-5.5-21.6-17.3,10.6-7.5,19.5,2.3,3.1,4,5.6,1.4,9.5-.9-3.5-4.1-3.5-6.6-1.7-.2-4.2-3.3-9.1-7.4-8.7-3.4,.8-3.9,5.1-3.5,8.1-5.7-1.6-6.2,6.6-5.3,11.2,1,9.2,6.3,20.9,7.6,29.4-4.4,16.2-10.4,35.7-13.7,53-2.4-10.8-5.7-24.2-8.7-35.2-.9-5,12.1-24.5-.6-20.5,3.9-4.4,9.4-22.3-1.5-15.7,1.6-4.6,4.2-14-2.1-15.2-5.8,.6-6.4,9.2-6.5,14.3-8-8.1,8.6-25.2,1.3-31.3-1-.2-2.6,1.4-3.5,2.4,1.2-9.2-7.3-8.6-7.7-.4-2.3-4.7-6.2-12.7-1.2-17.4,6.1-7.3-1.4-12.4,4.1-18.1,4.5-11-8.6-9.5-8.2-.1-1.1,.8-3.9-.3-4.7,3.7-.7,6.3-2.5,2.3-1.9-2.6,7.2-16.5-5.5-57.6-8.2-16.8,1,4.6-6.8-12-5.7-13.5,6.6-8.9,8.7-41.7-3.7-21-6.8-9.9-6.4,5.2-9.5-1.3-2.8-4-.3-9.9,0-13.5,4.39-12.49-6.45-22.11-7.72-6.95,.52-11.94-8.6-26.76-9.08-8.85-1.3-2.8-5.3-7-6.3-10.4,3.4-6.9,2.4-40.4-8.3-28.8,.3,12.3-5.5-5.9-9.4,5.6-4.6-3.3-4.6-43.6-11.2-28C14.3,7.1,9.9-1.4,5.6,.2c-2.3,.8-2.4,3.5-1.1,5.5C.3,4.9-.5,10,2,12.4c-8.4,10,12.1,11.1,17.4,16.5,.7,1,4.3,5.6,4.9,6.3-3.4-1.2-7.6-.9-9,2.4-1.5,4.4,6.1,7,8.5,8.3-11.1,8.6,12.9,11,17.5,13.4,.9,.8,9.9,13.1,5.7,9.8-13.2-5-4.1,9.7-1.4,11.2-8,.8-5,9.3,1.5,9.3-4.2,3.7,1.2,7.9,5.9,7.6,3.5,.3,10.1-5.2,11.1-.2-1.3-.4-2.9,.1-3.4,1.4-.5,1,.2,3,1.1,4.2-2.7-.7-7,.2-6.8,3.6-.1,2.4,2.3,4.3,4.2,5-6.5,1.7-5.5,8.8,1.2,9.3,7.2,.6,17-3.7,18.5,6.6-1.5-1.2-3.8-2.2-4.3,.5-1-2.2-4-4.2-5.2-3.1-1.8,5.4-7.5-5.3-11.1,.8-2.4,5,4.2,10.2,8.4,12.8-2.1,2.1-.7,6,1.2,8.1,3.3,7.7,23.5,1.9,22.6,9-3.8-2.7-6.4,3.4-7.3,1.4-2.7-5.5-13.3-4.8-10.6,2.5,2.3,5.7,7.5,3.3,7.3,9,3.2,8.3,18.3-.8,19.6,8,4.3,8.3-4.2-1.1-5.2,6.7-2.8-4-8.8-7.6-9.3-1-.9,2.1,3.5,6,1.5,6.3-10.3,4.8,3.1,12.8,9.8,9.7,2.8,7.4,5.8,9,14.2,16,7,7.4-1.5-1.3-4.6,2.2-1.8,5.6-6.4-2.2-11-1.1-15.3,3,.6,18.3,10.2,16.9-6.9,8.3,13.7,11.7,18,18.2,.5,1.2,6.4,25.2,6.3,25.4-4.2-6.6-9.5-12.3-15.6-16.2-5-1.1-37-25-34.4-19.3,8,24.5,39.9,28.3,52.6,49,.7,40.4-11.6,89.7-8.2,131.7,1.9,10-.9,27.9,4.6,33.1,2.3-16.2-3.1-42.9-1-60.8,1.3-10,6.4-119.5,11.2-73.8,8.3,47.4,12.2,88.7,12.3,135.8,.7,2.2,3.4,2.4,3.6-.6,.7-49.3-6-107.1-17.4-159.8,1.2-15.1,9.6-31.1,21.8-39.3,76.2-35.8,14.4-28.6-12.8,2,5.3-23.6-.1-21.5,26.7-28.1,3.1-1.8,6.2-5.4,5.2-8.8,4.9-2.1,14.3-2.6,13-9.5-2.9-7.5-12.7,4.1-11.9-3.2-3.3-2.5,2.7-5.2,.5-8.2-5.6-11.6-22.3,17.2-12.7-2.8,6.8-4.5,22.4-3.3,25-12.7,0-1.5-1.4-2.5-3-2.7,5.9-2.5,13.3-14.6,3-12.9-2.1-.4-7.9,6.6-7.5,3.4,.3-2.7-1.3-3.9-3.5-4,2.1-5.7,4.4-8.8,11-9.7,14.5,1.1,34.3-21,12.9-15.4,7.1-10.2-4.7-9.6-9-2.1-.5-11.3,28.2-16.9,26.7-29-.8-1.8-2.8-2-4.7-1.6Z",
  rose: "M333.34,181.99c4.6-16.1,50.2-5.8,26.7-26.2-7.4-4.8-19-7.2-27-3.6-3.6-9.2,3.5-12.9,9.4-18.8,9.8-10.1,2.1-31.6,8.4-43.6,2.1-20.2-45-22.1-60.2-22.8-9.1-18.7-28.9-2.9-39.7,5.5-5-3-5.2-27.2-12.5-34.9-18.5,1.4-25.6-24.1-44.9-28.5-5.5-2.6-11.3-10.7-16.4-8.8-21.6,16.4-50.8,19.7-71.6,36.6-57.9-15.9,14.4,14-54.8,12-16.4,1.8,.2,31.1-3.6,42.8,5.9,24-12.6-6.4-39.8,6.5-6.5,6.2,6.2,14.5,8.2,21.8,3.3,8.8,4.1,17.3,10.2,25.1,3.1,4.3,28.4,32.5,9.1,19.3-5.7-10.6-52.1-1.1-27.9,6.1,19,5.5,35.4,20.8,44.6,37.6-4,1.7-14.9-2.4-20.1,1.5-26,13.1-13,7.1,.5,21.4,14,21.6,29.9,42.2,52.4,56.8,29.4,21.8,35.1-1.5,15.5,33.6-2.3,9-44.2,86.7-21.1,53.6,15.4-24.9,49.3-23.8,71.7-39.9,46-61.3,27.3,40.8,32.5,78.4,.4,9.5-.3,46.3,5.1,25.7,1.9-41.4-11.8-101.8,13.1-132.9,8.6,7.4,9.6,28.6,25.9,17.8,21.6-26.3,44-6.5,55.1,18.7,6,6.9,4.4-8.8,3.3-12.4-13.5-35.1-61.4-47.6,12.4-34.7,20.4-.2,44.4-6.9,63,4.7,7.2-13.7-40.6-22.7-53.5-24.8-1.7-.5-4.2-.7-2.6-1.8,3.31-7.31-8.75-8.26-15.7-10.23-1.16-.47-2.29-.88-3.39-1.21-55.72-18.85,34.95-5.88,47.69-80.36Z",
  tulip:
    "M264.85,89.89c-11.8-4-14.5,3.1-20.3,6.5-8.5-23.2-23.3,11.5-31.6,18.7-14.5,27.9-37.8,56.4-32.4,90,2,16.6,21.6,19.4,27.9,29.5-8.8,41.6-13.9,101.2-13.9,137.6-5.7-20.4-9.3-42-15.7-61.8-7.2-28.3-15.7-56.3-24.1-83.6-5.1-14.8-10.8-30.6-14.3-45.7-5.4-8.5-.5-9.2,5.9-13.2,27.1-15.5,32.2-38.8,29.4-68.8,2.7-28.1-6.9-56.5-25.6-77.1C141.55,15.89,134.55-1.41,123.45,.09c-8.6,2.4-13.1,8.2-13.8,17.2-6.7-6.4-23-7.2-34-2.1-11.9,13.2,4.3,35-17.6,14.3-6-4.6-16.8-1.2-23.9-.6-14.7,.7-10.7,19.5-10,28.8-4,28.3,4.3,23.6-19.7,.5-1.6-4.1-6.6-4.8-3.4,.7,10.3,36.6,30.8,73.8,56,100.2,23.6,21.7,49.5,16.1,77.4,15.6,9.4,30.7,19.7,62.3,29.2,93.2,5.2,18.4,10.2,38.6,15.6,57.5,1.6,6.3,2.9,12.5,4.7,19.5-18.5-44.9-49.7-87.9-96.3-106.2-106.6-27.4,119.1,38.4,115.1,227.4,.5,5.7,4.8,1.3,3-2.6-1.6-29.9-5.9-56.7-8.4-86.2-2.2-45.5,4.8-95.2,12.3-140.6,82.6,14.1,57.4-95.4,70.8-147.5-4.2-3.3-11.7,3.9-15.6,.7Z",
  circle: "M 25, 50 a 25,25 0 1,1 50,0 a 25,25 0 1,1 -50,0"
};

function svgWarp(states, animation, stateDuration, pauseDuration) {
  let progress;

  const interpolators = states
    .map((state, i) => [state, states[(i + 1) % states.length]])
    .map(([state1, state2]) => interpolate(paths[state1], paths[state2]));

  async function warp(lastState) {
    let nextState = (lastState + 1) % states.length;
    let interpolator = interpolators[lastState];

    let startTime = null;
    function animate(timeStamp) {
      if (startTime === null) startTime = timeStamp;

      if (timeStamp) {
        progress = timeStamp - startTime;
        // console.log("frame", progress, warpTime);
      }
      const timeElapsedInState = timeStamp - startTime;
      // console.log('x', timeElapsedInState);
      if (timeElapsedInState <= stateDuration) {
        animation.setAttribute(
          "d",
          interpolator((timeStamp - startTime) / stateDuration)
        );
      } else {
        animation.setAttribute("d", interpolator(1));
        // console.log("next state", nextState);
        if (timeElapsedInState > stateDuration + pauseDuration) {
          warp(nextState);
          return;
        }
      }
      requestAnimationFrame(animate);
    }

    window.requestAnimationFrame(animate);
  }

  warp(0);
}

//FOR TESTING
// svgWarp(algebra object, html element)
const shapesArray = marksToShapes(
  decodeAlgebra({
    arkhe_tag: "append",
    operands: [
      {
        arkhe_tag: "value",
        shape: "rose"
      },
      {
        arkhe_tag: "value",
        shape: "tulip"
      },
      {
        arkhe_tag: "value",
        shape: "geranium"
      },
      {
        arkhe_tag: "value",
        shape: "lavender"
      }
    ]
  })
);

// svgWarp(shapesArray, document.querySelector("#shape"), 250, 2000);
// svgWarp({
//   arkhe_tag: "identity",
// });

export default svgWarp;
