import { scan } from 'observable-fns';
import { chairChordAlg } from '../algebra/chairChord';
import { chairChord } from './chairChord';

let arkheObservers = {};

const makeChairChord = () => (
  chairChord(
    arkheObservers['78:21:84:8C:C7:90'],
    arkheObservers['94:E6:86:A7:80:2C'] || arkheObservers['presence_wrover_cam_1'],
    arkheObservers['78:21:84:8C:C7:90'],
    arkheObservers['94:E6:86:A7:80:2C'] || arkheObservers['presence_wrover_cam_1']
  )
);

const sensorState = (obsMessages) => {
  return obsMessages
    .pipe(scan((acc, msg) => {
      

      if (msg.type === 'sensor/pressure' && msg.identity === 'chair_1') {
        return {...acc, chair_1: msg.value === 1};
      }
      if (msg.type === 'sensor/pressure' && msg.identity === 'chair_2') {
        return {...acc, chair_2: msg.value === 1};
      }
      if (msg.type === 'sensor/pressure' && msg.identity === 'chair_3') {
        return {...acc, chair_3: msg.value === 1};
      }
      if (msg.type === 'sensor/pressure' && msg.identity === 'chair_4') {
        return {...acc, chair_4: msg.value === 1};
      }

      return acc;
    }, {}));
}

const observationsFromSensors = (sensorStateObs) => {
  return sensorStateObs
    .map(state => {
      const {identity: id, append: app, value} = chairChordAlg;
      return app([
        state['chair_1'] ? value('chair_1') : id(),
        state['chair_2'] ? value('chair_2') : id(),
        state['chair_3'] ? value('chair_3') : id(),
        state['chair_4'] ? value('chair_4') : id()
      ]);
    })
}

const makeObservations = (obsMessages) => {
  return observationsFromSensors(sensorState(obsMessages));
};

export {makeObservations};
