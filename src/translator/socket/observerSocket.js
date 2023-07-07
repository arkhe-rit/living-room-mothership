import { identifySocketAs } from "./index.js";
import { clientSocket } from "./index.js";

const observerSocket = () => {
  // Establish a connection
  const socket = clientSocket();

  const identifyAsObserver = identifySocketAs("observer"); //rename setupHandshake to identifySocketAs
  const identify = identifyAsObserver(socket);
  identify();

  return socket;
};

export default observerSocket;
