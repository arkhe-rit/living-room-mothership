import { merge, Observable, scan } from "observable-fns";

const emptyPresenceObserver = {
  observerState: Observable.from(['no'])
};

const chairChord = (
  presence1 = emptyPresenceObserver,
  presence2 = emptyPresenceObserver,
  presence3 = emptyPresenceObserver,
  presence4 = emptyPresenceObserver
) => ({
  tag: 'chair-chord',
  observerState: (() => {
    return merge(
      presence1.observerState.map(val => ['presence1', val]), 
      presence2.observerState.map(val => ['presence2', val]), 
      presence3.observerState.map(val => ['presence3', val]), 
      presence4.observerState.map(val => ['presence4', val])
    ).pipe(
      scan(
        (acc, [name, val], i) => {
          return {
            ...acc,
            [name]: val
          };
        }, 
        {}
      )
    )
  })()
});

export { chairChord };