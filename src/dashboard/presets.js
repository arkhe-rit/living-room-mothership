export let presets = {
    "Help": {channel: "*", type: "command", command: "help", value: 0 },
    "Configure": {channel: "*", type: "command", command: "config", value: 0 },
    "Shutdown": {channel: "*", type: "command", command: "shutdown", value: 0 },
    "Party Mode": {channel: "dashboard", type: "command", command: "partytime", value: 1 },
    "Change TV Channel": {channel: "projector/tv", type: "command", command: "change-video", value: 0 },
    "Change TV Filter": {channel: "projector/tv", type: "command", command: "change-filter", value: 0 },
    "Change E-Ink Image": {channel: "projector/eink", type: "command", command: "change-image", value: 0 },
    "Change Lamps": { channel: "projector/lamp", type: "command", command: "change-lamps", value: "[false,false]" }
};