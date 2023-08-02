import { createBusClient } from '../toolbox/messageBusClient.js';
import { chairsToLampsTranslator } from './chairsToLamps.js';
import { chairsToTVTranslator } from './chairsToTVChannel.js';
import { mugsToTVFilterTranslator } from './mugsToTVFilter.js';

const translators = [
  chairsToLampsTranslator,
  chairsToTVTranslator,
  mugsToTVFilterTranslator
]

const createTranslatorEngine = () => {
  const messageBus = createBusClient()();
  messageBus.subscribe('translator/command', (msg) => {
    switch (msg.type) {
      case 'command':
        switch (msg.command) {
          case 'activate-translator':
            activateTranslator(msg.translator);
            break;
          case 'deactivate-translator':
            deactivateTranslator(msg.translator);
            break;
          default:
            console.log(`Unknown command: ${msg.command}`)
            break;
        }
        break;
      default:
        console.log(`Unknown message type: ${msg.type}`)
    }
  });

  const activateTranslator = (translatorName) => {
    for (const translator of translators) {
      if (translator.name === translatorName) {
        messageBus.subscribe(translator.listeningChannel, (msg) => {
          if (msg.type === 'algebra') {
            const translatedMessage = JSON.stringify(translator.callback(msg.algebra));
            messageBus.publish(translator.publishingChannel, translatedMessage);
          }
        });
        return;
      }
    }
    console.log(`Unknown translator: ${translatorName}`);
  };

  const deactivateTranslator = (translatorName) => {
    messageBus.unsubscribe(translatorName);
  };

  return {
    messageBus,
    activateTranslator,
    deactivateTranslator
  }
}

export { createTranslatorEngine }