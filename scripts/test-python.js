import { _testRelay } from "../src/observer/src/pythonRelay.js";

const [nodeExe, testPythonJs, fileName] = process.argv;

_testRelay(fileName);
