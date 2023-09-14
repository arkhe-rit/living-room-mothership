
const maxHorizontalFuzzz = 0.008
const coasterToTVFilter = (msgValue) => {
  console.log(msgValue);
  const {coaster_1} = msgValue;

  return {
    type: 'command',
    command: 'change-filter',
    value: {
      // horizontal_tear_strength: coaster_1,
      black_white: coaster_1 > 0.5 ? 1 : 0,
      vertical_jerk: coaster_1,
      chromatic_aberration: coaster_1
    }
  }
}

export const coastersToTVFilterTranslator = {
  name: 'coastersToTVChannel',
  listeningChannel: 'observer/coasters',
  publishingChannel: 'projector/tv',
  description: 'Converts the rotation of a mug to a modified TV filter.',
  callback: coasterToTVFilter
}