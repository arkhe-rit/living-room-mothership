import { createClient } from "redis";

const createRedisInterface = async () => {
  const pubClient = createClient({
    url: "redis://redis:6379"
  });
  const subClient = pubClient.duplicate();

  await pubClient.connect();
  await subClient.connect();

  return {
    publish: (channel, message) => {
      pubClient.publish(channel, message);
    },
    subscribe: (channel, callback) => {
      subClient.subscribe(channel, callback);
    },
    unsubscribe: (channel) => {
      subClient.unsubscribe(channel);
    }
  };
};

const chairChordObserver = (redisInterface) => {
  let chairs = {
    chair_1: 0,
    chair_2: 0,
    chair_3: 0,
    chair_4: 0
  };

  redisInterface.subscribe("observer/chairs/sensor", (message) => {
    console.log(message);

    const reading = JSON.parse(message)[1];
    const {identity: chair_identity, weight_reading_denoised: weight} = reading;
    chairs[chair_identity] = weight;

    const observation = {
      type: 'algebra',
      value: [chairs.chair_1, chairs.chair_2, chairs.chair_3, chairs.chair_4]
    };

    redisInterface.publish("observer/chairs", JSON.stringify(observation));
  });

  return () => {
    redisInterface.unsubscribe("observer/chairs/sensor");
  }
}

export { createRedisInterface, chairChordObserver };