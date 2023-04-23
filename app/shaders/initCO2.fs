#version 300 es
precision mediump float;
uniform sampler2D uSampler;	
uniform int W;	
in vec2 vTextureCoord;
layout(location = 0) out vec4 co2;
layout(location = 1) out vec4 cant_autos;
void main(void) {
    int px = int(vTextureCoord.x*float(W));
    int py = int(vTextureCoord.y*float(W));
    vec4 tx = texelFetch(uSampler,ivec2(px,py),0);
    co2 = vec4(tx.ba, 0.0, 1.0);
    cant_autos = vec4(tx.g>0.0? 1.0/255.0 : 0.0,0.0, 0.0, 1.0);
}

