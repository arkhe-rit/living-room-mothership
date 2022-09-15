import { makeObserver } from "./makeObserver";
import { scan } from "observable-fns"

const presence = makeObserver(
  'presence',
  'sensor/pressure',
  (evtsObservable) => evtsObservable
    .pipe(scan((acc, isPressure) => {
      debugger;
      return isPressure === 1 ? 'yes' : 'no';
    }, 'no'))
);

export {presence};