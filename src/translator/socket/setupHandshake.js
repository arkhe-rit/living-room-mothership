/*
  setupHandshake just modifies a given socket with our
  ad-hoc handshake procedure.
*/

const identifySocketAs = componentType => socket => () => {
  socket.emit(`${componentType}/identify`, response => {
    //response will be "hi observer/projector, initial state from translator"
    console.log(`${response} received`);
  });
};

export default identifySocketAs;
