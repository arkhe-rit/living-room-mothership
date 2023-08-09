import { createBusClient } from "../toolbox/messageBusClient";
import { presets } from "./presets";

const knownChannels = [
    "*",
    "projector/tv",  
    "projector/epaper",
    "projector/lamp",
    "observer/chairs",
    "observer/coffee",
    "observer/rug",
    "translator",
    "dashboard"
];

// Set-up Functions
window.onload = (e) => {
    document.querySelector("#message-sender-button").onclick = sendMessage;
    document.querySelectorAll(".preset").forEach((element) => element.onclick = presetFill);
    loadChannels();
    loadTranslators();
    loadFilters();
    console.log(presets);
};

// Create a messageBus to send and receive messages from redis. 
// Callback functions are called when a message is received from the correspoonding channel.
const messageBus = createBusClient()([
    {
        channel: 'translator',
        callback: (message, channel) => {
            if (message.command == 'activate-translator' || message.command == 'deactivate-translator') {
                loadTranslators();
            }
        }
    },
    {
        channel: '*',
        callback: (message, channel) => {
            if (!knownChannels.includes(channel)) {
                knownChannels.push(channel);
                loadChannels();
                loadFilters();
                activeFilters.add(channel);
            }
            updateLog(String(channel), JSON.stringify(message));
        }
    }
]);

const messagesDict = {};
// Fills channel selector dropdown with valid channels. Could just hardcode in HTML but see TODO...
const loadChannels = () => {
    const channelDropdown = document.querySelector("#channel-selector-input");

    knownChannels.slice(channelDropdown.childElementCount).forEach((channel) => {
        const option = document.createElement("option");
        option.value = option.innerHTML = channel;
        channelDropdown.appendChild(option);
        messagesDict[channel] = [];
    });
}

const loadTranslators = () => {
    const translatorRequest = {
        type: 'command',
        command: 'get-active-translators'
    }
    messageBus.once('translator', JSON.stringify(translatorRequest), (reponse) => {
        const activeTranslators = reponse.value;
        console.log(activeTranslators);
    });
}

const activeFilters = new Set(knownChannels);
const loadFilters = () => {
    const filterDiv = document.querySelector("#messages-filter");

    knownChannels.slice(filterDiv.childElementCount).forEach((channel) => {
        const div = document.createElement("div");
        const filter = document.createElement("input");
        filter.type = "checkbox";
        filter.value = channel;
        filter.checked = true;
        filter.onchange = e => {
            const messageList = document.querySelector("#message-list");
            console.log(e.target);
            if (e.target.checked) {
                activeFilters.add(e.target.value);
                messagesDict[channel].forEach((message) => {
                    message.style.visibility = "visible";
                });
            }
            else {
                activeFilters.delete(e.target.value);
                messagesDict[channel].forEach((message) => {
                    message.style.visibility = "hidden";
                });
            }
        };
        div.appendChild(filter);
        const label = document.createElement("label");
        label.innerHTML = channel;
        label.attributes.for = channel;
        div.appendChild(label);
        filterDiv.appendChild(div);
    });
}

// Checks validity of message and sends to redis. Called when 'Publish' button is clicked.
const sendMessage = () => {
    let channel = document.querySelector("#channel-selector-input").value;
    let messageType = document.querySelector("#type-selector-input").value;
    let messageCommand = document.querySelector("#command-selector-input").value;
    let messageValue = document.querySelector("#value-selector-input").value
    if (messageValue.includes('[')) {
        messageValue = messageValue.replace('[', '');
        messageValue = messageValue.replace(']', '');
        messageValue = messageValue.split(',');
        let newMessage = [];
        for (let i = 0; i < messageValue.length; i++) {
            newMessage[i] = parseFloat(messageValue[i]);
        }
    }
    else {
        messageValue = parseFloat(messageValue);
    }

    let jsonMessage = {
        type: messageType,
        command: messageCommand,
        value: messageValue
    };

    messageBus.publish(channel, JSON.stringify(jsonMessage));

    // Clear message field
    document.querySelector("#command-selector-input").value = "";
    document.querySelector("#value-selector-input").value = "";
}

const messageList = document.querySelector("#message-list");
let numMessages = 0;
const updateLog = (channel, message) => {
    // Add message to log
    let newMessage = document.createElement("li");
    newMessage.innerHTML += '<p class="message-channel">' + channel + '</p>';
    newMessage.innerHTML += '<p class="message-content">' + message + '</p>';
    newMessage.dataset.channel = channel;

    // Alternate background colors of messages
    if(numMessages % 2) { newMessage.style.backgroundColor = "white"; }
    else { newMessage.style.backgroundColor = "whitesmoke"; }
    numMessages++;

    if (!activeFilters.has(channel)) {
        newMessage.style.visibility = "hidden";
    }

    // Add message to list
    messageList.appendChild(newMessage);
    messagesDict[channel].push(newMessage);

    // Auto-scroll to bottom. TODO: Only scroll to bottom if user is already scrolled down (like Twitch chat)
    messageList.scrollTop = messageList.scrollHeight; 
}

const presetFill = (e) => {
    document.querySelector("#channel-selector-input").value = presets[e.target.dataset.presetId].channel;
    document.querySelector("#type-selector-input").value = presets[e.target.dataset.presetId].type;
    document.querySelector("#command-selector-input").value = presets[e.target.dataset.presetId].command;
    document.querySelector("#value-selector-input").value = presets[e.target.dataset.presetId].value;
}

// Updates the status of projectors/observers.
const updateStatus = (client, value) => {
    document.querySelector(client).querySelector('.projector-status').innerHTML = "State: " + value; 
}