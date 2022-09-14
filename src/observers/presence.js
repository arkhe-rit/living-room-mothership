import { makeObserver } from "./makeObserver";
import { scan } from "observable-fns"


const presence = makeObserver(
  'sensor/pressure',
  (evtsObservable) => evtsObservable
    .pipe(scan((acc, isPressure) => {
      debugger;
      return isPressure === 'yes' ? 'yes' : 'no', 'no';
    }, 'no'))
);

export {presence};