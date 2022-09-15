import Koa from "koa";
import Router from '@koa/router';
import { createServer } from "http";
import { networkInterfaces } from 'os';
import { setupSocketIO } from "./setupSocketIO";
import { setupObservers } from "../observers";

const port = process.env.PORT;
const isDevEnvironment = process.env.ENV === "DEV" || !process.env.ENV;
if (isDevEnvironment)
  console.log("In dev environment");

const app = new Koa();
const httpServer = createServer(app.callback());

const obsSockets = setupSocketIO(httpServer);

const GLOBAL = {};

obsSockets.flatMap(setupObservers)
  .subscribe(observers => {
    GLOBAL.observers = observers;

    Object.values(observers)
      .map(o => o.observerState)
      // .map(stateObs => stateObs.subscribe(state => {
      //   console.log('STATE', state);
      //   return state;
      // }));
      
    observers['chair-chord'].observerState.subscribe(state => {
      console.log('chair');
      console.log(state);
      console.log(Object.keys(observers));
    })
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

    ctx.identifiedObserver?.socket.emit('test', 'body ody ody');
  })
  .get('/control/set/debug', async (ctx, next) => {
    console.log('IN /CONTROL/SET/DEBUG');

    ctx.identifiedObserver?.socket.emit('control/set/debug');
  })
  .get('/control/set/zero', async (ctx, next) => {
    console.log('IN /CONTROL/ZERO');
    ctx.identifiedObserver?.socket.emit('control/set/zero');
  })
  .get('/control/set/high', async (ctx, next) => {
    console.log('IN /CONTROL/HIGH');
    ctx.identifiedObserver?.socket.emit('control/set/high');
  })
  .get('/control/set/identity', async (ctx, next) => {
    console.log('IN /CONTROL/identity');
    // TODO
    ctx.identifiedObserver?.socket.emit('control/set/identity', ctx.query.new_id);
  });


app
  .use(async (ctx, next) => {
    const {id} = ctx.query;

    const identifiedObserver = Object.entries(GLOBAL.observers)
      ?.find(([identity, obs]) => identity === id)
      ?.[1];

    ctx.identifiedObserver = identifiedObserver;
    await next();
  })
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(3000);

