//shader filter settings: [horizontalFuzzStrength, blackWhite, verticalJerkStrength, static]
const mugsToTVFilter = (msgValue) => {
    const staticOpt = msgValue[0] > 0.5 ? 1 : 0;
    const verticalJerkStrength = msgValue[1] > 0.5 ? 1 : 0;
    const filterSettings = [-1, -1, verticalJerkStrength, staticOpt];
    return {
        type: 'command',
        command: 'change-filter',
        filter: filterSettings
    }
}

export const cvMugToTVFilterTranslator = {
    name: 'cvMugToTVFilter',
    listeningChannel: 'observer/cvMug',
    publishingChannel: 'projector/tv',
    callback: mugsToTVFilter
}