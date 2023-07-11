import { createBusClient } from "../translator/messageBusClient";

// Set-up Functions (called when page is loaded)
loadChannels();
window.onload = (e) => {document.querySelector("#message-sender").onclick = sendMessage};

// Create a messageBus to send and receive messages from redis. 
// Callback functions are called when a message is received from the correspoonding channel.
// Currently tv/channel and tv/filter update the status and the log; depenidn gon how quickly data is received 
// from observers, might not want to update log. TODO: Hide duplicate messages in log and show number sent instead.
const messageBus = createBusClient([
    {
        channel: 'tv/channel', 
        callback: (value) => {
            updateStatus('#tv-channel', value);
            updateLog('tv/channel', value);
        }
    },
    {
        channel: 'tv/filter',
        callback: (value) => {
            updateStatus('#tv-filter', value);
            updateLog('tv/filter', value);
        }
    },
    {
        channel: 'wildcard/*',
        callback: (value) => {
            console.log("Unknown request received: " + value);
            updateLog('wildcard/*', value);
        }
    }
]);

// Fills channel selector dropdown with valid channels. Could just hardcode in HTML but see TODO...
// TODO: See if we can pull channels from redis here. Not sure if possible.
function loadChannels() {
    let channels = document.querySelector("#channel-selector-input");
    let option;
    
    option = document.createElement("option");
    option.value = option.innerHTML = "tv/channel";
    channels.appendChild(option);

    option = document.createElement("option");
    option.value = option.innerHTML = "tv/filter";
    channels.appendChild(option);

    option = document.createElement("option");
    option.value = option.innerHTML = "wildcard/*";
    channels.appendChild(option);

    // Until we can pull channels from redis, HARD CODE NEW CHANNELS HERE!!!!
    /*
    option = document.createElement("option");
    option.value = option.innerHTML = "projector/epaper";
    channels.appendChild(option);

    option = document.createElement("option");
    option.value = option.innerHTML = "projector/radio";
    channels.appendChild(option);
    */
}

// Checks validity of message and sends to redis. Called when 'Publish' button is clicked.
function sendMessage() {
    let channel = document.querySelector("#channel-selector-input").value;
    let message = document.querySelector("#message-selector-input").value;
    message= message.trim();
    if(message.length == 0) { return; } // Message is blank, so do nothing. TODO: Add feedback to user that message is blank.

    // Send message to server
    messageBus.publish(channel, message);  

    // Clear message field
    document.querySelector("#message-selector-input").value = "";
}


let messageList = document.querySelector("#message-list");
let numMessages = 0;
function updateLog(channel, message) {
    // Add message to log
    var newMessage = document.createElement("li");
    newMessage.innerHTML += '<p class="message-channel">' + channel + '</p>';
    newMessage.innerHTML += '<p class="message-content">' + message + '</p>';

    // Alternate background colors of messages
    if(numMessages % 2) { newMessage.style.backgroundColor = "white"; }
    else { newMessage.style.backgroundColor = "whitesmoke"; }
    numMessages++;

    // Add message to list
    messageList.appendChild(newMessage);

    // Auto-scroll to bottom. TODO: Only scroll to bottom if user is already scrolled down (like Twitch chat)
    messageList.scrollTop = messageList.scrollHeight; 
}

// Updates the status of projectors/observers.
const updateStatus = (client, value) => {
    document.querySelector(client).querySelector('.projector-status').innerHTML = "State: " + value; 
}



