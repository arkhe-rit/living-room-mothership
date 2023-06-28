import { clientSocket } from "../translator/socket";

const messageBus = clientSocket();
messageBus.emit('client-status', 'dashboard connected');

//TODO: update the values of the numbers at the end of the slideres on launch, or ensure the sliders start at 0


// When channel slider is updated, send a GET request to server
document.querySelector('#channel-select').onchange = (e) => {
    document.querySelector('#channel-state').innerHTML = e.target.value;
    //fetch('http://localhost:5555/CONTROL/set/tv/channel?channel=' + document.querySelector('#channel').value); // Broken, working on fix
    //showVideo(Math.floor(e.target.value / 2)); // Temporary fix for above problem

    //TODO: change the emit to be a timeout that expects a return of what video was swapped to
    //https://socket.io/docs/v3/emitting-events/#acknowledgements
    messageBus.emit('tv/request/channel', e.target.value);
}

// When filter slider is updated, send a GET request to server
document.querySelector('#filter-select').onchange = (e) => {
    document.querySelector('#filter-state').innerHTML = e.target.value;
    //fetch('http://localhost:5555/CONTROL/set/tv/filter?filter=' + e.target.value);
    messageBus.emit('tv/request/filter', e.target.value);
    //TODO: add emit to the tv to change the filter
}

// When e-ink slider is updated, send a GET request to server
document.querySelector('#eink-select').onchange = () => {
    console.log("E-ink state changed to: " + e.target.value);
    //fetch('http://localhost:5555/CONTROL/set/eink?eink=' + e.target.value);
}
