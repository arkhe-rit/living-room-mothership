precision highp float;

uniform sampler2D u_texture;
uniform vec3 u_resolution;

const int u_pixelSize = 12; // Set the desired pixelation size here

//pixelation effect
void main()
{
    // Calculate the texture size based on the resolution
    vec2 texSize = u_resolution.xy;
    
    // Calculate the pixelation size based on the texture size
    ivec2 pixelCoord = ivec2(gl_FragCoord.xy);
    ivec2 pixelatedCoord = ivec2(pixelCoord.x / u_pixelSize * u_pixelSize,
                                 pixelCoord.y / u_pixelSize * u_pixelSize);
    
    // Calculate the normalized texture coordinates
    vec2 uv = vec2(pixelatedCoord) / texSize;
    
    // Sample the texture color at the pixelated coordinates
    vec4 pixelColor = texture2D(u_texture, uv);
    
    gl_FragColor = pixelColor;
}
