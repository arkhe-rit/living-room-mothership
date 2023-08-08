import Koa from "koa";
import Router from '@koa/router';
import { createServer } from "http";
import { networkInterfaces } from 'os';
import { setupSocketIO } from "./socket/setupSocketIO.js";
import { setupRedisAdapter } from "./redis.js";
import { createTranslatorEngine } from '../translator/translatorEngine.js';
import { chairChordObserver, createRedisInterface } from "../observers/observerEngine.js";

const port = process.env.PORT;
const isDevEnvironment = process.env.ENV === "DEV" || !process.env.ENV;
if (isDevEnvironment)
  console.log("In dev environment");

const app = new Koa();
const httpServer = createServer(app.callback());

const { io } = setupSocketIO(httpServer);
await setupRedisAdapter(io);

// Observer shit
const observerRedisInterface = await createRedisInterface();
const chairChord = chairChordObserver(observerRedisInterface);
//

const translatorEngine = createTranslatorEngine();
translatorEngine.activateTranslator('ardMugToTVFilter');
translatorEngine.activateTranslator('cvMugToTVFilter');
translatorEngine.activateTranslator('rugToTVChannel');

httpServer.listen(port, () => {
  const hotspotIpAddress = networkInterfaces()?.['Local Area Connection* 2']
    ?.find(intf => intf.family === 'IPv4')
    ?.address;
    
  const ethIpAddress = networkInterfaces()?.['Ethernet']
    ?.find(intf => intf.family === 'IPv4')
    ?.address;

  const wifiIpAddress = networkInterfaces()?.['Wi-Fi']
    ?.find(intf => intf.family === 'IPv4')
    ?.address;

  const ipAdddress = hotspotIpAddress || ethIpAddress || wifiIpAddress;

  console.log(`Translator listening at ${ipAdddress}:${port}`);
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
  })
  .get('/signal/on', async (ctx, next) => {
    console.log('IN /SIGNAL/on');
    ctx.identifiedSocket?.emit('signal/on');
  })
  .get('/signal/off', async (ctx, next) => {
    console.log('IN /SIGNAL/off');
    ctx.identifiedSocket?.emit('signal/off');
  })

  /* // Dashboard get calls
  .get('/control/set/tv/channel', async (ctx, next) => {
    console.log('IN /CONTROL/set/tv/channel');
    latestTV_io()?.emit('signal/tv/channel', ctx.query.channel);
  })
  .get('/control/set/tv/filter', async (ctx, next) => {
    console.log('IN /CONTROL/set/tv/filter');
    latestTV_io()?.emit('signal/tv/filter', ctx.query.filter);
  })
  .get('/control/set/eink', async (ctx, next) => {
    console.log('IN /CONTROL/set/eink');
    latestTV_io()?.emit('signal/eink', ctx.query.filter);
  }) */
    
app
  .use(router.routes())
  .use(router.allowedMethods())