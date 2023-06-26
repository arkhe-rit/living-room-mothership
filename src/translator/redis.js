import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";


const setupRedisAdapter = async (io) => {
    const pubClient = createClient({
        host: 'localhost',
        port: 6379
    });
    const subClient = pubClient.duplicate();
    io.adapter(createAdapter(pubClient, subClient));
    io.listen(3000);
    await pubClient.connect();
    await subClient.connect();
    io.on('connection', (socket) => {
        socket.on('publish', (msg) => {
            const { channel, message } = msg;
            console.log(`Publishing to ${channel}:`, message);
            pubClient.publish(channel, message);
        });
    });
}

export { setupRedisAdapter };