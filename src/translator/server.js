import Koa from "koa";
import Router from '@koa/router';
import { createServer } from "http";
import { networkInterfaces } from 'os';
import { setupSocketIO } from "./setupSocketIO";
import { latest } from "../toolbox/observables";
import { chairChordAlg } from "../algebra/chairChord";
import { makeObservations } from "../observers";
import { interpretLeft, interpretList, interpretRight } from "../algebra/interpret";
import { setupRedisAdapter } from "./redis";

const STATE = {};

const port = process.env.PORT;
const isDevEnvironment = process.env.ENV === "DEV" || !process.env.ENV;
if (isDevEnvironment)
  console.log("In dev environment");

const app = new Koa();
const httpServer = createServer(app.callback());

const { socketsByIdentityObs, messagesObs, tvObs, io } = setupSocketIO(httpServer);
await setupRedisAdapter(io);
const socketsByIdentity_io = latest(socketsByIdentityObs, {})
const latestTV_io = latest(tvObs)
const latestSockets_io = latest(socketsByIdentityObs);

const observations = makeObservations(messagesObs);
const latestObservation_io = latest(observations, chairChordAlg.identity());

let relay_1_on = false;
let relay_2_on = false;
observations.subscribe((obs) => {
  // console.log('OBSER', interpretList(obs));
  STATE.observation = obs;

  latestTV_io()?.emit('algebra', obs);

  const left = interpretLeft(obs);
  const right = interpretRight(obs);
  if (['chair_1', 'chair_2'].includes(left)) {
    if (relay_2_on === false) {
      const x = latestSockets_io();
      x?.['relay_2']?.emit('signal/on');  
      relay_2_on = true;
    }
  } else {
    if (relay_2_on === true) {
      latestSockets_io()?.['relay_2']?.emit('signal/off');
      console.log('relay_2 off');
      relay_2_on = false;
    }
  }
  if (['chair_3', 'chair_4'].includes(right)) {
    if (relay_1_on === false) {
      latestSockets_io()?.['relay_1']?.emit('signal/on');
      console.log('relay_1 on');
      relay_1_on = true;
    }
  } else {
    if (relay_1_on === true) {
      latestSockets_io()?.['relay_1']?.emit('signal/off');
      console.log('relay_1 off');  
      relay_1_on = false;
    }
  }
});

observations.subscribe(obs => {
  console.log(interpretList(obs));
})

let msgsDict = {chair_1: '', chair_2: '', chair_3: '', chair_4: ''};
messagesObs.subscribe(msg => {
  msgsDict[msg.identity] = `${msg.value ? '|' : '-'}: R${msg.reading} :: Z${msg.threshold_zero} - H${msg.threshold_high}, VEL${msg.velocity} W${msg.weight_reading} :: Z${msg.weight_zero} - H${msg.weight_high}`;
});
// setInterval(() => {
//   console.log(JSON.stringify(msgsDict));
// }, 15)
setInterval(() => {
  // console.clear();
  // console.log('chair_1: ' + msgsDict['chair_1']);
  // console.log('chair_2: ' + msgsDict['chair_2']);
  // console.log('chair_3: ' + msgsDict['chair_3']);
  // console.log('chair_4: ' + msgsDict['chair_4']);
}, 200);

let last = 0;
messagesObs.subscribe(msg => {

  let here = Math.round(msg.velocity / (msg.noise + 0.001) / 3);
  let accel = (here - last) * 60;

  last = here;
  
  // console.clear();
  // console.log(
  //   Array.from({length: Math.abs(Math.round(msg.velocity / (msg.noise + 0.001) / 3))})
  //     .map(n => '-')
  //     .join('')
  //   )
  // console.log(accel);
});

// setInterval(() => {
//   console.log('----------');
//   console.log('Current sockets:');
//   console.log(Object.keys(socketsByIdentity_io()));
//   console.log('----------');
// }, 5000);

tvObs.subscribe((tv) => {
  tv.emit('algebra', latestObservation_io());
});

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

  // Dashboard get calls
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
  })
  


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

app.listen(3001);

