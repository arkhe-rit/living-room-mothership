import { createClient } from "redis";

let subscriptions = {
    '*': []
};

const setupRedisAdapter = async (io) => {
    const pubClient = createClient({
        host: 'localhost',
        port: 6379
    });
    const subClient = pubClient.duplicate();
    io.listen(3000);
    await pubClient.connect();
    await subClient.connect();
    

    io.on('connection', (socket) => {
        socket.on('subscribe', (channel) => {
            //if this is the first client to the subscribe to the channel, 
            //create the array for the channel and subscribe through redis
            if (subscriptions[channel] === undefined) {
                subscriptions[channel] = [socket.id];
                subClient.subscribe(channel, (message, channel) => {
                    subscriptions[channel].forEach((id) => {
                        console.log(`Emitting to ${id} on channel ${channel} with content ${message}`)
                        io.to(id).emit(channel, message);
                    });
                    subscriptions['*'].forEach((id) => {
                        io.to(id).emit(channel, message);
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
            if (channel !== '*' && subscriptions[channel].length === 0) {
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

export { setupRedisAdapter };