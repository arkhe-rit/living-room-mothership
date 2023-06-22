precision mediump float;

uniform vec3 u_resolution;   // viewport resolution (in pixels)
uniform float u_time;        // shader playback time (in seconds)
uniform sampler2D u_texture;
uniform sampler2D u_noise_texture;

void main() {
    float dispersion = 0.01;
    float distortion = 0.04;
    float noisestrength = 0.2;
    float bendscale = 1.5;

    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 disp = uv - vec2(0.5, 0.5);
    disp *= sqrt(length(disp));
    uv += disp * bendscale;
    uv = (uv + vec2(0.5)) / 2.0;
    vec2 uvr = uv * (1.0 - dispersion) + vec2(dispersion) / 2.0;
    vec2 uvg = uv * 1.0;
    vec2 uvb = uv * (1.0 + dispersion) - vec2(dispersion) / 2.0;

    vec3 offset = texture2D(u_noise_texture, vec2(0.0, uv.y + u_time * 255.0)).xyz;

    float r = mix(texture2D(u_texture, vec2(1.0 - uvr.x, uvr.y) + offset.x * distortion).xyz,
                   offset, noisestrength).x;
    float g = mix(texture2D(u_texture, vec2(1.0 - uvg.x, uvg.y) + offset.x * distortion).xyz,
                   offset, noisestrength).y;
    float b = mix(texture2D(u_texture, vec2(1.0 - uvb.x, uvb.y) + offset.x * distortion).xyz,
                   offset, noisestrength).z;

    if (uv.x > 0.0 && uv.x < 1.0 && uv.y > 0.0 && uv.y < 1.0) {
        float stripes = sin(uv.y * 300.0 + u_time * 10.0);
        vec3 col = vec3(r, g, b);
        col = mix(col, vec3(0.8), stripes / 20.0);
        gl_FragColor = vec4(col, 1.0);
    } else {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
}
