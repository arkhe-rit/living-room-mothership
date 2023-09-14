import { createTranslatorEngine } from "../translator/translatorEngine.js";
import { makeChairChordObserver } from "./chairChord.js";
import { makeCoastersObserver } from "./coasters.js";

const rawObservers = async (redisInterface) => [
  await makeChairChordObserver(redisInterface),
  await makeCoastersObserver(redisInterface)
];

const createObserverEngine = (messageBus) => {
  const translators = {};

  const engine = {
    register: (translator) => {
      translators[translator.name] = translator;
      return engine;
    },
    start: () => {
      Object.values(translators).forEach(translator => {
        messageBus.subscribe(translator.listeningChannel, (msg) => {
          const translatedMessage = JSON.stringify(translator.callback(msg.value || msg));
          if (translatedMessage)
            messageBus.publish(translator.publishingChannel, translatedMessage);
        });
      });
    },
    stop: () => {
      Object.values(translators).forEach(translator => {
        messageBus.unsubscribe(translator.listeningChannel);
      });
    }
  };

  return engine;
}

export { 
  createObserverEngine,
  rawObservers
};