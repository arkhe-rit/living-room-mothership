export const presets = [
    { channel: "*",                   type: "command",      command: "help",              value: 0 },
    { channel: "*",                   type: "command",      command: "config",            value: 0 },
    { channel: "*",                   type: "command",      command: "shutdown",          value: 0 },
    { channel: "dashboard",           type: "command",      command: "partytime",         value: 1 },
    { channel: "projector/tv",        type: "command",      command: "change-video",      value: 0 },
    { channel: "projector/tv",        type: "command",      command: "change-filter",     value: 0 },
    { channel: "projector/eink",      type: "command",      command: "change-image",      value: 0 },
    { channel: "projector/lamp",      type: "command",      command: "change-lamps",      value: 0 }
];