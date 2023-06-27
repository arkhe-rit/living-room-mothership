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
        socket.onAny((channel, message) => {
            message = message.toString();
            //console.log(channel, message);
            //this channel is used to broadcast emits to other clients and has junk data
            if (channel !== 'socket.io#/#') {
                pubClient.publish(channel, message);
            }
            socket.emit(channel, message)
        })
    });
}

export { setupRedisAdapter };