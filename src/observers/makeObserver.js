import { IO } from "../toolbox/IO";
import { Observable, multicast } from "observable-fns"

const makeObserver = (
  socketMessageName
) => {
  return {
    plugInToSocket: (socket) => IO(() => {
      return multicast(new Observable(observer => {
        const listener = (msg, reply) => {
          console.log("Received:", msg.value);
          observer.next(msg.value)
        };

        console.log(`Plugging "${socketMessageName}" into socket server`);
        socket.on(socketMessageName, listener);
    
        return () => socket.removeListener(socketMessageName, listener)
      }));
    })
  }
}

export { makeObserver };