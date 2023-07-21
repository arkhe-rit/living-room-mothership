const mockSocket = {
    channels: {},
    emit: jest.fn((channel, arg) => {
        if (this.channels === undefined) {
            this.channels = {};
        }
        switch (channel) {
            case 'subscribe':
                this.channels[arg] = [];
                break;
            case 'unsubscribe':
                this.channels[channel] = undefined;
                break;
            case 'publish':
                this.channels[arg.channel] && this.channels[arg.channel].forEach(callback => callback(arg.message));
                break;
        }
    }),
    on: jest.fn((channel, callback) => {
        if (channel === 'connect' || channel === 'disconnect' || channel === 'connect_error') {
            return;
        }
        this.channels[channel] = [...this.channels[channel], callback];
    })
};

const io = jest.fn(() => mockSocket);

module.exports = { io, mockSocket };