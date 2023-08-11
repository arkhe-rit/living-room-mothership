import { createBusClient } from "../toolbox/messageBusClient";
import * as defaultPresets from "./presets";

const knownChannels = [
    "*",
    "projector/tv",  
    "projector/eink",
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
    document.querySelector("#add-preset-button").onclick = addPreset;
    document.querySelector("#filter-select-none").onclick = () => selectAllFilters(false);
    document.querySelector("#filter-select-all").onclick = () => selectAllFilters(true);

    loadChannels();
    loadTranslators();
    loadFilters();
    loadPresets();
};

// Create a messageBus to send and receive messages from redis. 
// Callback functions are called when a message is received from the correspoonding channel.
const messageBus = createBusClient();
messageBus.subscribe('translator', (message, channel) => {
    if (message.command == 'activate-translator' || message.command == 'deactivate-translator') {
        loadTranslators();
    }
});
messageBus.subscribe('*', (message, channel) => {
    if (!knownChannels.includes(channel)) {
        knownChannels.push(channel);
        addFilter(channel);
        loadChannels();
    }
    updateLog(String(channel), JSON.stringify(message));
    if (message.command === "partytime") {
        partyTime(message.value);
    }
});
    

const messagesDict = {};
// Fills channel selector dropdown with valid channels. Could just hardcode in HTML but see TODO...
const channelDropdown = document.querySelector("#channel-selector-input");
const loadChannels = () => {

    knownChannels.slice(channelDropdown.childElementCount).forEach((channel) => {
        const option = document.createElement("option");
        option.value = option.innerHTML = channel;
        channelDropdown.appendChild(option);
        messagesDict[channel] = [];
    });
}

const loadTranslators = async () => {
    const activeTranslators = await messageBus.request(
        'translator/active-translators', 
        JSON.stringify({
            type: 'query',
            query: 'active-translators'
        })
    );
    console.log('Active translators:', activeTranslators);
}

//#region Filters

const filterDiv = document.querySelector("#messages-filter");
let activeFilters = {};
const loadFilters = () => {
    let storedFilters = JSON.parse(localStorage.getItem('activeFilters'));
    if (storedFilters) {
        activeFilters = storedFilters;
    }
    else {
        knownChannels.forEach((channel) => activeFilters[channel] = true);
    }

    knownChannels.forEach((channel) => addFilter(channel));
}

const addFilter = (channel) => {
    if (activeFilters[channel] === undefined) {
        activeFilters[channel] = true;
    }
    const div = document.createElement("div");
    const filter = document.createElement("input");
    filter.type = "checkbox";
    filter.value = channel;
    filter.checked = activeFilters[channel];
    filter.onchange = e => {
        if (e.target.checked) {
            activeFilters[e.target.value] = true;
            messagesDict[channel].forEach((message) => {
                message.style.height = "fit-content";
                message.style.padding = "4px 2vw";
            });
        }
        else {
            activeFilters[e.target.value] = false;
            messagesDict[channel].forEach((message) => {
                message.style.height = "0px";
                message.style.padding = "0px";
            });
        }
        localStorage.setItem('activeFilters', JSON.stringify(activeFilters));
    };
    div.appendChild(filter);
    const label = document.createElement("label");
    label.innerHTML = channel;
    label.attributes.for = channel;
    div.appendChild(label);
    filterDiv.appendChild(div);
}

const selectAllFilters = (enableAll) => {
    filterDiv.querySelectorAll("input").forEach((filter) => {
        if (filter.checked != enableAll) {
            filter.click();
        }
    });
}
//#endregion

//#region Presets
let presets = defaultPresets.presets;
const loadPresets = () => {
    const presetDiv = document.querySelector("#preset-buttons");

    // Load presets from local storage
    let storedPresets = JSON.parse(localStorage.getItem('presets'));
    if (storedPresets) {
        presets = storedPresets;
    }

    Object.keys(presets).forEach((presetName) => {
        const newPresetButton = document.createElement("button");
        newPresetButton.classList.add("preset");
        newPresetButton.innerHTML = presetName;
        newPresetButton.dataset.presetName = presetName;
        newPresetButton.onclick = presetFill;
        presetDiv.appendChild(newPresetButton);
    });
}

const addPreset = (e) => {
    //create a popup that prompts the user for a name for the preset
    const name = prompt("Enter a name for the preset");

    //get the rest of the preset information from the inputs on the page and add it the presets array
    const channel = document.querySelector("#channel-selector-input").value;
    const type = document.querySelector("#type-selector-input").value;
    const command = document.querySelector("#command-selector-input").value;
    const query = document.querySelector("#query-selector-input").value;
    const value = document.querySelector("#value-selector-input").value;

    presets[name] = {
        channel,
        type,
        command,
        query,
        value
    };

    //write the presets to the user's local storage
    localStorage.setItem('presets', JSON.stringify(presets));
}

const presetFill = (e) => {
    const { channel = "", type = "", query = "", command = "", value = "" } = presets[e.target.dataset.presetName];

    document.querySelector("#channel-selector-input").value = channel;
    document.querySelector("#type-selector-input").value = type;
    document.querySelector("#command-selector-input").value = command;
    document.querySelector("#query-selector-input").value = query;
    document.querySelector("#value-selector-input").value = value;
}
//#endregion

// Checks validity of message and sends to redis. Called when 'Publish' button is clicked.
const sendMessage = () => {
    let channel = document.querySelector("#channel-selector-input").value;
    let messageType = document.querySelector("#type-selector-input").value;
    let messageCommand = document.querySelector("#command-selector-input").value;
    let messageQuery = document.querySelector("#query-selector-input").value;
    let messageValue = document.querySelector("#value-selector-input").value
    if (messageValue.includes('[')) {
        messageValue = messageValue.replace('[', '');
        messageValue = messageValue.replace(']', '');
        messageValue = messageValue.split(',');
        let newMessage = [];
        for (let i = 0; i < messageValue.length; i++) {
            if (!isNaN(Number(messageValue[i]))) {
                newMessage.push(Number(messageValue[i]));
            }
            else {
                newMessage.push(messageValue[i]);
            }
        }
    }
    else if (!isNaN(Number(messageValue))) {
        messageValue = Number(messageValue);
    }

    let jsonMessage = {
        type: messageType,
        command: messageCommand,
        query: messageQuery,
        value: messageValue
    };

    messageBus.publish(channel, JSON.stringify(jsonMessage));

    // Clear message field
    document.querySelector("#command-selector-input").value = "";
    document.querySelector("#query-selector-input").value = "";
    document.querySelector("#value-selector-input").value = "";
}

const messageList = document.querySelector("#message-list");
let numMessages = 0;
const updateLog = (channel, message) => {
    //check if the message list is scrolled to bottom to konw if we should autoscroll
    let shouldScroll = messageList.scrollTop + messageList.clientHeight === messageList.scrollHeight;

    // Add message to log
    let newMessage = document.createElement("li");
    newMessage.innerHTML += '<p class="message-channel">' + channel + '</p>';
    newMessage.innerHTML += '<p class="message-content" style="height: fit-content">' + message + '</p>';
    newMessage.dataset.channel = channel;
    newMessage.style.overflow = "hidden";

    // Alternate background colors of messages
    if(numMessages % 2) { newMessage.style.backgroundColor = "white"; }
    else { newMessage.style.backgroundColor = "whitesmoke"; }
    numMessages++;

    if (!activeFilters[channel]) {
        newMessage.style.height = "0px";
        newMessage.style.padding = "0px";
    }

    // Add message to list
    messageList.appendChild(newMessage);
    messagesDict[channel].push(newMessage);

    // Auto-scroll to bottom. TODO: Only scroll to bottom if user is already scrolled down (like Twitch chat)
    if (shouldScroll) {
        messageList.scrollTop = messageList.scrollHeight;
    }
}

// Updates the status of projectors/observers.
const updateStatus = (client, value) => {
    document.querySelector(client).querySelector('.projector-status').innerHTML = "State: " + value; 
}

// It's party time motherfucker
const partyTime = (e) => {
    if(e==1) {
        document.body.style.backgroundImage = "url(https://tenor.com/view/cat-dj-party-lit-turnt-gif-8761414.gif)";
    }
    else {
        document.body.style.backgroundImage = "";
    }
}

