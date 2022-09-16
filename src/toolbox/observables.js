import { IO } from "./IO"

const latest = (observable, initialValue) => {
  let lastVal = initialValue;

  observable.subscribe(val => {
    lastVal = val;
  });

  return IO(() => {
    return lastVal;
  });
};

export { latest }