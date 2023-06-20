const DEBUG = false;

///functions
const fetchShaderSource = async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch shader source from ${url}: ${response.status} ${response.statusText}`);
    }
    return await response.text();
}

const createShader = (gl, type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

const createProgram = (gl, vertexShader, fragmentShader) => {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Shader program linking error:', gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }

    return program;
}

//Load the canvases and video elements
const canvas = document.getElementById('myCanvas');
const gl = canvas.getContext('webgl');

const backBuffer = document.getElementById('backBuffer');
const bbCTX = backBuffer.getContext('2d');
//set the backbuffer size to be the same as the main canvas
backBuffer.width = canvas.width;
backBuffer.height = canvas.height;
gl.viewport(0, 0, canvas.width, canvas.height);

// Add a mousemove event listener to update the value of u_mouse
canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Convert mouse coordinates to WebGL coordinates (-1 to 1)
    const uMouseX = (mouseX / canvas.width);
    const uMouseY = 1 - (mouseY / canvas.height);
    //console.log(mouseX, mouseY, uMouseX, uMouseY);

    // Set the value of u_mouse uniform
    gl.uniform2f(uMouseLocation, uMouseX, uMouseY);
});

const video = document.getElementById('content');

if (DEBUG) {
    video.hidden = false;
    backBuffer.hidden = false;
}

///Shader Creation and Pogram Setup
const fragShaders = [
    'frag-shader-0.glsl',
    'frag-shader-1.glsl',
    'frag-shader-2.glsl',
    'frag-shader-3.glsl',
    'frag-shader-4.glsl'
];
const shaderPrograms = [];
let shaderProgramIndex = 0;
const getShaderProgram = () => shaderPrograms[shaderProgramIndex];
const loadShaders = async () => {
    console.log('Loading shaders...');
    const vertexShaderSource = await fetchShaderSource('vert-shader.glsl');
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);

    for (let fragShader of fragShaders) {
        const fragmentShaderSource = await fetchShaderSource(fragShader);
        const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
        const newProgram = createProgram(gl, vertexShader, fragmentShader);
        shaderPrograms.push(newProgram);
        console.log(`Loaded shader program ${fragShader}`);
    }

    gl.useProgram(getShaderProgram());
}

const incrementShader = () => {
    switchShader((shaderProgramIndex + 1) % shaderPrograms.length);
}

const switchShader = (index) => {
    shaderProgramIndex = index;
    gl.useProgram(getShaderProgram());
    initVertexBuffer();
    console.log(`Switched to shader program ${shaderProgramIndex}`);
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
    noiseImage.src = 'noise.png';
}

let uMouseLocation;
const initVertexBuffer = () => {
    console.log('Initializing vertex buffer...');
    // Create a buffer for the vertex positions
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [
        -1, 1,
        -1, -1,
        1, -1,
        1, -1,
        1, 1,
        -1, 1
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    // Set up the attribute and uniform locations
    const a_positionLocation = gl.getAttribLocation(getShaderProgram(), 'a_position');
    gl.enableVertexAttribArray(a_positionLocation);
    gl.vertexAttribPointer(a_positionLocation, 2, gl.FLOAT, false, 0, 0);

    uMouseLocation = gl.getUniformLocation(getShaderProgram(), 'u_mouse');
}

let frameCount = 0;

//the render loop that runs every frame
const render = () => {
    console.log('Rendering...')
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

    // Set the uniform values
    const u_resolutionLocation = gl.getUniformLocation(getShaderProgram(), 'u_resolution');
    const u_timeLocation = gl.getUniformLocation(getShaderProgram(), 'u_time');
    const u_textureLocation = gl.getUniformLocation(getShaderProgram(), 'u_texture');
    //const u_noiseTextureLocation = gl.getUniformLocation(getShaderProgram(), 'u_noiseTexture');
    const u_frameLocation = gl.getUniformLocation(getShaderProgram(), 'u_frameCount');

    // Pass the canvas resolution
    gl.uniform3f(u_resolutionLocation, canvas.width, canvas.height, 0.0);

    // Pass the current time and frame count
    gl.uniform1f(u_timeLocation, performance.now() / 1000);
    gl.uniform1f(u_frameLocation, frameCount);

    // Pass the texture and noise texture
    gl.uniform1i(u_textureLocation, 0);
    //gl.uniform1i(u_noiseTextureLocation, 1);

    // Draw the rectangle
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(render);
}

const initControls = () => {
    const shaderSelect = document.getElementById('shader-select');
    shaderSelect.onchange = (event) => {
        switchShader(event.target.value);
    }
    shaderSelect.value = shaderProgramIndex;
}

(() => {
    loadShaders().then(() => {
        initVertexBuffer();
        loadTextures();
        initControls();
        console.log('Starting video...')
        video.play();
        render();
    });
})();