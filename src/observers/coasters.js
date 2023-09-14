const angleDelta = (angle1, angle2) => {
  let delta = (angle2 - angle1 + 540) % 360 - 180;
  return delta;
}

const makeCoastersObserver = async (redisInterface) => {
  const coastersRawRotations = {};
  const coastersPercentRotations = {};
  const lastMessages = {};

  redisInterface.subscribe('observer/coasters', (message) => {
    
    
  });

  let last = {};
  const callback = (message) => {
    lastMessages[message.identity] = message;
    // console.log(coasters);
    if (message.amount >= 0.6) {
      const reading = message.azimuth_denoised;
      const angle = reading * 180 / Math.PI;
      let delta = angleDelta(last[message.identity] || 0, angle);
      last[message.identity] = angle;

      if (Math.abs(delta) < 0.2) return;
      delta = Math.max(-10, Math.min(10, delta));

      coastersRawRotations[message.identity] = (coastersRawRotations[message.identity] || 0) + delta;
      coastersRawRotations[message.identity] = Math.max(-50, Math.min(50, coastersRawRotations[message.identity]));
      
      // console.log(last[message.identity] || 0, '|', angle, '|', delta);
      // console.log(coasters);
      const percentRotation = 1 - (coastersRawRotations[message.identity] + 50) / 100;
      coastersPercentRotations[message.identity] = percentRotation;

      console.log('-'.repeat(Math.floor(percentRotation * 40)));

      return {
        type: 'algebra',
        value: coastersPercentRotations
      };
    }
  };

  return {
    name: 'observer_coasters',
    listeningChannel: 'observer/coasters/sensor',
    publishingChannel: 'observer/coasters',
    description: 'Tracks sensor readings from the coasters.',
    callback
  };
}

export {
  makeCoastersObserver
}