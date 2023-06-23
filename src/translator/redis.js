import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";


const setupRedisAdapter = (io) => {
    const pubClient = createClient({ url: "redis://localhost:6379" });
    const subClient = pubClient.duplicate();
    subClient.subscribe("test", (message, channel) => {
        console.log(`Received ${message} from ${channel}`);
        pubClient.publish("Channel", "Message");
    });
    return Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
        io.adapter(createAdapter(pubClient, subClient));
        io.listen(3000);
    });
}

export { setupRedisAdapter };