import { createBusClient } from '../src/toolbox/messageBusClient';
import { jest } from '@jest/globals';
import { mockSocket } from 'socket.io-client';

jest.mock('socket.io-client');

describe('createBusClient', () => {
    let busClient;

    beforeEach(() => {
        // Initialize the busClient
        busClient = createBusClient();
    });

    it('should return an object with socket, subscribe, unsubscribe, and publish methods', () => {
        expect(busClient).toBeDefined();
        expect(busClient).toHaveProperty('socket', mockSocket);
        expect(busClient).toHaveProperty('subscribe');
        expect(busClient).toHaveProperty('unsubscribe');
        expect(busClient).toHaveProperty('publish');
        expect(typeof busClient.subscribe).toBe('function');
        expect(typeof busClient.unsubscribe).toBe('function');
        expect(typeof busClient.publish).toBe('function');
    });

    it('should subscribe and unsubscribe from channels', () => {
        const channel = 'testChannel';
        const callback = jest.fn();

        busClient.subscribe(channel, callback);

        // Verify that socket.emit and socket.on were called with the correct arguments
        expect(mockSocket.emit).toHaveBeenCalledWith('subscribe', channel);
        expect(mockSocket.on).toHaveBeenCalledWith(channel, callback);

        // Emit a message on the subscribed channel
        mockSocket.emit('publish', { channel, message: 'Test message' });

        // The callback should have been called with the emitted message
        expect(callback).toHaveBeenCalledWith('Test message');

        busClient.unsubscribe(channel);

        // Verify that socket.emit was called with the correct argument
        expect(mockSocket.emit).toHaveBeenCalledWith('unsubscribe', channel);

        // Emit another message on the unsubscribed channel
        mockSocket.emit(channel, 'Another test message');

        // The callback should NOT have been called again, as the channel is unsubscribed
        expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should publish messages to channels', () => {
        const channel = 'testChannel';
        const message = { type: 'testType' };

        // Publish a message on the channel
        busClient.publish(channel, message);

        // Verify that socket.emit was called with the correct arguments
        expect(mockSocket.emit).toHaveBeenCalledWith('publish', { channel, message });
    });
});
