import { interpretCount } from '../algebra/interpret.js';

const chairsToTV = (obs) => {
    const count = interpretCount(obs);
    return {
        type: 'command',
        command: 'change-video',
        channel: count
    }
}

export const chairsToTVTranslator = {
  name: 'chairsToTVChannel',
  listeningChannel: 'observer/chairs',
  publishingChannel: 'projector/tv/command',
  callback: chairsToTV
}