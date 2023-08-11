import { createClient } from "redis";
import { wildcardComparison } from "../toolbox/wildcardComparison.js";

let subscriptions = {};

const setupRedisAdapter = async (io) => {
    const pubClient = createClient({
        url: "redis://redis:6379"
    });
    const subClient = pubClient.duplicate();
    io.listen(3000);
    await pubClient.connect();
    await subClient.connect();

    const maxMessageLength = 100;
    const shortenMessage = (message) => message.length > maxMessageLength ? message.substring(0, maxMessageLength) + '...' : message;

    const emitToSubs = (channel, message) => {
        //nonwildcard channels
        if (subscriptions[channel] !== undefined) {
            subscriptions[channel].forEach((id) => {
                // console.log(`Emitting to ${id} on channel ${channel} with content ${shortenMessage(message)}`)
                io.to(id).emit(channel, { message, originalChannel: channel });
            });
        }
        //aside from emitting to the specific channel, check the subscriptions diciontary for any
        //wildcard subscriptions that have a matching pattern
        Object.keys(subscriptions).filter(sub => sub !== channel).forEach((sub) => {
            if (wildcardComparison(sub, channel) || wildcardComparison(channel, sub)) {
                subscriptions[sub].forEach((id) => {
                    // console.log(`Emitting to ${id} on channel ${sub} with content ${shortenMessage(message) }; original channel was ${channel}`)
                    io.to(id).emit(sub, { message, originalChannel: channel });
                });
            }
        });
    }

    subClient.pSubscribe('*', (message, channel) => {
        // console.log(`Received message ${shortenMessage(message)} on channel ${channel}`);
        emitToSubs(channel, message);
    });

    io.on('connection', (socket) => {
        socket.on('subscribe', (channel) => {
            //if this is the first client to the subscribe to the channel, 
            //create the array for the channel
            if (subscriptions[channel] === undefined) {
                subscriptions[channel] = [socket.id];
            }
            //othewrise, just add the client to the array
            else {
                subscriptions[channel].push(socket.id);
            }
            console.log("Client subscribed to channel: " + channel);
        });
        socket.on('unsubscribe', (channel) => {
            subscriptions[channel] = subscriptions[channel].filter((id) => id !== socket.id);
            console.log("Client unsubscribed from channel: " + channel);
            //if the channel is empty, delete it
            if (subscriptions[channel].length === 0) {
                delete subscriptions[channel];
                subClient.unsubscribe(channel);
            }
        });
        socket.on('disconnect', () => {
            for (const channel in subscriptions) {
                subscriptions[channel] = subscriptions[channel].filter((id) => id !== socket.id);
                console.log("Client unsubscribed from channel: " + channel);
                //if the channel is empty, delete it
                if (subscriptions[channel].length === 0) {
                    delete subscriptions[channel];
                    subClient.unsubscribe(channel);
                }
            }
        });
        socket.on('publish', (data) => {
            const channel = data.channel.toString();
            const message = data.message.toString();
            //instead of publishing to a channel with a wildcard in it, publish to individual channels that match the pattern
            if (channel.includes('*')) {
                for (const sub in subscriptions) {
                    if (wildcardComparison(channel, sub)) {
                        pubClient.publish(sub, message);
                    }
                }
            }
            else {
                pubClient.publish(channel, message);
            }
        });
    });
}

const createPlainRedisInterface = async () => {
    const pubClient = createClient({
        url: "redis://redis:6379"
    });
    const subClient = pubClient.duplicate();

    await pubClient.connect();
    await subClient.connect();

    return {
        publish: (channel, message) => {
            pubClient.publish(channel, message);
        },
        subscribe: (channel, callback) => {
            subClient.pSubscribe(channel, (msg, receivedChannel) => {
                try {
                    // parse message
                    const message = JSON.parse(msg);

                    callback(message, receivedChannel);
                } catch (e) {
                    console.error('Cannot parse message, passing forward as string');
                    callback(msg, receivedChannel);
                }
            });
        },
        unsubscribe: (channel) => {
            subClient.unsubscribe(channel);
        }
    };
};

export {
    setupRedisAdapter,
    createPlainRedisInterface
};