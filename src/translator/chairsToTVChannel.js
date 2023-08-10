const chairsToTV = (msgValue) => {
    const count = msgValue.reduce((acc, chair) => {
      chair = parseInt(chair);
      return chair > 0 ? acc + 1 : acc
    }, 0);

    return {
        type: 'command',
        command: 'change-video',
        value: count
    }
}

export const chairsToTVTranslator = {
  name: 'chairsToTVChannel',
  listeningChannel: 'observer/chairs',
  publishingChannel: 'projector/tv',
  description: 'Converts the number of chairs that detect someone sitting in them to change the TV channel.',
  callback: chairsToTV
}