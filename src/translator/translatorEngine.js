import { chairsToLampsTranslator } from './chairsToLamps.js';
import { chairsToTVTranslator } from './chairsToTVChannel.js';
import { coastersToTVFilterTranslator } from './coastersToTVFilter.js';
import { cvMugToTVFilterTranslator } from './cvMugToTVFilter.js';
import { ardMugToTVFilterTranslator } from './ardMugToTVFilter.js';
import { rugToTVChannelTranslator } from './rugToTVChannel.js';
import { cvMugToEinkImageTranslator } from './cvMugToEinkImage.js';
import { rugToEinkImageTranslator } from './rugToEinkImage.js';

const rawTranslators = [
  chairsToLampsTranslator,
  chairsToTVTranslator,
  cvMugToTVFilterTranslator,
  // ardMugToTVFilterTranslator,
  //rugToTVChannelTranslator,
  coastersToTVFilterTranslator,
  cvMugToEinkImageTranslator,
  rugToEinkImageTranslator
]

const createTranslatorEngine = (messageBus) => {
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
          case 'registered-translators': 
            const activeTranslators = Object.keys(translators).map(translatorName => {
              let translator = translators[translatorName];
              return translator;
            });
            
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
            console.log(`Translator recieved unknown command: ${msg.command}`)
            break;
        }
        break;
      case 'response': break;
      default:
        console.log(`Translator recieved unknown message type: ${msg.type}`)
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
        const translatorResponse = desiredTranslator.callback(msg.value);
        if (translatorResponse === undefined) {
          return;
        }
        const translatedMessage = JSON.stringify(translatorResponse);
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
    messageBus.unsubscribe(desiredTranslator.listeningChannel);
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