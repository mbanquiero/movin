#version 300 es
precision mediump float;

// Este shader se encarga de hacer el movimiento pp dicho del auto
// para ello recorre el entorno de una celda y verifica si hay algun auto que se pueda mover 
// a la celda en cuestion. 

uniform sampler2D uSampler;	
uniform sampler2D uSamplerMap;	
uniform sampler2D uSampler2;	

uniform int screen_dx;
uniform int screen_dy;

in vec2 vTextureCoord;
layout(location = 0) out vec4 rta;
layout(location = 1) out vec4 rta2;

// bits direcciones
// 0 1 2         1  2  4
// 3 X 4         8  X  16
// 5 6 7         32 64 128

const int ARRIBA            = 2;
const int ABAJO             = 64;
const int IZQUIERDA         = 8;
const int DERECHA           = 16;
const int ARRIBA_DERECHA    = 4;
const int ARRIBA_IZQUIERDA  = 1;
const int ABAJO_DERECHA     = 128;
const int ABAJO_IZQUIERDA   = 32;

void main(void) {


    int px = int(vTextureCoord.x*float(screen_dx));
    int py = int(vTextureCoord.y*float(screen_dy));
    vec4 tx = texelFetch(uSamplerMap,ivec2(px,py),0);
    vec4 tx2 = texelFetch(uSampler2,ivec2(px,py),0);

    rta = texelFetch(uSampler,ivec2(px,py),0);
    rta2 = vec4(0);             // no usado


    if(tx.r==0.0)
    {
        // no hay ruta, no tiene lo que hacer
        return;
    }

    // verifico si tiene autos, si se mueven o no, los elimino de la celda
    int curr_auto = int(rta.g*255.0+0.5);
    const int MASK_DIR[4] = int[](DERECHA,IZQUIERDA,ARRIBA,ABAJO);

    if(curr_auto!=0)
    {
        bool flags[4] = bool[] (
                                    int(tx2.r*255.0+0.5)!=0,
                                    int(tx2.g*255.0+0.5)!=0,
                                    int(tx2.b*255.0+0.5)!=0,
                                    int(tx2.a*255.0+0.5)!=0
                                );

        const int co2_x_step = 10;
        int co2 = int(rta.a*255.0+0.5) * 256 + int(rta.b*255.0+0.5);

        for(int i=0;i<4;++i)
        if((curr_auto&MASK_DIR[i])!=0)
        {
            co2++;          // emision por co2
            if(flags[i])
                // la celda tiene uno o mas autos, si lo puedo mover, la celda queda vacia
                curr_auto&=~MASK_DIR[i];
            else
                // si esta atascado en trafico, genero emision de co2
                co2+=co2_x_step;
        }
        rta.a = float(co2/256)/255.0;
        rta.b = float(co2%256)/255.0;

    }

    // determino todos los lugares donde hay ruta libre alrededor de donde estoy
    const ivec2 K[8] = ivec2[](
                ivec2(-1,0),ivec2(1,0),        // izquierda,derecha
                ivec2(0,-1),ivec2(0,1),         // abajo, arriba
                ivec2(-1,-1),ivec2(1,-1),      // abajo izquierda,abajo derecha
                ivec2(-1,1),ivec2(1,1)         // arriba izquierda,arriba derecha
                );
    const int index[8] = int[](
                4,3,
                1,6,
                2,0,
                7,5
                );
    
    int index_value[32];
    for(int t = 0;t<8;++t)
    {
        ivec2 pos = ivec2(px,py) + K[t];
        vec4 tx2 = texelFetch(uSampler2,pos,0);
        index_value[4*t+0] = int(tx2.r*255.0 + 0.5)-1;
        index_value[4*t+1] = int(tx2.g*255.0 + 0.5)-1;
        index_value[4*t+2] = int(tx2.b*255.0 + 0.5)-1;
        index_value[4*t+3] = int(tx2.a*255.0 + 0.5)-1;
    }

    // ahora verifico si le ingresan autos
    for(int j=0;j<8;++j)
    for(int i=0;i<4;++i)
    {
        int ndx = index_value[j*4+i];
        if(ndx==index[j])
            curr_auto |= MASK_DIR[i];
    }
    rta.g = float(curr_auto) / 255.0;
}

