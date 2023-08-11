import { createBusClient } from "../toolbox/messageBusClient";
import * as defaultPresets from "./presets";

const knownChannels = [
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
    document.querySelector("#add-preset-button").onclick = createPreset;
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
    if (message.command == 'registered-translator' || message.command == 'deactivate-translator') {
        //loadTranslators();
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
messageBus.subscribe('projector/*', (message, channel) => {
    updateClientStatus("projector", `${channel.split('/')[1]}-${message.command.split('-')[1]}`, message.value);
});
messageBus.subscribe('observer/*', (message, channel) => {
    updateClientStatus("observer", `${channel.split('/')[1]}`, message.value);
});

const messagesDict = {};
// Fills channel selector dropdown with valid channels. Could just hardcode in HTML but see TODO...
const channelDropdown = document.querySelector("#channel-selector-list");
const loadChannels = () => {

    knownChannels.slice(channelDropdown.childElementCount).forEach((channel) => {
        const option = document.createElement("option");
        option.value = option.innerHTML = channel;
        channelDropdown.appendChild(option);
        messagesDict[channel] = [];
    });
}

let registeredTranslators = [];
const loadTranslators = async () => {
    registeredTranslators = await messageBus.request(
        'translator/registered-translators',
        JSON.stringify({
            type: 'query',
            query: 'registered-translators'
        })
    );
    registeredTranslators.forEach(translator => addTranslator(translator));
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
const presetDiv = document.querySelector("#preset-buttons");
const loadPresets = () => {

    // Load presets from local storage
    let storedPresets = JSON.parse(localStorage.getItem('presets'));
    if (storedPresets) {
        presets = storedPresets;
    }

    Object.keys(presets).forEach((presetName) => addPreset(presetName));
}

const createPreset = (e) => {
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
    addPreset(name);
}

const addPreset = (presetName) => {
    const newPresetButton = document.createElement("button");
    newPresetButton.classList.add("preset");
    newPresetButton.innerHTML = presetName;
    newPresetButton.dataset.presetName = presetName;
    newPresetButton.onclick = presetFill;
    presetDiv.appendChild(newPresetButton);
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
    messageValue = parseValue(messageValue);

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
    if (numMessages % 2 === 0) { newMessage.style.backgroundColor = "white"; }
    else { newMessage.style.backgroundColor = "lightgrey"; }
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

const projectorList = document.querySelector("#projector-list");
const observerList = document.querySelector("#observer-list");
const updateClientStatus = (clientType, client, value) => {
    let list;
    switch (clientType) {
        case "projector":
            list = projectorList;
            break;
        case "observer":
            list = observerList;
            break;
        default:
            return;
    }
    let clientElement = list.querySelector(`#${client}`);
    if (!clientElement) {
        const newClient = document.createElement("li");
        newClient.innerHTML = `
            <p class="client-name">Name: ${client}</p>
            <p class="client-status">State: ${value}</p>
        `;
        newClient.id = client;
        clientElement = newClient;
        list.appendChild(newClient);
        return;
    }
    clientElement.querySelector(".client-status").innerHTML = `State: ${value}`;
}

const translatorList = document.querySelector("#translator-list");
const addTranslator = (translator) => {
    const newTranslator = document.createElement("li");
    newTranslator.innerHTML = `
        <span class="translator-name">Name: ${translator.name}</span>
        <span class="translator-status">${translator.enabled ? "Enabled" : "Disabled"}</span>
        <span class="translator-toggle"><button>${translator.enabled ? "Disable" : "Enable"}</button></span>
    `;
    newTranslator.querySelector(".translator-toggle button").onclick = (e) => {
        switch (translator.enabled) {
            case true:
                messageBus.publish('translator', JSON.stringify({
                    type: 'command',
                    command: 'deactivate-translator',
                    value: translator.name
                }));
                e.target.innerHTML = "Enable";
                registeredTranslators.find(t => t.name === translator.name).enabled = false;
                break;
            case false:
                messageBus.publish('translator', JSON.stringify({
                    type: 'command',
                    command: 'activate-translator',
                    value: translator.name
                }));
                e.target.innerHTML = "Disable";
                registeredTranslators.find(t => t.name === translator.name).enabled = true;
                break;
        }
    };
    newTranslator.id = translator.name;
    translatorList.appendChild(newTranslator);
}

// It's party time motherfucker
const partyTime = (e) => {
    if (e == 1) {
        document.body.style.backgroundImage = "url(https://tenor.com/view/cat-dj-party-lit-turnt-gif-8761414.gif)";
    }
    else {
        document.body.style.backgroundImage = "";
    }
}

const parseValue = (value) => {
    let parsedValue;

    if (!isNaN(parsedValue = Number(value))) {
        return parsedValue;
    } else if (value.startsWith('[') && value.endsWith(']')) {
        return parseArray(value.slice(1, -1));
    } else if (value === 'true') {
        return true;
    } else if (value === 'false') {
        return false;
    } else {
        return value;
    }
};

const parseArray = (arrayString) => {
    const elements = arrayString.split(',');
    const parsedElements = elements.map(element => {
        if (element.startsWith('[') && element.endsWith(']')) {
            return parseArray(element.slice(1, -1));
        } else {
            return parseValue(element);
        }
    });
    return parsedElements;
};

const debug = () => {
    messageBus.publish('observer/chairs', JSON.stringify({ "type": "algebra", "value": [Math.round(Math.random()), Math.round(Math.random()), Math.round(Math.random()), Math.round(Math.random())] }));
    messageBus.publish('observer/ardMug', JSON.stringify({ "type": "algebra","value": [Math.floor(Math.random() * 39), Math.round(Math.random())] }));
    setTimeout(debug, 500);
}
//debug();