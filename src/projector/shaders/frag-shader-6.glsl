precision highp float;

uniform sampler2D u_texture;
uniform vec3 u_resolution;

const float PI = 3.14159256;

void main() {    
    float d = dot(gl_FragCoord.xyz, gl_FragCoord.xyz);
    vec2 s = gl_FragCoord.xy * d;
    vec2 tc = s.xy * 0.5 + 0.5;
    vec4 distorted = texture2D(u_texture, tc);
    gl_FragColor = distorted;
}
