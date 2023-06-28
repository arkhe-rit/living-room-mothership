import { clientSocket } from "../../translator/socket";
import * as shaders from "./shaders";

// Set up socket, connect to server, and identify self
const messageBus = clientSocket();
messageBus.emit('client-status', 'tv connected');

// Listen for relevant messages
messageBus.on('tv/request/channel', (value) => {
    console.log("Channel request received: " + value);
    value %= videos.length;
    console.log(`Now playing: ${changeVideo(value)}`);
    //TODO: change the above to send a message back to the server saying that the video was 
    //successfully swapped and what video it was swapped to so the dashboard can update
});
messageBus.on('tv/request/filter', (value) => {
    console.log("Filter request received: " + value);
    shaders.switchShader(value, gl);
    console.log(`Now using filter: ${shaders.shaderProgramIndex}`)
});

///

const DEBUG = false;

//Load the canvases and video elements
const canvas = document.getElementById('main-canvas');
const gl = canvas.getContext('webgl');
canvas.height = window.screen.height;
canvas.width = window.screen.width;

const backBuffer = document.getElementById('back-buffer');
const bbCTX = backBuffer.getContext('2d');
//set the backbuffer size to be the same as the main canvas
backBuffer.width = canvas.width;
backBuffer.height = canvas.height;
gl.viewport(0, 0, canvas.width, canvas.height);

const video = document.getElementById('content');
const videos = [
    new URL('../media/heroquest.mp4', import.meta.url),
    new URL('../media/luckyStrike.mp4', import.meta.url),
    new URL('../media/roc_commercials.mp4', import.meta.url),
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

///Image Texture Setup
const loadTextures = async () => {
    console.log('Loading textures...')
    //flips the pixel order of read-in texture data since the underlying gl functions expect the data to be processed bottom left first,
    //but the image data is processed top left first
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    // Load the noise image used for one of the fragment shaders
    const noiseTexture = gl.createTexture();
    const noiseImage = new Image();
    noiseImage.onload = function () {
        gl.activeTexture(gl.TEXTURE1);
        // Set the texture parameters
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        //
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, noiseImage);
        gl.bindTexture(gl.TEXTURE_2D, noiseTexture);
    };
    noiseImage.src = '../media/noise.png';
}

let frameCount = 0;
//uniforms that are unique to each shader, the name of the property must be the same as the uniform in the shader
const shaderUniforms = [
    {},
    {
        u_vertMovementOpt: true,
        u_vertJerkOpt: true,
        u_horizonFuzzOpt: true,
        u_bottomStaticOpt: true,
        u_scanlineOpt: true,
        rgbOffsetOpt: true,

        u_jerkFreq: 0.2,
        u_smallFuzzStr: 0.003,
        u_largeFuzzStr: 0.004,
        u_staticStr: 1.5,
        u_staticBounce: 0.3
    },
    {},
    {},
    {}
]
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
    //const u_noiseTextureLocation = gl.getUniformLocation(getShaderProgram(), 'u_noiseTexture');
    const u_frameLocation = gl.getUniformLocation(shaders.getShaderProgram(), 'u_frameCount');

    // Pass the canvas resolution
    gl.uniform3f(u_resolutionLocation, canvas.width, canvas.height, 0.0);

    // Pass the current time and frame count
    gl.uniform1f(u_timeLocation, performance.now() / 1000);
    gl.uniform1f(u_frameLocation, frameCount);

    // Pass the texture and noise texture
    gl.uniform1i(u_textureLocation, 0);

    //per shader uniform settings
    Object.keys(shaderUniforms[shaders.shaderProgramIndex]).forEach(key => {
        gl.uniform1f(gl.getUniformLocation(shaders.getShaderProgram(), key), shaderUniforms[shaders.shaderProgramIndex][key]);
    });

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
        loadTextures();
        //initControls();
        console.log('Starting video...')
        video.play();
        render();
    });
})();