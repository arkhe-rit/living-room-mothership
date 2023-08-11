
const validateIsOneOf = (validValuesArray) => (value) => {
  if (validValuesArray.indexOf(value) === -1) {
    throw new Error(`Invalid: ${value} is not one of ${validValuesArray}`);
  }
};

const makeChairChordObserver = async (redisInterface) => {
  let chairs = await redisInterface.fetch('observer/chairs', {
    chair_1: { value: 0, zero: 0, high: 1 },
    chair_2: { value: 0, zero: 0, high: 1 },
    chair_3: { value: 0, zero: 0, high: 1 },
    chair_4: { value: 0, zero: 0, high: 1 },
    threshold: 0.5
  }); 

  console.log(chairs);

  const validateChairName = validateIsOneOf(Object.keys(chairs));

  const commands = {
    'set-zero': (chair) => {
      console.log('set-zero', chair)
      validateChairName(chair);
      chairs[chair].zero = chairs[chair].value;
    },
    'set-high': (chair) => {
      validateChairName(chair);
      chairs[chair].high = chairs[chair].value;
    },
    'set-threshold': (threshold) => {
      chairs.threshold = threshold;
    }
  };

  const queries = {
    value: (chair) => {
      validateChairName(chair);
      return chairs[chair].value;
    },
    zero: (chair) => {
      validateChairName(chair);
      return chairs[chair].zero;
    },
    high: (chair) => {
      validateChairName(chair);
      return chairs[chair].high;
    },
    threshold: () => {
      return chairs.threshold;
    }
  };

  // on a observer/chairs message with type = query, do thing
  redisInterface.subscribe('observer/chairs', (message) => {
    // { type: 'command', command: 'zero', value: 'chair_1 }
    
    if (message.type === 'command') {
      commands[message.command](message.value);
      redisInterface.store('observer/chairs', chairs);
    } else if (message.type === 'query') {
      const chairName = message.value;

      const response = {
        type: 'response',
        value: queries[message.query](chairName)
      };
      redisInterface.publish(`observer/chairs/response`, response);
    }
  });

  return {
    name: 'observer_chairChord',
    listeningChannel: 'observer/chairs/sensor',
    publishingChannel: 'observer/chairs',
    description: 'Tracks sensor readings from the four chairs and publishes the algebra of chairs.',
    callback: (message) => {
      // {"type": "asdf", "value": ["nada",{"identity":"chair_2","weight_reading_denoised":3,"reading":5}]}
      const reading = message[1];

      const {identity: chair_identity, weight_reading_denoised: weight} = reading;
      chairs[chair_identity] = weight;
      
      if (chair_identity === "chair_1") {
        chairs.chair_1 = reading.reading > 1000 ? 1 : 0;
      } else if (chair_identity === "chair_3") {
        // chairs.chair_3 = reading.value;
        chairs.chair_3 = reading.weight_reading_denoised > 0 ? 1 : 0;
      } else if (chair_identity === "chair_4") {
        // chairs.chair_4 = reading.value;
        // console.log('------', reading.weight_reading_denoised);
        chairs.chair_4 = reading.weight_reading_denoised > 1000 ? 1 : 0;
      }

      return {
        type: 'algebra',
        value: [chairs.chair_1, chairs.chair_2, chairs.chair_3, chairs.chair_4]
      };
    }
  };
}

export {
  makeChairChordObserver
}