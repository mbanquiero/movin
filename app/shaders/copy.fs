#version 300 es
precision mediump float;
uniform sampler2D uSampler;	
uniform sampler2D uSamplerMap;	
uniform int screen_dx;
uniform int screen_dy;
uniform int offset_x;
uniform int offset_y;

// este shader se encarga de dibujar 

in vec2 vTextureCoord;

layout(location = 0) out vec4 FragColor;


const int ARRIBA            = 2;
const int ABAJO             = 64;
const int IZQUIERDA         = 8;
const int DERECHA           = 16;
const int ARRIBA_DERECHA    = 4;
const int ARRIBA_IZQUIERDA  = 1;
const int ABAJO_DERECHA     = 128;
const int ABAJO_IZQUIERDA   = 32;


void main(void) {
    
    int fx = int(vTextureCoord.x*1200.0);
    int fy = int(vTextureCoord.y*600.0);
    int px = fx + screen_dx/2 - 600 + offset_x;
    int py = fy + screen_dy/2 - 300 + offset_y;
    vec3 tx = texelFetch(uSampler,ivec2(px,py),0).rgb;
    vec3 tx2 = texelFetch(uSamplerMap,ivec2(px,py),0).rgb;
    vec3 rgb = vec3(0.0);

    /*
    if(tx2.b>0.0)	// semaforo en rojo
        rgb = tx.r>0.0 ? vec3(1.0 , 0.0, 0.0) : vec3(0.0 , 1.0 , 0.0);
    else
    if(tx.g>0.0)	
        rgb = vec3(1.0 , 1.0, 0.0);			// auto
    else
    if(tx2.r>0.0)
        // carretera
        rgb = vec3(0.3);		
	else
    {
        const int kernel_r = 6;
        const int kernel_size = 13;
        const float Kernel[kernel_size] = float[](0.002216,    0.008764,    0.026995,    0.064759,    0.120985,    0.176033,    0.199471,    0.176033,    0.120985,    0.064759,    0.026995,    0.008764,    0.002216);

        // co2 de los vecinos
        float co2 = 0.0;
        for (int i = 0; i < kernel_size; ++i)
        for (int j = 0; j < kernel_size; ++j)
        {
            vec4 c = texelFetch(uSampler,ivec2(px+i- kernel_r,py+ j- kernel_r),0);
            int x = int(c.a*255.0+0.5) * 256 + int(c.b*255.0+0.5);
            co2 += float(x)/255.0* Kernel[i] * Kernel[j];
        }
        rgb = vec3(co2,0.0 , 0.0);
    }

    */

    // ---------------------------
    //  heat map

    if(tx2.r>0.0)
        // carretera
        rgb = vec3(0.0);		
	else
    {
        const int kernel_r = 16;
        const int kernel_size = 33;

        float co2 = 0.0;
        for (int i = 0; i < kernel_size; ++i)
        for (int j = 0; j < kernel_size; ++j)
        {
            vec4 c = texelFetch(uSampler,ivec2(px+i- kernel_r,py+ j- kernel_r),0);
            int x = int(c.a*255.0+0.5) * 256 + int(c.b*255.0+0.5);
            co2 += float(x)/255.0;
        }
        co2 /= float(kernel_size*kernel_size);
        co2 = co2 / (1.0+co2);


        float level = co2*3.14159265/2.;
        rgb.r = sin(level);
        rgb.g = sin(level*2.);
        rgb.b = cos(level);
    }

    FragColor.rgb = rgb;
    FragColor.a = 1.0;

}

