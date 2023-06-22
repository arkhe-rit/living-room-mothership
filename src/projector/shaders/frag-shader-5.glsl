precision mediump float;

uniform vec3 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

void main() {
    // Calculate the normalized coordinates of the fragment
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;

    // Calculate the distance between the fragment and the mouse position
    float distance = length(uv - u_mouse);

    // Define the radius and thickness of the circle
    float radius = 0.1;
    float thickness = 0.01;

    // Set the color inside and outside the circle
    vec3 insideColor = vec3(1.0, 0.0, 0.0);   // Red
    vec3 outsideColor = vec3(0.0, 0.0, 0.0);  // Black

    // Check if the fragment is within the circle's boundaries
    float circle = smoothstep(radius, radius + thickness, distance);

    // Blend the colors based on whether the fragment is inside or outside the circle
    vec3 color = mix(outsideColor, insideColor, circle);

    // Output the final color
    gl_FragColor = vec4(color, 1.0);
}
