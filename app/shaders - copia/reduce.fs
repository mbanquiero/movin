#version 300 es
precision mediump float;
uniform sampler2D uSampler;	
uniform int W;	
in vec2 vTextureCoord;
layout(location = 0) out vec4 FragColor;

int value(vec4 v)
{
    return int(v.r*255.0) + int(v.g*255.0)*256 + int(v.b*255.0)*256*256 ;
}

void main(void) {
    int px = 2*int(vTextureCoord.x*float(W));
    int py = 2*int(vTextureCoord.y*float(W));
    int c0 = value(texelFetch(uSampler,ivec2(px,py),0));
    int c1 = value(texelFetch(uSampler,ivec2(px+1,py),0));
    int c2 = value(texelFetch(uSampler,ivec2(px,py+1),0));
    int c3 = value(texelFetch(uSampler,ivec2(px+1,py+1),0));

    int tot = c0+c1+c2+c3;
    int b = tot/(256*256);
    int p = tot%(256*256);
    int g = p/256;
    int r = p%256;

    FragColor.r = float(r)/255.0;
    FragColor.g = float(g)/255.0;
    FragColor.b = float(b)/255.0;
    FragColor.a = 0.0;
}

