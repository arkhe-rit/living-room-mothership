import { Socket } from "socket.io-client/build/esm/socket";
import { io } from "socket.io-client"; 
import { DefaultEventsMap } from "socket.io/dist/typed-events";

type messageType = 'command' | 'algebra';
type messageCallback = (message: { type: messageType }, channel: string) => void;

const isDevEnv = process.env.ENV === "DEV" || !process.env.ENV;

const setupSocket = (socket: Socket<DefaultEventsMap, DefaultEventsMap>): Socket<DefaultEventsMap> => {
    socket.on("connect", () => {
        console.log(`Connected to socket ${socket.id}`);
    });

    const reconnect = (reconnectionTimeout: number) => {
        reconnectionTimeout = reconnectionTimeout * 2;

        const s = Math.floor(reconnectionTimeout / 1000);
        const ms = reconnectionTimeout % 1000;
        const timeoutStr =
            s === 0 ? `${ms}ms` : `${s}s ${ms > 0 ? `${ms}ms` : ""}`.trim();

        console.log(`Attempting reconnection in ${timeoutStr}...`);
        setTimeout(socket.connect, reconnectionTimeout);
    };

    socket.on("disconnect", (reason, details) => {
        console.log(`Disconnected from socket ${socket.id}: ${reason}`);
        if (details instanceof Error) {
            details = details as Error;
            console.log("--", "Msg: ", details.message);
        }
        else {
            console.log("--", "Desc: ", details.description); // 413 (the HTTP status of the response)
            if (details.context instanceof XMLHttpRequest) {
                console.log("--", "Status: ", details.context.status); // 413
                console.log("--", "RespText: ", details.context.responseText); // ""
            }
        }
        reconnect(25);
    });

    socket.on("connect_error", err => {
        console.log(`Socket connection error: ${err.message}`);
        reconnect(25);
    });

    return socket;
}

const defaultSocket = io(
    isDevEnv
        ? "http://localhost:5555"
        : "https://arkhe-api.herokuapp.com/",
    {
        reconnectionAttempts: Infinity,
        timeout: 10000
    }
);

const createBusClient = (socket: {emit: Function, on: Function} = setupSocket(defaultSocket)) => (subscriptions: { channel: string, callback: messageCallback }[] = []) => {
    const client = {
        socket,
        subscribe: (channel: string, callback: messageCallback) => {
            socket.emit('subscribe', channel);
            socket.on(channel, callback);
            return client;
        },
        unsubscribe: (channel: string) => {
            socket.emit('unsubscribe', channel);
            return client;
        },
        publish: (channel: string, message: { type: messageType }) => {
            socket.emit('publish', { channel, message });
            return this;
        }
    }

    // Subscribe to all channels passed in as default subscriptions
    subscriptions.forEach(subscription => {
        client.subscribe(subscription.channel, subscription.callback);
    });

    return client;
}

export { createBusClient }