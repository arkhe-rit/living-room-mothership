import { clientSocket } from "../translator/socket";
import * as shaders from "./shaders";

// Set up socket, connect to server, and identify self
const projectorToTranslator = clientSocket();
projectorToTranslator.on("connect", () => {
    projectorToTranslator.emit('identify/filter');
});

// Listen for relevant messages
projectorToTranslator.on('signal/tv/filter', (inputState, reply) => {    // inputState will be an integer between 0-9
    // Do whatever the hell you want with all the code below:
    console.log("Switch Shader Call with Value: " + inputState);
    // Pass value to function call that does the thing
    //switchShader(inputState); // I think this is the function call it should make?
})


const DEBUG = false;

//Load the canvases and video elements
const canvas = document.getElementById('myCanvas');
const gl = canvas.getContext('webgl');

const backBuffer = document.getElementById('backBuffer');
const bbCTX = backBuffer.getContext('2d');
//set the backbuffer size to be the same as the main canvas
backBuffer.width = canvas.width;
backBuffer.height = canvas.height;
gl.viewport(0, 0, canvas.width, canvas.height);

const video = document.getElementById('content');

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
    noiseImage.src = 'media/noise.png';
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
    requestAnimationFrame(render);
}

const initControls = () => {
    const shaderSelect = document.getElementById('shader-select');
    shaderSelect.onchange = e => {
        shaders.switchShader(shaderSelect.value, gl);
        //generate an html input field for each uniform in the shader and append them to the 'shader-settings' span
        //if the value of the key is a boolean make a checkbox, otherwise make a number input
        const settings = shaderUniforms[shaders.shaderProgramIndex];
        const settingsSpan = document.getElementById('shader-settings');
        settingsSpan.innerHTML = '';
        Object.keys(settings).forEach(key => {
            const type = typeof settings[key];
            const newInput = document.createElement('input');
            newInput.type = type === 'boolean' ? 'checkbox' : 'number';
            newInput.id = key;
            newInput.name = key;
            if (type === 'boolean') {
                newInput.checked = settings[key];
            }
            else {
                newInput.value = settings[key];
            }
            newInput.onchange = e => {
                settings[key] = type === 'boolean' ? e.target.checked : parseFloat(e.target.value);
            }
            const newLabel = document.createElement('label');
            newLabel.htmlFor = key;
            newLabel.innerHTML = key;
            settingsSpan.appendChild(newLabel);
            settingsSpan.appendChild(newInput);
        });
    }
    shaderSelect.onchange();

    const videoSelect = document.getElementById('video-select');
    videoSelect.onchange = e => {
        video.play();
        video.src = `media/${videoSelect.value}`;
        video.play();
    }
}

//init
(() => {
    shaders.loadShaders(gl).then(() => {
        shaders.initVertexBuffer(gl);
        loadTextures();
        initControls();
        console.log('Starting video...')
        video.play();
        render();
    });
})();