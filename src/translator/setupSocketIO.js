import { Observable, multicast, Subject } from "observable-fns"
import { Server as SocketIOServer } from "socket.io";

const setupSocketIO = (httpServer) => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: ''
    },
    maxHttpBufferSize: 1e8,
    pingTimeout: 60000,
    pingInterval: 5000,
    transports: ["websocket", "polling"],
    upgrade: false,
    allowUpgrades: false
  });
  
  io.engine.on("connection_error", err => {
    console.log('connection_error:', err.code);
    // console.log(err.req); // the request object
    // console.log(err.code); // the error code, for example 1
    console.log(err.message); // the error message, for example "Session ID unknown"
    console.log(err.context); // some additional error context
  });

  const msgObs = new Subject();
  const socketObs = new Subject();
  const tvObs = new Subject();

  let sockets = {};

  io.on("connection", socket => {
    let id = socket.id;
    let arkhe_identity = '???';
    console.log(`Server Connected to socket ${socket.id}`);

    socket.on("disconnect", reason => {
      console.log(`Disconnected from socket ${arkhe_identity}:${id}: ${reason}`);
      id = null;

      let newSockets = {...sockets};
      delete newSockets[arkhe_identity];
      sockets = newSockets;
    });

    socket.on("connect_error", err => {
      console.log(`Socket connection error: ${err.message}`);
      id = null;
    });

    socket.on('identify/tv', () => {
      tvObs.next(socket);
    });

    socket.on('identify', (msg) => {
      const {identity, state} = msg;

      console.log('Identify: ', identity);

      arkhe_identity = identity;
      sockets = {...sockets, [identity]: socket};

      socketObs.next(sockets);
    })

    socket.on('reading', (msg, reply) => {
      console.log("Received:", `Id: ${msg.identity}, read: ${msg.weight_reading}`);

      const {type, identity, value, threshold_zero, threshold_high, reading} = msg;

      const min = Math.min(threshold_high, threshold_zero);
      const max = Math.max(threshold_high, threshold_zero);

      if (max === threshold_high) {
        const threshold = min + (max - min) * .90;
        msg.value = msg.reading > threshold ? 1 : 0;
      } else {
        const threshold = min + (max - min) * .10;
        msg.value = msg.reading < threshold ? 1 : 0;
      }

      msgObs.next(msg);
    });
  });

  return {
    socketsByIdentityObs: multicast(socketObs),
    messagesObs: multicast(msgObs),
    tvObs: multicast(tvObs)
  };
};

export { setupSocketIO };

/*

    io.on("connection", socket => {
        let id = socket.id;
        console.log(`Server Connected to socket ${socket.id}`);

        socket.on("disconnect", reason => {
            console.log(`Disconnected from socket ${id}: ${reason}`);
            id = null;
        });

        socket.on("connect_error", err => {
            console.log(`Socket connection error: ${err.message}`);
            id = null;
        });

        const connection = socketInterface(socket);

        // // console.time('pressure reading');
        // socket.on("pressure_reading", (msg) => {
        //     // console.timeEnd('pressure reading');
        //     // console.time('pressure reading');
        //     console.log("Received:", msg.value);
        // });

        //projector code
        socket.on("projector/identify", reply => {
            console.log("Received:", "projector/identify");
            projectorSockets.push(socket);
            reply("hi projector from translator");

            const projectorConn = connection;

            projectorConn.on("projector/initial-state", ({ reply }) => {
                //may need to decode file into algebra for the projector
                reply(lastTranslatedAlgebra);
            });
        });

        //observer code
        socket.on("observer/identify", reply => {
            console.log("Received:", "observer/identify");
            observerSockets.push(socket);
            reply("hi observer from translator");

            const observerConn = connection;
            const translatorConn = socketInterface(clientSocket());
            let lastObservedAlgebra = { arkhe_tag: "identity" };

            observerConn.on("observer/bitmap-frame", async ({ data, reply }) => {
                console.log("bitmap frame");
                let arr = data[0].split(",");


                reply('received');
            });
        });

        // connection.on("observer/algebra-observed", ({ data, reply }) => {
        //     // lastTranslatedAlgebra = translateAlgebra(data[0]);

        //     // multiSocketInterface(projectorSockets).send(
        //     //   "translator/algebra-translated",
        //     //   lastTranslatedAlgebra
        //     // );

        //     //reply(data[0]); //For debugging
        // });
    });

    return io;
}
*/