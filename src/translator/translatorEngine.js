import { createBusClient } from '../toolbox/messageBusClient.js';
import { chairsToLampsTranslator } from './chairsToLamps.js';
import { chairsToTVTranslator } from './chairsToTVChannel.js';
import { cvMugToTVFilterTranslator } from './cvMugToTVFilter.js';
import { ardMugToTVFilterTranslator } from './ardMugToTVFilter.js';
import { rugToTVChannelTranslator } from './rugToTVChannel.js';

const rawTranslators = [
  chairsToLampsTranslator,
  chairsToTVTranslator,
  cvMugToTVFilterTranslator,
  ardMugToTVFilterTranslator,
  rugToTVChannelTranslator
]

// Create a dictionary of translators for easier reference later
const translators = {};
rawTranslators.forEach(translator => {
  translators[translator.name] = translator;
});

const createTranslatorEngine = () => {
  const messageBus = createBusClient()();
  messageBus.subscribe('translator', (msg) => {
    switch (msg.type) {
      case 'command':
        switch (msg.command) {
          case 'activate-translator':
            activateTranslator(msg.value);
            break;
          case 'deactivate-translator':
            deactivateTranslator(msg.value);
            break;
          case 'get-active-translators':
            const activeTranslators = Object.keys(translators).map(translatorName => {
              return {
                name: translatorName,
                description: translators[translatorName].description
              }
            }).filter(translator => translators[translator.name].enabled);
            const response = {
              type: 'response',
              responseTo: 'get-active-translators',
              value: activeTranslators
            }
            messageBus.publish('translator', JSON.stringify(response));
            break;
          default:
            console.log(`Unknown command: ${msg.command}`)
            break;
        }
        break;
      case 'response': break;
      default:
        console.log(`Unknown message type: ${msg.type}`)
    }
  });

  const activateTranslator = (translatorName) => {
    if (!Object.keys(translators).includes(translatorName)) {
      console.log(`Unknown translator: ${translatorName}`);
      return;
    }
    const desiredTranslator = translators[translatorName];
    if (desiredTranslator.enabled) {
      console.log(`Translator ${translatorName} is already enabled`);
      return;
    }
    messageBus.subscribe(desiredTranslator.listeningChannel, (msg) => {
      if (msg.type === 'algebra') {
        const translatedMessage = JSON.stringify(desiredTranslator.callback(msg.value));
        messageBus.publish(desiredTranslator.publishingChannel, translatedMessage);
      }
    });
    desiredTranslator.enabled = true;
  };

  const deactivateTranslator = (translatorName) => {
    if (!Object.keys(translators).includes(translatorName)) {
      console.log(`Unknown translator: ${translatorName}`);
      return;
    }
    const desiredTranslator = translators[translatorName];
    if (!desiredTranslator.enabled) {
      console.log(`Translator ${translatorName} is already disabled`);
    }
    messageBus.unsubscribe(translatorName);
    desiredTranslator.enabled = false;
  };

  return {
    messageBus,
    activateTranslator,
    deactivateTranslator
  }
}

export { createTranslatorEngine }