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

obsSockets.map(setupObservers)
  .subscribe(observers => {
    debugger;
    const testObserver = observers;

    GLOBAL.testObserver = testObserver;
    GLOBAL.testObserver

    testObserver.observerState
      .subscribe(state => {
        console.log('STATE', state);
        return state;
      });
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
    GLOBAL.testObserver.socket.emit('test', 'body ody ody');
  })
  .get('/control/set/zero', async (ctx, next) => {
    console.log('IN /CONTROL/ZERO');
    GLOBAL.testObserver.socket.emit('control/set/zero');
  })
  .get('/control/set/high', async (ctx, next) => {
    console.log('IN /CONTROL/HIGH');
    GLOBAL.testObserver.socket.emit('control/set/high');
  })
  .get('/control/set/identity', async (ctx, next) => {
    console.log('IN /CONTROL/identity');
    // TODO
    GLOBAL.testObserver.socket.emit('control/set/high');
  });


app
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(3000);

