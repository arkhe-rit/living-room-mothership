import { interpretLeft, interpretRight } from '../algebra/interpret.js';

const chairsToLamps = (obs) => {
    const left = interpretLeft(obs);
    const right = interpretRight(obs);
    return {
        type: 'command',
        command: 'set-lamps',
        lamps: [['chair_3', 'chair_4'].includes(right), ['chair_1', 'chair_2'].includes(left)]
    }
}

export const chairsToLampsTranslator = {
    name: 'chairsToLamps',
    listeningChannel: 'observer/chairs',
    publishingChannel: 'projector/lamps/command',
    callback: chairsToLamps
}