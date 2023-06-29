window.onload = (e) => {document.querySelector("#message-sender").onclick = sendMessage};

let messageList = document.querySelector("#message-list");
let numMessages = 0;

function sendMessage() {
    let message = document.querySelector("#message-selector-input").value;
    message= message.trim();
    if(message.length == 0) { return; } // Message is blank, so do nothing. TO-DO: Add feedback to user that message is blank.

    // Create new message
    var newMessage = document.createElement("li");
    newMessage.innerHTML += '<p class="message-channel">' + document.querySelector("#channel-selector-input").value + '</p>';
    newMessage.innerHTML += '<p class="message-content">' + message + '</p>';

    // Alternate background colors of messages
    if(numMessages % 2) { newMessage.style.backgroundColor = "white"; }
    else { newMessage.style.backgroundColor = "whitesmoke"; }
    numMessages++;
    
    // Add message to list
    messageList.appendChild(newMessage);

    // Auto-scroll to bottom
    messageList.scrollTop = messageList.scrollHeight;   
}



