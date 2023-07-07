import { clientSocket } from "./socket";

const createBusClient = (subscriptions: {channel: string, callback: Function}[] = []) => {
    const socketClient = clientSocket();

    const subscribe = (channel: string, callback: Function) => {
        socketClient.emit('subscribe', channel);
        socketClient.on(channel, callback);
    }

    const unsubscribe = (channel: string) => {
        socketClient.emit('unsubscribe', channel);
    }

    const publish = (channel: string, message: string) => {
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