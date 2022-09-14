import { IO } from "../toolbox/IO";
import { Observable, multicast } from "observable-fns"

const makeObserver = (
  socketMessageName,
  evtsToState
) => {
  return (socket) => ({
    sendControlMessage: (msgName, msg) => {
      socket.emit(msgName);
    },
    observerState: (
      multicast(new Observable(observer => {
        debugger;
        const listener = (msg, reply) => {
          console.log("Received:", msg.value);
          observer.next(msg.value)
        };

        console.log(`Plugging "${socketMessageName}" into socket server`);
        socket.on(socketMessageName, listener);
    
        return () => socket.removeListener(socketMessageName, listener)
      }))
      .pipe(evtsToState)
    )
  })
}

export { makeObserver };