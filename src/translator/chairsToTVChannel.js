const chairsToTV = (msgValue) => {
    const count = msgValue.reduce((acc, chair) => chair > 0? acc++ : 0, 0);
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
  description: 'Converts the number of chairs that detect someone sitting in them to change the TV channel.',
  callback: chairsToTV
}