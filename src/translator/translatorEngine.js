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
// const translators = {};
// rawTranslators.forEach(translator => {
//   translators[translator.name] = translator;
// });

const createTranslatorEngine = (messageBus) => {
  // const messageBus = createBusClient();
  const translators = {};

  // Queries
  messageBus.subscribe('translator/*', (msg, channel) => {
    const reply = (responseData) => {
      const response = {
        type: 'response',
        value: responseData
      };
      messageBus.publish(
        `${channel}/response`, 
        JSON.stringify(response)
      );
    };

    switch (msg.type) {
      case 'query':
        switch (msg.query) {
          case 'active-translators': 
            const activeTranslators = Object.keys(translators).map(translatorName => {
              return {
                name: translatorName,
                description: translators[translatorName].description
              }
            }).filter(translator => translators[translator.name].enabled);
            
            reply(activeTranslators);
            break;
        }
        break;
      }
  });

  // Commands
  messageBus.subscribe('translator', (msg) => {
    switch (msg.type) {
      case 'command':
        switch (msg.command) {
          case 'activate-translator':
            activate(msg.value);
            break;
          case 'deactivate-translator':
            deactivate(msg.value);
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

  const register = (translator, shouldActivate = true) => {
    translators[translator.name] = translator;

    if (shouldActivate) {
      activate(translator.name);
    }
  };

  const registerWithoutActivation = (translator) => {
    register(translator, false);
  };

  const activate = (translatorName) => {
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

  const deactivate = (translatorName) => {
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
    register,
    registerWithoutActivation,
    activate,
    deactivate
  }
}

export { 
  createTranslatorEngine,
  rawTranslators
}