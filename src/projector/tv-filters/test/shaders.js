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

const initVertexBuffer = (gl) => {
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
}

let shaderProgramIndex = 1;
const shaderPrograms = [];
const getShaderProgram = () => shaderPrograms[shaderProgramIndex].program;
const fragShaders = [
    'frag-shader-0.glsl',
    'frag-shader-1.glsl',
    'frag-shader-2.glsl',
    'frag-shader-3.glsl',
    'frag-shader-4.glsl'
];
const loadShaders = async (gl) => {
    //let shaderPrograms = [];
    console.log('Loading shaders...');
    const vertexShaderSource = await fetchShaderSource('../../vert-shader.glsl');
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);

    for (let fragShader of fragShaders) {
        const fragmentShaderSource = await fetchShaderSource("../../shaders/" + fragShader);
        const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
        const newProgram = createProgram(gl, vertexShader, fragmentShader);
        shaderPrograms.push({
            program: newProgram,
            presets: []
        });
        console.log(`Loaded shader program ${fragShader}`);
    }

    gl.useProgram(getShaderProgram());
}

const switchShader = (index, gl) => {
    shaderProgramIndex = index;
    gl.useProgram(getShaderProgram());
    initVertexBuffer(gl);
    console.log(`Switched to shader program ${shaderProgramIndex}`);
}

const incrementShader = () => {
    switchShader((shaderProgramIndex + 1) % shaderPrograms.length);
}

export {loadShaders, switchShader, initVertexBuffer, getShaderProgram, incrementShader, shaderProgramIndex}