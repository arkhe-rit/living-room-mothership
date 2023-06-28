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
    

    io.of("/").adapter.on("join-room", (room, id) => {
        console.log(`socket ${id} has joined room ${room}`);
    });
    io.on('connection', (socket) => {
        socket.on('subscribe', (channel) => {
            subscriptions[channel]? subscriptions[channel].push(socket.id) : subscriptions[channel] = [socket.id];
            console.log("Client subscribed to channel: " + channel);
            console.log('subscriptions: ', subscriptions);
            subClient.subscribe(channel, (message, channel) => {
                subscriptions[channel].forEach((id) => {
                    console.log(`Emitting to ${id} on channel ${channel} with content ${message}`)
                    io.to(id).emit(channel, message);
                });
                console.log("Message sent to channel: " + channel, message);
            });
        });
        socket.on('unsubscribe', (channel) => {
            subscriptions[channel] = subscriptions[channel].filter((id) => id !== socket.id);
            console.log("Client unsubscribed from channel: " + channel);
            //if the channel is empty, delete it
            for (const channel in subscriptions) {
                if (subscriptions[channel].length === 0) {
                    delete subscriptions[channel];
                }
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