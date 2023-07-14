import { clientSocket } from "../server/socket/clientSocket";

type messageType = 'command' | 'algebra';
type messageCallback = (message: {type: messageType}, channel: string) => void;

const createBusClient = (subscriptions: { channel: string, callback: messageCallback }[] = []) => {
    const socketClient = clientSocket();

    const subscribe = (channel: string, callback: messageCallback) => {
        socketClient.emit('subscribe', channel);
        socketClient.on(channel, callback);
    }

    const unsubscribe = (channel: string) => {
        socketClient.emit('unsubscribe', channel);
    }

    const publish = (channel: string, message: { type: messageType }) => {
        socketClient.emit('publish', {channel, message});
    }

    // Subscribe to all channels passed in as default subscriptions
    subscriptions.forEach(subscription => {
        subscribe(subscription.channel, subscription.callback);
    });

    return {
        socketClient,
        subscribe,
        unsubscribe,
        publish
    }
}

export { createBusClient }