const mugsToTVFilter = (msg) => {
    console.log(`Mugs to TV filter received: ${msg}`);
    const filter = Math.floor(msg[2] / 90);
    return {
        type: 'command',
        command: 'change-filter',
        filter: filter
    }
}

export const mugsToTVFilterTranslator = {
    name: 'mugsToTVFilter',
    listeningChannel: 'observer/mugs',
    publishingChannel: 'projector/tv/command',
    callback: mugsToTVFilter
}