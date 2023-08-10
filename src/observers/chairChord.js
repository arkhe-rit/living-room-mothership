const makeChairChordObserver = (redisInterface) => {
  let chairs = {
    chair_1: 0,
    chair_2: 0,
    chair_3: 0,
    chair_4: 0
  };

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