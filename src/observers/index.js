import { IO } from '../toolbox/IO';
import { presence } from './presence';

const setupObservers = (socket) => {
  console.log('setting up observers');
  return presence.plugInToSocket(socket);
};

export {setupObservers};
export * from './presence';
