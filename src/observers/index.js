import { IO } from '../toolbox/IO';
import { presence } from './presence';

const setupObservers = (socket) => {
  console.log('setting up observers');
  debugger;
  return IO()
    .flatMap(() => {
      debugger;
      return presence.plugInToSocket(socket);
    });
};

export {setupObservers};
export * from './presence';
