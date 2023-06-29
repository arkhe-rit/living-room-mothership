import { clientSocket } from "./socket";

const createBusClient = (subscriptions = []) => {
    const socketClient = clientSocket();

    const subscribe = (channel, callback) => {
        socketClient.emit('subscribe', channel);
        socketClient.on(channel, callback);
    }

    const unsubscribe = (channel) => {
        socketClient.emit('unsubscribe', channel);
    }

    const publish = (channel, message) => {
        socketClient.emit('publish', {channel, message});
    }

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