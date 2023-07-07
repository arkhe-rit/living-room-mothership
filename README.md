# living room

## Getting it running

### Requirements

- [Node.js and NPM](https://nodejs.org/en/download/)

### Run

In a terminal window (likely Git Bash on Windows or the Terminal on Mac) run:

```js
npm run start
```


# Dashboard/TV Redis connectivity

### Requirements

- [Docker](https://www.docker.com/products/docker-desktop/)
    - [Windows Linux Kernel](https://learn.microsoft.com/en-us/windows/wsl/install-manual#step-4---download-the-linux-kernel-update-package)

### Setup

Once Docker is installed, open a terminal and past the command:
```js
docker run -d --name redis-stack -p 6379:6379 -p 8001:8001 redis/redis-stack:latest
```
to create a new docker image for the Redis server. Once the image is made you can start it again through the Docker app. The RedisInsight will
be opened on `localhost:8001`.
In the root directory of the repo, open a terminal and run:
```js
npm install
```
to download the required node packages.

### Running

In a terminal (likely vscode's integrated terminal) run:
```js
npm run start
```
to start the main server. In separate terminals run the following to start the dashboard and TV respectively:
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