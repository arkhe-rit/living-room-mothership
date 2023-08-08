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
    description: 'Changes certain filters on the TV based on the rotation of the coaster and whether it is pressed down or now. The rotation controls the strength of the horizontal fuzz and the press controls whether the screen is greyscale or color.',
    callback: mugToTVFilter
}