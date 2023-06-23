// When channel slider is updated, send a GET request to server
document.querySelector('#channel-select').onchange = (e) => {
    document.querySelector('#channel-state').innerHTML = e.target.value;
    //fetch('http://localhost:5555/CONTROL/set/tv/channel?channel=' + document.querySelector('#channel').value); // Broken, working on fix
    //showVideo(Math.floor(e.target.value / 2)); // Temporary fix for above problem

}

// When filter slider is updated, send a GET request to server
document.querySelector('#filter-select').onchange = (e) => {
    document.querySelector('#filter-state').innerHTML = e.target.value;
    fetch('http://localhost:5555/CONTROL/set/tv/filter?filter=' + e.target.value);
}

// When e-ink slider is updated, send a GET request to server
document.querySelector('#eink-select').onchange = () => {
    console.log("E-ink state changed to: " + e.target.value);
    fetch('http://localhost:5555/CONTROL/set/eink?eink=' + e.target.value);
}
