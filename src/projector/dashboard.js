import { clientSocket } from "../translator/socket";

const messageBus = clientSocket();
messageBus.emit('client-status', 'dashboard connected');

//TODO: update the values of the numbers at the end of the slideres on launch, or ensure the sliders start at 0
const channelSelect = document.querySelector('#channel-select');
channelSelect.value = 0;
const filterSelect = document.querySelector('#filter-select');
filterSelect.value = 0;
const einkSelect = document.querySelector('#eink-select');
einkSelect.value = 0;

// When channel slider is updated, send a GET request to server
channelSelect.onchange = (e) => {
    document.querySelector('#channel-state').innerHTML = e.target.value;
    //TODO: change the emit to be a timeout that expects a return of what video was swapped to
    //https://socket.io/docs/v3/emitting-events/#acknowledgements
    messageBus.emit('tv/request/channel', e.target.value);
}
channelSelect.dispatchEvent(new Event('change'));

// When filter slider is updated, send a GET request to server
filterSelect.onchange = (e) => {
    document.querySelector('#filter-state').innerHTML = e.target.value;
    messageBus.emit('tv/request/filter', e.target.value);
    //TODO: add emit to the tv to change the filter
}
filterSelect.dispatchEvent(new Event('change'));

// When e-ink slider is updated, send a GET request to server
einkSelect.onchange = (e) => {
    console.log("E-ink state changed to: " + e.target.value);
}
einkSelect.dispatchEvent(new Event('change'));
