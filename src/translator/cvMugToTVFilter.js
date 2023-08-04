//shader filter settings: [horizontalFuzzStrength, blackWhite, verticalJerkStrength, static]
const mugsToTVFilter = (msg) => {
    const staticOpt = msg.value[0] > 0.5 ? 1 : 0;
    const verticalJerkStrength = msg.value[1] > 0.5 ? 1 : 0;
    const filterSettings = [-1, -1, verticalJerkStrength, staticOpt];
    return {
        type: 'command',
        command: 'change-filter',
        filter: filterSettings
    }
}

export const cvMugToTVFilterTranslator = {
    name: 'cvMugsToTVFilter',
    listeningChannel: 'observer/cvMugs',
    publishingChannel: 'projector/tv',
    callback: mugsToTVFilter
}