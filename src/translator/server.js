import Koa from "koa";
import Router from '@koa/router';
import { createServer } from "http";
import { networkInterfaces } from 'os';
import { setupSocketIO } from "./setupSocketIO";
import { latest } from "../toolbox/observables";
import { chairChordAlg } from "../algebra/chairChord";
import { makeObservations } from "../observers";

const STATE = {};

const port = process.env.PORT;
const isDevEnvironment = process.env.ENV === "DEV" || !process.env.ENV;
if (isDevEnvironment)
  console.log("In dev environment");

const app = new Koa();
const httpServer = createServer(app.callback());

const { socketsByIdentityObs, messagesObs } = setupSocketIO(httpServer);
const socketsByIdentity_io = latest(socketsByIdentityObs, {})

const observations = makeObservations(messagesObs);
const latestObservation_io = latest(observations, chairChordAlg.identity());

observations.subscribe((obs) => {
  console.log('OBSER', obs);
  STATE.observation = obs;
});



httpServer.listen(port, () => {
  const ipAddress = networkInterfaces()?.['Wi-Fi']
    ?.find(intf => intf.family === 'IPv4')
    ?.address;

  console.log(`Translator listening at ${ipAddress}:${port}`);
});

const router = new Router();
router
  .get('/control/test', async (ctx, next) => {
    console.log('IN /CONTROL/TEST');

    ctx.identifiedSocket?.emit('test', 'body ody ody');
  })
  .get('/control/set/debug', async (ctx, next) => {
    console.log('IN /CONTROL/SET/DEBUG');

    ctx.identifiedSocket?.emit('control/set/debug');
  })
  .get('/control/set/zero', async (ctx, next) => {
    console.log('IN /CONTROL/ZERO');
    ctx.identifiedSocket?.emit('control/set/zero');
  })
  .get('/control/set/high', async (ctx, next) => {
    console.log('IN /CONTROL/HIGH');
    ctx.identifiedSocket?.emit('control/set/high');
  })
  .get('/control/set/identity', async (ctx, next) => {
    console.log('IN /CONTROL/identity');
    // TODO
    ctx.identifiedSocket?.emit('control/set/identity', ctx.query.new_id);
  });


app
  .use(async (ctx, next) => {
    const {id} = ctx.query;

    const socketsByIdentity = socketsByIdentity_io();
    const identifiedSocket = Object.entries(socketsByIdentity)
      ?.find(([identity, obs]) => identity === id)
      ?.[1];

    ctx.identifiedSocket = identifiedSocket;
    await next();
  })
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(3000);

