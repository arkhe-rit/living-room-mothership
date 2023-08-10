const chairsToLamps = (msgValue) => {
    return {
        type: 'command',
        command: 'set-lamps',
        value: [msgValue[2] > 0 || msgValue[3] > 0, msgValue[0] > 0 || msgValue[1] > 0]
    }
}

export const chairsToLampsTranslator = {
    name: 'chairsToLamps',
    listeningChannel: 'observer/chairs',
    publishingChannel: 'projector/lamps/command',
    description: 'Controls whether the lamps are on or off based on if certain chairs have someone sitting in them.',
    callback: chairsToLamps
}