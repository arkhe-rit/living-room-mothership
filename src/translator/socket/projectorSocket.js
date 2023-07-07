import { identifySocketAs } from "./index.js";
import { clientSocket } from "./index.js";

const projectorSocket = () => {
  // Establish a connection
  const socket = clientSocket();

  const identifyAsProjector = identifySocketAs("projector"); //rename setupHandshake to identifySocketAs
  const identify = identifyAsProjector(socket);
  identify();

  return socket;
};

export default projectorSocket;
