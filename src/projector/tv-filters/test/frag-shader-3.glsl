precision mediump float;

uniform vec3 u_resolution;        // viewport resolution (in pixels)
uniform float u_time;             // shader playback time (in seconds)
uniform sampler2D u_texture;      // input texture

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec4 tex = texture2D(u_texture, uv);

    float val = 0.1 - mod(u_time / 10.0, 0.2);

    vec4 rTex = texture2D(u_texture, uv - vec2(val));
    float red = rTex.r;

    vec4 gTex = texture2D(u_texture, uv + vec2(val));
    float green = gTex.g;

    vec4 bTex = texture2D(u_texture, uv - vec2(0.2));
    float blue = bTex.b;

    vec2 uv2 = vec2(uv.x, mod(u_time, 1.175));
    vec4 tex2 = texture2D(u_texture, uv2);

    float grey = dot(vec3(red, green, blue), vec3(0.3, 0.59, 0.11));

    vec4 tex3 = mix(tex, tex2, 0.1);

    vec4 fragColor = mix(tex3, vec4(grey, grey, grey, 1.0), 0.2);
    vec2 posMod = mod(gl_FragCoord.xy, vec2(4.0));
    if (posMod.y < 2.0) {
        fragColor.rgb -= 0.5;
    }

    gl_FragColor = fragColor;
}
