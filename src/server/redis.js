import { createClient } from "redis";

let subscriptions = {};

const setupRedisAdapter = async (io) => {
    const pubClient = createClient({
        host: 'localhost',
        port: 6379
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
                    for (const sub in subscriptions) {
                        console.log(`Checking ${sub} against ${channel}`)
                        if (sub.includes('*')) {
                            if (matchChannelPattern(channel, sub)) {
                                console.log(`Found wildcard subscription ${sub} for channel ${channel}`)
                                emitToSubs(sub, message);
                            }
                        }
                    }
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
            pubClient.publish(channel, message);
        });
    });
}

const matchChannelPattern = (incomingChannel, subscribedChannel) => {
    const incomingParts = incomingChannel.split('/');
    const subscribedParts = subscribedChannel.split('/');

    let incomingIndex = 0;
    let subscribedIndex = 0;

    while (subscribedIndex < subscribedParts.length && incomingIndex < incomingParts.length) {
        const subscribedPart = subscribedParts[subscribedIndex];
        const incomingPart = incomingParts[incomingIndex];
        //console.log('Comparing', subscribedPart, incomingPart)

        if (subscribedPart === incomingPart) {
            //console.log('Match', subscribedPart, incomingPart);
            subscribedIndex++;
            incomingIndex++;
            continue;
        }
        else if (incomingPart === subscribedParts[subscribedIndex + 1]) {
            //console.log('Wildcard', subscribedPart, incomingPart);
            subscribedIndex++;
            continue;
        }
        else if (subscribedPart !== '*' && subscribedPart !== incomingPart) {
            //console.log('Early out', subscribedPart, incomingPart);
            return false;
        }
        incomingIndex++;
    }
    if (subscribedParts[subscribedIndex] === '*') {
        subscribedIndex++;
    }
    return incomingIndex === incomingParts.length && subscribedIndex === subscribedParts.length;
};

export { setupRedisAdapter };