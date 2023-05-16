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


// version zoom
void main(void) 
{
    int fx = int(vTextureCoord.x*150.0);
    int fy = int(vTextureCoord.y*75.0);
    int px = fx + screen_dx/2 - 75 + offset_x;
    int py = fy + screen_dy/2 - 37 + offset_y;

    int qx = int(vTextureCoord.x*1200.0);
    int qy = int(vTextureCoord.y*600.0);
    int rx = qx%8;
    int ry = qy%8;

    vec3 tx = texelFetch(uSampler,ivec2(px,py),0).rgb;
    vec3 tx2 = texelFetch(uSamplerMap,ivec2(px,py),0).rgb;
    int ruta_dir = int(tx2.r*255.0+0.5);
	const int kernel_r = 6;
	const int kernel_size = 13;
	const float Kernel[kernel_size] = float[](0.002216,    0.008764,    0.026995,    0.064759,    0.120985,    0.176033,    0.199471,    0.176033,    0.120985,    0.064759,    0.026995,    0.008764,    0.002216);

    vec3 S[64];

    // co2 de los vecinos
    float co2 = 0.0;
    for (int i = 0; i < kernel_size; ++i)
    for (int j = 0; j < kernel_size; ++j)
    {
        vec4 c = texelFetch(uSampler,ivec2(px+i- kernel_r,py+ j- kernel_r),0);
        int x = int(c.a*255.0+0.5) * 256 + int(c.b*255.0+0.5);
        co2 += float(x)/255.0* Kernel[i] * Kernel[j];
    }
    for(int i=0;i<64;++i)
        S[i] = ruta_dir>0 ? vec3( 0.5) : vec3(co2,0.0,0.0);

    // carretera
    /*switch(ruta_dir)
    {
        case DERECHA:
        case IZQUIERDA:
            for(int i=0;i<8;++i)
                S[0*8 + i] = S[7*8 + i] = vec3(0.3);
            break;
        case ARRIBA:
        case ABAJO:
            for(int i=0;i<8;++i)
                S[i*8 + 0] = S[i*8 + 7] = vec3(0.3);
            break;
    }*/

    if(tx2.b>0.0)	// semaforo 
    {
        vec3 clr = tx.r>0.0 ? vec3(1.0 , 0.0, 0.0) : vec3(0.0 , 1.0 , 0.0);
        for(int i=1;i<7;++i)
        for(int j=1;j<7;++j)
            S[i*8 + j] = clr;
    }
    else
    if(tx.g>0.0)
    {
        // auto
        int auto_dir = int(tx.g*255.0+0.5);
        vec3 clr = vec3(0.5 , 1.0, 1.0);	
        switch(auto_dir)
        {
            case DERECHA:
            case IZQUIERDA:
                for(int i=2;i<6;++i)
                for(int j=1;j<7;++j)
                    S[i*8 + j] = clr;
                //S[3*8 + 5] = S[3*8 + 2] = vec3(0.0);
                //S[5*8 + 5] = S[5*8 + 2] = vec3(0.0);

                break;
            case ARRIBA:
            case ABAJO:
                for(int i=1;i<7;++i)
                for(int j=2;j<6;++j)
                    S[i*8 + j] = clr;
                //S[5*8 + 3] = S[2*8 + 3] = vec3(0.0);
                //S[5*8 + 5] = S[2*8 + 5] = vec3(0.0);

                break;
        }
    }

	

    FragColor.rgb = S[ry*8+rx];
    FragColor.a = 1.0;
    /*FragColor.r = rx==0 ? 1.0 : 0.0;
    FragColor.g = ry==0 ? 1.0 : 0.0;
    FragColor.b = 0.0;
    */

}

