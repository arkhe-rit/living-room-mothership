const rugToTVChannel = (msgValue) => {
    const channel = msgValue % 5;
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
    callback: rugToTVChannel
}