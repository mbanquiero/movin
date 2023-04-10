#version 300 es
precision mediump float;
uniform sampler2D uSampler;	
uniform int W;	
in vec2 vTextureCoord;
layout(location = 0) out vec4 FragColor;
void main(void) {
    int px = int(vTextureCoord.x*float(W));
    int py = int(vTextureCoord.y*float(W));
    vec2 co2 = texelFetch(uSampler,ivec2(px,py),0).ba;
    FragColor = vec4(co2, 0.0, 1.0);
}

