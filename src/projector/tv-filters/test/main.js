///functions
async function fetchShaderSource(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch shader source from ${url}: ${response.status} ${response.statusText}`);
    }
    return await response.text();
}

function createShader(gl, type, source) {
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

function createProgram(gl, vertexShader, fragmentShader) {
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

const canvas = document.getElementById('myCanvas');
const gl = canvas.getContext('webgl');
gl.viewport(0, 0, canvas.width, canvas.height);

///Shader Creation and Pogram Setup
const vertexShaderSource = await fetchShaderSource('vert-shader.glsl');
const fragmentShaderSource = await fetchShaderSource('frag-shader-0.glsl');

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
const shaderProgram = createProgram(gl, vertexShader, fragmentShader);
gl.useProgram(shaderProgram);

///Image Texture Setup
// Create a texture object
const texture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, texture);

// Set the texture parameters
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

//flips the pixel order of read-in texture data since the underlying gl functions expect the data to be processed bottom left first,
//but the image data is processed top left first
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

// Load the image
const image = new Image();
image.onload = function () {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    const noiseTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, noiseTexture);
    const noiseImage = new Image();
    image.onload = function () {
        gl.bindTexture(gl.TEXTURE_2D, noiseTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, noiseImage);
        requestAnimationFrame(render);
    }
    image.src = 'noise.png';
};
image.src = 'Travis.jpg';

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
const a_positionLocation = gl.getAttribLocation(shaderProgram, 'a_position');
gl.enableVertexAttribArray(a_positionLocation);
gl.vertexAttribPointer(a_positionLocation, 2, gl.FLOAT, false, 0, 0);

const uMouseLocation = gl.getUniformLocation(shaderProgram, 'u_mouse');

// Add a mousemove event listener to update the value of u_mouse
canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Convert mouse coordinates to WebGL coordinates (-1 to 1)
    const uMouseX = (mouseX / canvas.width);
    const uMouseY = 1- (mouseY / canvas.height);
    //console.log(mouseX, mouseY, uMouseX, uMouseY);

    // Set the value of u_mouse uniform
    gl.uniform2f(uMouseLocation, uMouseX, uMouseY);
});
console.log(canvas.width, canvas.height);
let frameCount = 0;
function render() {
    frameCount++;
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Set the uniform values
    const u_resolutionLocation = gl.getUniformLocation(shaderProgram, 'u_resolution');
    const u_timeLocation = gl.getUniformLocation(shaderProgram, 'u_time');
    const u_textureLocation = gl.getUniformLocation(shaderProgram, 'u_texture');
    const u_noiseTextureLocation = gl.getUniformLocation(shaderProgram, 'u_noiseTexture');
    const u_frameLocation = gl.getUniformLocation(shaderProgram, 'u_frameCount');

    // Pass the canvas resolution
    gl.uniform3f(u_resolutionLocation, canvas.width, canvas.height, 0.0);

    // Pass the current time
    gl.uniform1f(u_timeLocation, performance.now() / 1000);
    gl.uniform1f(u_frameLocation, frameCount);

    // Activate and bind the texture to texture unit 0
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the uniform to the texture unit index
    gl.uniform1i(u_textureLocation, 0);
    gl.uniform1i(u_noiseTextureLocation, 1);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(render);
}
