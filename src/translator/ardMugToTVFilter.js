//shader filter settings: [horizontalFuzzStrength, blackWhite, verticalJerkStrength, static]
const maxHorizontalFuzzz = 0.008
const mugToTVFilter = (msg) => {
    const blackWhite = msg.value[1];
    const mugRotationPercent = msg.value[0] / 360.0;
    const horizontalFuzzStrength = mugRotationPercent * maxHorizontalFuzzz;
    const filterSettings = [horizontalFuzzStrength, blackWhite, -1, -1];
    return {
        type: 'command',
        command: 'change-filter',
        value: filterSettings
    }
}

export const ardMugToTVFilter = {
    name: 'ardMugToTVFilter',
    listening: 'observer/ardMug',
    publishing: 'projector/tv',
    callback: mugToTVFilter
}