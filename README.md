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