import { IO } from "../toolbox/IO";
import { Observable, multicast } from "observable-fns"

const makeObserver = (
  tag,
  socketMessageName,
  evtsToState
) => {
  return (socket, initialState) => ({
    tag,
    socket,
    observerState: (() => {
      const state = new Observable(observer => {
        const listener = (msg, reply) => {
          console.log("Received:", msg.value);
          observer.next(msg.value)
        };

        console.log(`Plugging "${socketMessageName}" into socket server`);
        socket.on(socketMessageName, listener);
    
        return () => socket.removeListener(socketMessageName, listener)
      }); 
      
      return multicast(
        Observable.from([initialState]).concat(state)
          .pipe(evtsToState)
      );
    })()
  })
}

export { makeObserver };