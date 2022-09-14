import { IO } from '../toolbox/IO';
import { presence } from './presence';

const setupObservers = (socket) => {
  console.log('setting up observers');

  const presenceObserver = presence(socket);

  socket.on('identify/presence', (msg, reply) => {
    console.log("Received:", msg.value);
    observer.next(msg.value)
  });


  return presenceObserver;
};

export {setupObservers};
export * from './presence';
