//A simple frag shader that just outputs the pixel color of the texture
precision mediump float;

uniform vec3 u_resolution;
uniform sampler2D u_texture;

varying vec2 v_texCoord;

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec4 color = texture2D(u_texture, uv);
    gl_FragColor = color;
}