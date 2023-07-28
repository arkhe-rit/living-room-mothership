# living room

## Getting it running

### Requirements

- [Node.js and NPM](https://nodejs.org/en/download/)
- [Docker](https://www.docker.com/)
- [RedisInsight](https://redis.com/redis-enterprise/redis-insight)

### Run

In a terminal window (likely Git Bash on Windows or the Terminal on Mac) run:

```bash
npm run setup
```

This will install node_modules and perform other necessary setup tasks. Then, run:

```bash
npm run start
```

This will cause Docker to start the app up, along with a Redis instance.

### To run during development
When using these dockerized commands, don't re-run them with every change you make. Unnecessary, and will take an inordinate amount of time.

Instead, just run `npm run start` to get the app running. It will automatically reload itself when you change something. If it doesn't, then we need to add some configuration to nodemon to cause it to reload for this type of change.

Also recommend you install [RedisInsight](https://redis.com/redis-enterprise/redis-insight) so you can monitor the data flowing through Redis during the app's execution. Just have it connect to localhost:6379 or 127.0.0.1:6379 (should be the default option).

### Adding new dependencies

To add a new library from `npm` (what you'd ordinarily use `npm install` for):
1. Go ahead and run `npm install my-dope-new-library`
  - This will add it properly to your package.json file
2. Rerun `npm run setup`
  - This will install the library into the node_modules volume that our dockerized app uses.
3. Done! Run `npm run start` to get back in the game.

# Dashboard/TV

### Run
In separate terminals run the following to start the dashboard and TV respectively:
```js
npm run start-dashboard
```
```js
npm run start-tv
```
The dashboard will open on port `4321` and the TV will open on port `1234`.

# How the Pub/Sub model works

Redis acts as the backbone of our inter-client communication, with Socket.IO working as a mediator for any HTML/JS based clients. Redis' Pub/Sub models uses *channels* to share *messages* to any interested listeners.

## Publishing

Publishing to Redis is as simple as specifying a channel you want to publish to, then declaring the message content you're going to publish. A client does not need to be subscribed to a channel to publish to, there is no setup for the channel needed. 
For Socket.IO clients, this is achieved with the `.publish` function of a `messageBusClient` object.

## Subscribing

Subscribing to a Redis channel is simliar to subscribing to a YouTube channel (or at least how it used to work). A client declares interest to a specific channel, then any time a message is published to the channel, Redis pushes it to the client, who handles it however they want. A client can subscribe to any amount of channels, or none at all; since there is no concept of "creating" channels, its possible to subscribe to a channel that never gets any messages (accidentally achieved if you misspell the channel name when subscribing).
For socket.IO clients, this is achieved with the `.subscribe` function of a `messageBusClient` object. When subscribing to channel this way, you are required to provide a callback function that will get called when a new message is published on the channel. Usually this is an anymous function that checks the format of the message content and then calls other methods to handle the result of the message.