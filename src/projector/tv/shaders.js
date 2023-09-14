import vert from '../shaders/vert-shader.glsl';
import frag0 from '../shaders/frag-shader-0.glsl';
import frag1 from '../shaders/frag-shader-1.glsl';
import frag2 from '../shaders/frag-shader-2.glsl';
import frag3 from '../shaders/frag-shader-3.glsl';
import frag4 from '../shaders/frag-shader-4.glsl';
import frag5 from '../shaders/frag-shader-5.glsl';
import frag6 from '../shaders/frag-shader-6.glsl';

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

let shaderProgramIndex = 4;
const shaderPrograms = [];
const getShaderProgram = () => shaderPrograms[shaderProgramIndex].program;
const fragShaders = [
    frag0,
    frag1,
    frag2,
    frag3,
    frag4,
    frag5,
    frag6
];
const loadShaders = async (gl) => {
    //let shaderPrograms = [];
    console.log('Loading shaders...');
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vert);

    for (let fragShader of fragShaders) {
        const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragShader);
        const newProgram = createProgram(gl, vertexShader, fragmentShader);
        shaderPrograms.push({
            program: newProgram,
            presets: []
        });
    }

    gl.useProgram(getShaderProgram());
}

//shader filter settings: [horizontalFuzzStrength, blackWhite, verticalJerkStrength, static]
const switchShader = (gl, {horizontalTearStrength = -1, blackWhite = -1, verticalJerk = -1, chromaticAberration = -1}) => {
    if (horizontalTearStrength !== -1) {
        const u_horizontalTear = gl.getUniformLocation(getShaderProgram(), 'u_horizontalFuzzStr');
        gl.uniform1f(u_horizontalTear, horizontalTearStrength);
    }

    if (blackWhite !== -1) {
        const u_blackWhite = gl.getUniformLocation(getShaderProgram(), 'u_greyScaleOpt');
        gl.uniform1f(u_blackWhite, blackWhite);
    }

    if (verticalJerk !== -1) {
        const u_verticalJerk = gl.getUniformLocation(getShaderProgram(), 'u_vertMovementOpt');
        gl.uniform1f(u_verticalJerk, verticalJerk);
    }

    if (chromaticAberration !== -1) {
        const u_chromaticAberration = gl.getUniformLocation(getShaderProgram(), 'u_bottomStaticOpt');
        gl.uniform1f(u_chromaticAberration, chromaticAberration);
    }
}

export {loadShaders, switchShader, initVertexBuffer, getShaderProgram, shaderProgramIndex}