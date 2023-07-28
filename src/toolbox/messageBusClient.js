import { clientSocket } from "../server/socket/clientSocket.js";

const createBusClient = (subscriptions = []) => {
    const socketClient = clientSocket();

    const subscribe = (channel, callback) => {
        socketClient.emit('subscribe', channel);
        socketClient.on(channel, (message) => {
            const parsedMessage = JSON.parse(message);
            callback(parsedMessage, channel);
        });
    }

    const unsubscribe = (channel) => {
        socketClient.emit('unsubscribe', channel);
    }

    const publish = (channel, message) => {
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