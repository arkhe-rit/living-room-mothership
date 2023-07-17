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

    const emitToSubs = (channel, message) => {
        subscriptions[channel].forEach((id) => {
            console.log(`Emitting to ${id} on channel ${channel} with content ${message}`)
            io.to(id).emit(channel, message);
        });
    }
    

    io.on('connection', (socket) => {
        socket.on('subscribe', (channel) => {
            //if this is the first client to the subscribe to the channel, 
            //create the array for the channel and subscribe through redis
            if (subscriptions[channel] === undefined) {
                subscriptions[channel] = [socket.id];
                //psubscribe is used to be able to handle wildcard subscriptions
                subClient.pSubscribe(channel, (message, channel) => {
                    console.log(`Received message ${message} on channel ${channel}`);
                    //nonwildcard channels
                    if (subscriptions[channel] !== undefined) {
                        emitToSubs(channel, message);
                    }
                    //aside from emitting to the specific channel, check the subscriptions diciontary for any
                    //wildcard subscriptions that have a matching pattern
                    Object.keys(subscriptions).filter(sub => sub.includes('*')).forEach((sub) => {
                        if (wildcardComparison(sub, channel)) {
                            emitToSubs(sub, message);
                        }
                    });
                });
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

export { setupRedisAdapter };