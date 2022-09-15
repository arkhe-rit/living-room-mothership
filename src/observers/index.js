import { Observable } from 'observable-fns';
import { IO } from '../toolbox/IO';
import { chairChord } from './chairChord';
import { presence } from './presence';

let arkheObservers = {};

const makeChairChord = () => (
  chairChord(
    arkheObservers['78:21:84:8C:C7:90'],
    arkheObservers['94:E6:86:A7:80:2C'] || arkheObservers['presence_wrover_cam_1'],
    arkheObservers['78:21:84:8C:C7:90'],
    arkheObservers['94:E6:86:A7:80:2C'] || arkheObservers['presence_wrover_cam_1']
  )
);

const setupObservers = (socket) => {
  console.log('setting up observers');

  return new Observable(observer => {
    socket.on('identify/presence', (msg, reply) => {
      const {identity, state} = msg || {};
      console.log("IDENTIFY: PRESENCE:", msg);
      
      arkheObservers[identity] = presence(socket, state);
      arkheObservers['chair-chord'] = makeChairChord();
  
      observer.next(arkheObservers);
    });
  
    arkheObservers['chair-chord'] = makeChairChord();
  
    observer.next(arkheObservers);
  });
};

export {setupObservers};
export * from './presence';
