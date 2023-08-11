const mugsToEinkImage = (msgValue) => {
    return {
        type: 'command',
        command: 'change-image',
        value: msgValue.length
    }
}

export const cvMugToEinkImageTranslator = {
    name: 'cvMugToEinkImage',
    listeningChannel: 'observer/cvMug',
    publishingChannel: 'projector/eink',
    description: 'Displays an image on the e-ink display. The number of mugs detected controls which image is displayed.',
    callback: mugsToEinkImage
}