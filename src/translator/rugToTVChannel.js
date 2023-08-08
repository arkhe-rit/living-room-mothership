const rugToTVChannel = (msgValue) => {
    const channel = msgValue.length % 5;
    return {
        type: 'command',
        command: 'change-video',
        value: channel
    }
}

export const rugToTVChannelTranslator = {
    name: 'rugToTVChannel',
    listeningChannel: 'observer/rug',
    publishingChannel: 'projector/tv',
    description: 'Converts the total number of feet detected by the rug into the channel to switch to on the TV. Values above 4 will loop.',
    callback: rugToTVChannel
}