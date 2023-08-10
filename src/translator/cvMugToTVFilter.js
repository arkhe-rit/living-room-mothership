//shader filter settings: [horizontalFuzzStrength, blackWhite, verticalJerkStrength, static]
const mugsToTVFilter = (msgValue) => {
    //calculate the average position of the mugs
    let avgPos = [];
    msgValue.forEach((mugPos) => {
        avgPos[0] += mugPos[0];
        avgPos[1] += mugPos[1];
    });
    avgPos[0] /= msgValue.length;
    avgPos[1] /= msgValue.length;

    const staticOpt = avgPos[0] > 0.5 ? 1 : 0;
    const verticalJerkStrength = avgPos[1] > 0.5 ? 1 : 0;
    const filterSettings = [-1, -1, verticalJerkStrength, staticOpt];
    return {
        type: 'command',
        command: 'change-filter',
        value: filterSettings
    }
}

export const cvMugToTVFilterTranslator = {
    name: 'cvMugToTVFilter',
    listeningChannel: 'observer/cvMug',
    publishingChannel: 'projector/tv',
    description: 'Averages the positions of any mugs detected and uses that position to control some of the TV\' filter settings. The average x position controls whether the screen has vertical scrollback and the average y position controls whether the screen has static.',
    callback: mugsToTVFilter
}