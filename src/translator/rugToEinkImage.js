let doneThrottling = true;

const rugToEinkImage = (msgValue) => {
    const image = Math.floor(msgValue.length) % 5;
    if (doneThrottling) {
        doneThrottling = false;
        setTimeout(() => {
            doneThrottling = true;
        }, 2000);
        return {
            type: 'command',
            command: 'change-image',
            value: image
        }
    }
    else {
        return undefined;
    }
}

export const rugToEinkImageTranslator = {
    name: 'rugToEinkImage',
    listeningChannel: 'observer/rug',
    publishingChannel: 'projector/eink',
    description: 'Converts the total number of feet detected by the rug divided by 2 into the image index to switch to on the eink display. Values above 4 will loop.',
    callback: rugToEinkImage
}