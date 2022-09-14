import { IO } from '../toolbox/IO';
import { presence } from './presence';

const setupObservers = (socket) => {
  console.log('setting up observers');

  const presenceObserver = presence(socket);

  return presenceObserver;
};

export {setupObservers};
export * from './presence';
