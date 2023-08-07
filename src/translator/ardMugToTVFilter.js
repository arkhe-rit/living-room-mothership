//shader filter settings: [horizontalFuzzStrength, blackWhite, verticalJerkStrength, static]
const maxHorizontalFuzzz = 0.008
const mugToTVFilter = (msgValue) => {
    const blackWhite = msgValue[1];
    const mugRotationPercent = msgValue[0] / 39;
    const horizontalFuzzStrength = mugRotationPercent * maxHorizontalFuzzz;
    const filterSettings = [horizontalFuzzStrength, blackWhite, -1, -1];
    return {
        type: 'command',
        command: 'change-filter',
        value: filterSettings
    }
}

export const ardMugToTVFilterTranslator = {
    name: 'ardMugToTVFilter',
    listeningChannel: 'observer/ardMug',
    publishingChannel: 'projector/tv',
    callback: mugToTVFilter
}