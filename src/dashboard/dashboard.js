import { createBusClient } from "../toolbox/messageBusClient";
import { presets } from "./presets";

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
    document.querySelectorAll(".preset").forEach((element) => {
        element.onclick = (e) => {
            const pre = presets[e.target.dataset.presetId];
            presetFill(pre.channel, pre.type, pre.command, pre.query, pre.value);
        };
    });
    loadChannels();
    loadTranslators();
    loadFilters();
    console.log('Presets:', presets);
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
        loadChannels();
        loadFilters();
        activeFilters.add(channel);
    }
    updateLog(String(channel), JSON.stringify(message));
});
    

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
            console.log(e.target);
            if (e.target.checked) {
                activeFilters.add(e.target.value);
                messagesDict[channel].forEach((message) => {
                    message.style.height = "fit-content";
                    message.style.padding = "4px 2vw";
                });
            }
            else {
                activeFilters.delete(e.target.value);
                messagesDict[channel].forEach((message) => {
                    message.style.height = "0px";
                    message.style.padding = "0px";
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
    let messageQuery = document.querySelector("#query-selector-input").value;
    let messageValue = document.querySelector("#value-selector-input").value;

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

    if (!activeFilters.has(channel)) {
        newMessage.style.height = "0px";
        newMessage.style.padding = "0px";
    }

    newMessage.addEventListener('click', (e) => {
        try {
            const parsed = JSON.parse(message);
            if (parsed.type === undefined) return;

            presetFill(channel, parsed.type, parsed.command, parsed.query, parsed.value);
        } catch (e) {
            console.log('Error:', e);
        }
    });

    // Add message to list
    messageList.appendChild(newMessage);
    messagesDict[channel].push(newMessage);

    // Auto-scroll to bottom. TODO: Only scroll to bottom if user is already scrolled down (like Twitch chat)
    messageList.scrollTop = messageList.scrollHeight;
}

const presetFill = (channel, type, command, query, value) => {
    document.querySelector("#channel-selector-input").value = channel;
    document.querySelector("#type-selector-input").value = type;
    document.querySelector("#command-selector-input").value = command;
    document.querySelector("#query-selector-input").value = query;
    document.querySelector("#value-selector-input").value = value;
}

// Updates the status of projectors/observers.
const updateStatus = (client, value) => {
    document.querySelector(client).querySelector('.projector-status').innerHTML = "State: " + value; 
}