import { showVideo } from "./channel"

// When channel slider is updated, send a GET request to server
document.querySelector('#channel').onchange = () => {
    document.querySelector('#channelState').innerHTML = document.querySelector('#channel').value;

    //fetch('http://localhost:5555/CONTROL/set/tv/channel?channel=' + document.querySelector('#channel').value); // Broken, working on fix
    showVideo(Math.floor(document.querySelector('#channel').value / 2)); // Temporary fix for above problem
}

// When filter slider is updated, send a GET request to server
document.querySelector('#filter').onchange = () => {
    document.querySelector('#filterState').innerHTML = document.querySelector('#filter').value;

    fetch('http://localhost:5555/CONTROL/set/tv/filter?filter=' + document.querySelector('#filter').value);
}

// When e-ink slider is updated, send a GET request to server
document.querySelector('#eink').onchange = () => {
    console.log("E-ink state changed to: " + document.querySelector('#eink').value);

    fetch('http://localhost:5555/CONTROL/set/eink?eink=' + document.querySelector('#eink').value);
}
