import { createBusClient } from "../translator/messageBusClient";

const messageBus = createBusClient();
messageBus.publish('tv/wildcard', 'hello world');

//for, forces the values to be 0 and later will invoke the change event of the sliders to force
//update the TV so the dashboard and the TV are in sync.
//TODO: poll the TV for the current state of the TV and update the sliders to match so the TV is not interrupted by the dashboard
//loading after the TV has started
const channelSelect = document.querySelector('#channel-select');
channelSelect.value = 0;
const filterSelect = document.querySelector('#filter-select');
filterSelect.value = 0;
const einkSelect = document.querySelector('#eink-select');
einkSelect.value = 0;

// When channel slider is updated, send a GET request to server
channelSelect.onchange = (e) => {
    document.querySelector('#channel-state').innerHTML = e.target.value;
    messageBus.publish('tv/channel', e.target.value);
}
channelSelect.dispatchEvent(new Event('change'));

// When filter slider is updated, send a GET request to server
filterSelect.onchange = (e) => {
    document.querySelector('#filter-state').innerHTML = e.target.value;
    messageBus.publish('tv/filter', e.target.value);
}
filterSelect.dispatchEvent(new Event('change'));

// When e-ink slider is updated, send a GET request to server
einkSelect.onchange = (e) => {
    console.log("E-ink state changed to: " + e.target.value);
}
einkSelect.dispatchEvent(new Event('change'));
