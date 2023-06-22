precision mediump float;

uniform vec3 u_resolution;

uniform sampler2D u_texture;

void main() {
	vec2 uv = gl_FragCoord.xy/u_resolution.xy;
	vec4 color = texture2D(u_texture, uv);
	vec3 greytScale = vec3(0.5, 0.5, 0.5);
	gl_FragColor = vec4(vec3(dot(color.rgb, greytScale)), color.a);
}