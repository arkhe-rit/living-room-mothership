import { clientSocket } from "../translator/socket";

// Set up socket, connect to server, and identify self
const projectorToTranslator = clientSocket();
projectorToTranslator.on("connect", () => {
  projectorToTranslator.emit('identify/eink');
});

// Listen for relevant messages
projectorToTranslator.on('signal/eink', (inputState, reply) => {    // inputState will be an integer between 0-9
    // Do whatever the hell you want with all the code below:
    
    // Convert inputState to relevant value
    inputState *= 27;
    // Pass value to function call that does the thing
    doThing(inputState);
  })

// Demo Function
function doThing(i) {
    console.log("I did a thing with this value: " + i);
}