import { createBusClient } from "../../toolbox/messageBusClient.js";
import * as shaders from "./shaders";

// Set up socket, connect to server, and identify self
const messageBus = createBusClient()();
messageBus.subscribe('projector/tv', (message) => {
    switch (message.type) {
        case 'command':
            switch (message.command) {
                case 'change-video':
                    let newChannel = message.value % videos.length;
                    console.log(`Now playing: ${changeVideo(newChannel)}`);
                    break;
                case 'change-filter':
                    //shader filter settings: [horizontalTearStrength, blackWhite, verticalJerk, chromaticAberration]
                    shaders.switchShader(message.value, gl);
                    //console.log(`Now using filter: ${shaders.shaderProgramIndex}`)
                    break;
            }
            break;
    }
});

///

const DEBUG = false;

//Load the canvases and video elements
const canvas = document.getElementById('main-canvas');
const gl = canvas.getContext('webgl');
canvas.height = window.screen.height;
canvas.width = window.screen.width;
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

const backBuffer = document.getElementById('back-buffer');
const bbCTX = backBuffer.getContext('2d');
//set the backbuffer size to be the same as the main canvas
backBuffer.width = canvas.width;
backBuffer.height = canvas.height;
gl.viewport(0, 0, canvas.width, canvas.height);

const video = document.getElementById('content');
const videos = [
    new URL('../media/CommercialLoopColor.mp4', import.meta.url),
    new URL('../media/CommercialLoopBW.mp4', import.meta.url),
    new URL('../media/CommercialLoopHalfColor.mp4', import.meta.url),
    new URL('../media/static.mp4', import.meta.url),
    new URL('../media/travis.mov', import.meta.url)
]
const changeVideo = (index) => {
    const newVid = videos[index];
    video.play();
    video.src = newVid;
    video.play();
    return newVid;
}

if (DEBUG) {
    video.hidden = false;
    backBuffer.hidden = false;
}

let frameCount = 0;
//the render loop that runs every frame
const render = () => {
    //console.log('Rendering...')
    //render the current frame of the video to the back buffer
    bbCTX.drawImage(video, 0, 0, backBuffer.width, backBuffer.height);

    //active the correct texture slot and bind a new texture to it
    gl.activeTexture(gl.TEXTURE0);
    const frameTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, frameTexture);
    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    //take the back buffer image data and generate a texture from it
    const imageData = bbCTX.getImageData(0, 0, backBuffer.width, backBuffer.height);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageData);

    if (DEBUG) {
        //write text to the back buffer canvas labelling it as the back buffer
        bbCTX.font = "30px Arial";
        bbCTX.fillStyle = "white";
        bbCTX.fillText("Back Buffer", 10, 50);
    }

    frameCount++;
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Set the universal uniform values
    const u_resolutionLocation = gl.getUniformLocation(shaders.getShaderProgram(), 'u_resolution');
    const u_timeLocation = gl.getUniformLocation(shaders.getShaderProgram(), 'u_time');
    const u_textureLocation = gl.getUniformLocation(shaders.getShaderProgram(), 'u_texture');
    const u_frameLocation = gl.getUniformLocation(shaders.getShaderProgram(), 'u_frameCount');

    // Pass the canvas resolution
    gl.uniform3f(u_resolutionLocation, canvas.width, canvas.height, 0.0);

    // Pass the current time and frame count
    gl.uniform1f(u_timeLocation, performance.now() / 1000);
    gl.uniform1f(u_frameLocation, frameCount);

    // Pass the texture and noise texture
    gl.uniform1i(u_textureLocation, 0);

    // Draw the rectangle
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    setTimeout(() => {
        requestAnimationFrame(render);
    }, 1000 / 24);
}

//init
(() => {
    shaders.loadShaders(gl).then(() => {
        shaders.initVertexBuffer(gl);
        console.log('Starting video...')
        video.play();
        render();
    });
})();