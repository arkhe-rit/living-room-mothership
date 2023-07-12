"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBusClient = void 0;
const clientSocket_1 = require("../server/socket/clientSocket");
const createBusClient = (subscriptions = []) => {
    const socketClient = (0, clientSocket_1.clientSocket)();
    const subscribe = (channel, callback) => {
        socketClient.emit('subscribe', channel);
        socketClient.on(channel, callback);
    };
    const unsubscribe = (channel) => {
        socketClient.emit('unsubscribe', channel);
    };
    const publish = (channel, message) => {
        socketClient.emit('publish', { channel, message });
    };
    // Subscribe to all channels passed in as default subscriptions
    subscriptions.forEach(subscription => {
        subscribe(subscription.channel, subscription.callback);
    });
    return {
        socketClient,
        subscribe,
        unsubscribe,
        publish
    };
};
exports.createBusClient = createBusClient;
//# sourceMappingURL=messageBusClient.js.map