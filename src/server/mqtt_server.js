import Koa from "koa";
import Router from '@koa/router';

const port = process.env.PORT;
const isDevEnvironment = process.env.ENV === "DEV" || !process.env.ENV;
if (isDevEnvironment)
  console.log("In dev environment");


import aedesImport from 'aedes';
import {createServer} from 'net';

const aedes = aedesImport();
const aedesServer = createServer(aedes.handle);

aedes.preConnect = (client, packet, callback) => {
  console.log('MQTT preconnect', client.conn.remoteAddress);
  callback(null, true);
};

aedesServer.listen(1883, () => {
  console.log('MQTT broker started on port 1883');
  aedes.publish({ topic: 'aedes/hello', payload: "I'm broker " + aedes.id })
});

aedes.on('subscribe', (subscriptions, client) => {
  console.log('MQTT client \x1b[32m' + (client ? client.id : client) +
      '\x1b[0m subscribed to topics: ' + subscriptions.map(s => s.topic).join('\n'), 'from broker', aedes.id)
 })

 aedes.on('unsubscribe', (subscriptions, client) => {
  console.log('MQTT client \x1b[32m' + (client ? client.id : client) +
      '\x1b[0m unsubscribed to topics: ' + subscriptions.join('\n'), 'from broker', aedes.id)
 })

  // fired when a client connects
aedes.on('client', (client) => {
  console.log('Client Connected: \x1b[33m' + (client ? client.id : client) + '\x1b[0m', 'to broker', aedes.id)
});

const onError = (client, error) => {
  console.log(`MQTT Error: id: ${client ? client.id : null}: ${error.name}: ${error.message}`);
};
aedes.on('clientError', onError);
aedes.on('connectionError', onError);

// fired when a client disconnects
aedes.on('clientDisconnect', (client) => {
  console.log('Client Disconnected: \x1b[31m' + (client ? client.id : client) + '\x1b[0m', 'to broker', aedes.id)
});

// fired when a message is published
aedes.on('publish', (packet, client) => {
  console.log('Client \x1b[31m' + (client ? client.id : 'BROKER_' + aedes.id) + '\x1b[0m has published', packet.payload.toString(), 'on', packet.topic, 'to broker', aedes.id)
});

aedes.on('ack', (packet, client) => {
  console.log('ack', client?.id);
});

aedes.on('connackSent', (packet, client) => {
  console.log('acksent', client?.id);
});

aedes.on('ping', (packet, client) => {
  console.log('ping');
});

// import the module
import mdns from 'mdns';
 
// watch all http servers
const browser = mdns.createBrowser(mdns.tcp('mqtt'));
browser.on('serviceUp', service => {
  console.log("MDNS service up: ", service);
});
browser.on('serviceDown', service => {
  console.log("MDNS service down: ", service);
});
browser.start();

// advertise a http server on port 4321
const ad = mdns.createAdvertisement(mdns.tcp('mqtt'), 1883, {
  name: 'living-room-mothership-broker'
});
ad.start();

const app = new Koa();

const router = new Router();
router
  .get('/control/test', async (ctx, next) => {
    console.log('IN /CONTROL/TEST');
  })

app
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(port);

