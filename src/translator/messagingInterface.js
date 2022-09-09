/*
This file is intended to provide a single interface for communicating message-passing-style between two machines; it's implemented with websockets but there's no reason you couldn't do it with some other protocol. 

{ send, on, off, next }
*/
import { io } from "socket.io-client";

/*
  Here we define a messaging interface to be any object with the following
  interface:

    type Handler<Msg, Rep> = ({data: Msg[], reply: (x: Rep) => void}) => void

    type MessagingInterface = {
      send: <Msg, Res>(msgName: string, message: Msg) => Promise<Res>,
      on: (msgName: string, handler: Handler) => void,
      off: (msgName: string, handler: Handler) => void,
      next: <Res>(msgName: string) => Promise<Res>
    }

  For example: 

    const response = await <messageInterface>.send('msgName', 'message');
      
    messageInterface>.on('msgName', ({data, reply}) => {
      // data is an array
      reply('response');
    });

    const handler = ({data, reply}) => {.....};
    <messageInterface>.on('msgName', handler);
    <messageInterface>.off('msgName', handler);

    const nextMsgData = await <messageInterface>.next('msgName');
*/

const socketInterface = socket => {
  // This map exists because the listeners provided to .on are in a different
  // shape than the listeners we need to give socket.io (ours should be
  //   ({reply, data}) => {}
  // functions), and we need the functions provided to socket.on in order
  // to later remove them.
  // So this maps ({reply, data}) => {} functions to socket.io's listener functions.
  const listenerMap = new Map();

  return {
    /*
      const response = await <messageInterface>.send('msgName', 'message');
    */
    send: (eventName, message) => {
      return new Promise(resolve => {
        socket.emit(eventName, message, response => {
          resolve(response);
        });
      });
    },
    /*
      <messageInterface>.on('msgName', ({data, reply}) => {
        // data is an array
        reply('response');
      });
    */
    on: (eventName, listener) => {
      const socketListener = (...args) => {
        const reply = args[args.length - 1];
        const data = args.slice(0, args.length - 1);

        return listener({ reply, data });
      };

      listenerMap.set(listener, socketListener);

      socket.on(eventName, socketListener);
    },
    /*
      const handler = ({data, reply}) => {.....};
      <messageInterface>.on('msgName', handler);
      <messageInterface>.off('msgName', handler);
    */
    off: (eventName, attachedListener) => {
      const socketListener = listenerMap.get(attachedListener);
      listenerMap.delete(attachedListener);

      const remove =
        socket.off.bind(socket) || socket.removeListener.bind(socket);
      remove(eventName, socketListener);
    },
    /*
      const nextMsgData = await <messageInterface>.next('msgName');
    */
    next: eventName => {
      return new Promise(resolve => {
        socket.once(eventName, resolve);
      });
    }
  };
};

const multiSocketInterface = socketsArr => {
  socketsArr = socketsArr.map(socketInterface);

  return {
    send: (eventName, message) => {
      return Promise.all(
        socketsArr.map(sockMessaging => sockMessaging.send(eventName, message))
      );
    },
    on: (eventName, listener) => {
      socketsArr.forEach(sockMessaging =>
        sockMessaging.on(eventName, listener)
      );
    },
    off: (eventName, attachedListener) => {
      socketsArr.forEach(sockMessaging =>
        sockMessaging.off(eventName, attachedListener)
      );
    },
    next: eventName => {
      return Promise.race(
        socketsArr.map(sockMessaging => sockMessaging.next(eventName))
      );
    }
  };
};

export { socketInterface, multiSocketInterface };
