import { createBusClient } from "../toolbox/messageBusClient";

// Set-up Functions (called when page is loaded)
const allChannels = [];
loadChannels();
window.onload = (e) => {document.querySelector("#message-sender").onclick = sendMessage};

// Create a messageBus to send and receive messages from redis. 
// Callback functions are called when a message is received from the correspoonding channel.
// Currently tv/channel and tv/filter update the status and the log; depenidn gon how quickly data is received 
// from observers, might not want to update log. TODO: Hide duplicate messages in log and show number sent instead.
{
    channel: 'projector/*'
}
const messageBus = createBusClient([
    {
        channel: '*',
        callback: (value, channel) => {
            updateLog(channel, value);
        }
    },
    {
        channel: 'projector/*',
        callback: (value, channel) => {
            updateStatus(channel, value);
        }
    },
    {
        channel: 'tv/channel', 
        callback: (value, channel) => {
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
    // Until we can pull channels from redis, HARD CODE NEW CHANNELS HERE!!!!
    allChannels.push("tv/channel", "tv/filter", "wildcard/*");

    let channelDropdown = document.querySelector("#channel-selector-input");
    let option;

    for(let i = 0; i < allChannels.length; i++) {
        option = document.createElement("option");
        option.value = option.innerHTML = allChannels[i];
        channelDropdown.appendChild(option);
    }
}

// Checks validity of message and sends to redis. Called when 'Publish' button is clicked.
function sendMessage() {
    let channel = document.querySelector("#channel-selector-input").value;
    let message = document.querySelector("#message-selector-input").value;
    message= message.trim();
    if(message.length == 0) { 
        document.querySelector("#message-selector-input").value = "";
        document.querySelector("#message-selector-input").placeholder = "Invalid Input";
        return; // Message is blank, so do nothing.
    }

    // If sent on universal channel, emit message to all known channels
    if(channel == "universal") {
        for(let i = 0; i < allChannels.length; i++) {
            messageBus.publish(allChannels[i], message);
        }
    }
    else {
        // Send message to server
        messageBus.publish(channel, message);  
        /*
        messageBus.publish('projector/tv', {type: 'algebra', algebra: {...}});
        messageBus.publish('projector/tv/command', {type:'command', command:'change-channel', channel:4}); 
        */
    }

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



