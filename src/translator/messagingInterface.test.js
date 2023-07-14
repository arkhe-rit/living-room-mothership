import { jest } from "@jest/globals";
import { socketInterface } from "./messagingInterface.js";

const mockSocket = () => {
  let listeners = {};

  return {
    emit: jest.fn((eventName, msg, callback) => {
      callback("the-response");
    }),
    on: jest.fn((eventName, socketListener) => {
      listeners[eventName] = socketListener;
    }),
    off: jest.fn((eventName, attachedListener) => {
      listeners[eventName] = attachedListener;
    }),
    once: jest.fn((eventName, callback) => {
      callback("the-response");
    }),
    mockIncomingEvent: (eventName, msg) => {
      listeners[eventName](msg, () => {});
    }
  };
};

describe("socketInterface", () => {
  let socket;
  let messaging;

  beforeEach(() => {
    socket = mockSocket();
    messaging = socketInterface(socket);
  });

  describe(".send()", () => {
    test("should call socket.emit", async () => {
      const result = await messaging.send("event-name", "the-message");

      expect(socket.emit).toHaveBeenCalled();
      expect(socket.emit.mock.calls[0][0]).toEqual("event-name");
      expect(socket.emit.mock.calls[0][1]).toEqual("the-message");
    });

    test("should return promise resolving to response", async () => {
      const result = messaging.send("event-name", "the-message");

      expect(result).toBeInstanceOf(Promise);
      await expect(result).resolves.toBe("the-response");
    });
  });

  describe(".on()", () => {
    test("should register working listener", async () => {
      const listener = jest.fn(({ reply, data }) => {});
      messaging.on("event-name", listener);

      // pretend there's an incoming event
      // check if listener was actually called
      socket.mockIncomingEvent("event-name", "some-data");

      expect(listener).toHaveBeenCalled();
    });
  });
  describe(".off()", () => {
    test("should ", async () => {
      //const handler = ({data, reply}) => {};
      const listener = jest.fn(({ reply, data }) => {});
      messaging.on("event-name", listener);
      socket.mockIncomingEvent("event-name", "some-data");
      messaging.off("event-name", listener);
      expect(socket.off).toHaveBeenCalled();
    });
  });
  describe(".next()", () => {
    test("should ", async () => {
      const nextMsgData = await messaging.next("event-name");
      expect(socket.once).toHaveBeenCalled();
      expect(socket.once.mock.calls[0][0]).toEqual("event-name");
    });
    test("should return promise resolving to response", async () => {
      const result = messaging.next("event-name");
      expect(result).toBeInstanceOf(Promise);
      await expect(result).resolves.toBe("the-response");
    });
  });
});
