#version 300 es
precision mediump float;
uniform sampler2D uSampler;	
uniform sampler2D uSamplerMap;	
in vec2 vTextureCoord;
layout(location = 0) out vec4 FragColor;

void main(void) {
    int px = int(vTextureCoord.x*512.0);
    int py = int(vTextureCoord.y*512.0);
    vec3 tx = texelFetch(uSampler,ivec2(px,py),0).rgb;
    vec3 tx2 = texelFetch(uSamplerMap,ivec2(px,py),0).rgb;
    vec3 rgb = vec3(0.0);
	const int kernel_r = 6;
	const int kernel_size = 13;
	const float Kernel[kernel_size] = float[](0.002216,    0.008764,    0.026995,    0.064759,    0.120985,    0.176033,    0.199471,    0.176033,    0.120985,    0.064759,    0.026995,    0.008764,    0.002216);


    if(tx2.b>0.0)	// semaforo en rojo
        rgb = tx.r>0.0 ? vec3(1.0 , 0.0, 0.0) : vec3(0.0 , 1.0 , 0.0);
    else
    if(tx.g>0.0)	
        rgb = vec3(1.0 , 1.0, 0.0);			// auto
    else
    if(tx2.r>0.0)	
        rgb = vec3(0.3,0.3,0.3);		// carretera
	else
    {
        // co2 de los vecinos
        float co2 = 0.0;
        for (int i = 0; i < kernel_size; ++i)
        for (int j = 0; j < kernel_size; ++j)
            co2 += texelFetch(uSampler,ivec2(px+i- kernel_r,py+ j- kernel_r),0).b * Kernel[i] * Kernel[j];
        rgb = vec3(co2 , 0.0 , 0.0);
    }
    

    FragColor.rgb = rgb;

    //float co2 = tx.b;
    //FragColor.rgb = vec3(co2);

    FragColor.a = 1.0;
}

