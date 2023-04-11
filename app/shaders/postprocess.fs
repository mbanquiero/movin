#version 300 es
precision mediump float;

// Este shader se encarga de computar para cada auto de una celda (pixel) si se puede 
// mover o no, eso depende de la direccion del auto, si en la celda siguiente hay o no lugar
// y si hay semaforo en rojo. 
// devuelve G info del auto, A = si lo puede mover , R = semaforo en rojo , B=huella co2


uniform sampler2D uSampler;	
uniform sampler2D uSamplerMap;	

uniform int step;
in vec2 vTextureCoord;
layout(location = 0) out vec4 rta;
layout(location = 1) out vec4 rta2;


const int ARRIBA = 1;
const int ABAJO = 8;
const int IZQUIERDA = 4;
const int DERECHA = 2;

int tea16( int val0, int val1)
{
    int v0 = val0;
    int v1 = val1;
    int s0 = 0;

    for( int n = 0; n < 16; n++ )
    {
    s0 += 0x9e3779b9;
    v0 += ((v1<<4)+0xa341316c)^(v1+s0)^((v1>>5)+0xc8013ea4);
    v1 += ((v0<<4)+0xad90777d)^(v0+s0)^((v0>>5)+0x7e95761e);
    }

    return v0;
}


int lcg(inout int prev)
{
    const int LCG_A = 1664525;
    const int LCG_C = 1013904223;
    prev = LCG_A * prev + LCG_C;
    return prev & 0x00FFFFFF;
}


float rnd(inout int prev)
{
    return (float(lcg(prev)) / float(0x01000000));
}



void main(void) {

    // devuelve:
    // rta.G info del auto, rta.R = semaforo en rojo , rta.BA=huella co2

    rta = vec4(0.0);
    rta2 = vec4(0.0);
    if(step==0)
        return;

    int px = int(vTextureCoord.x*512.0);
    int py = int(vTextureCoord.y*512.0);
    int seed = tea16(px*512+py, step);
    vec4 tx = texelFetch(uSamplerMap,ivec2(px,py),0);

    rta = texelFetch(uSampler,ivec2(px,py),0);

    if(tx.g>0.0)
    {
        // tx.g representa la densidad de trafico medida en el punto px,py
        // ese dato es real, entonces, con dicha probabilidad genero un viaje
        // o borro el que habia. 
        // Sea como sea luego de este punto la densidad de trafico tiene que ser la real
        if(rnd(seed)<tx.g)
            rta.g = tx.r;
        else
            rta.g = 0.0;
    }

    // determino si hay semaforo en rojo
    if(tx.b>0.0)
    {
        // hay semaforo
        int r = int(tx.r*255.0+0.5);
        bool arr = (r&ARRIBA)!=0;
        bool aba = (r&ABAJO)!=0;

        int tr = int(tx.b*255.0+0.5)-1;
        int t0 = int(tx.a*255.0+0.5);
        bool semaforo_rojo = (step*1+t0)%256<tr;
        if((arr || aba))
            semaforo_rojo = !semaforo_rojo;
        
        rta.r = semaforo_rojo ? 1.0 : 0.0;
        if(semaforo_rojo)
            return;
    }


    // simulo el mov. de los autos
    // lugar a donde me quiero mover
    int g = int(rta.g*255.0+0.5);
    if(g==0)
        return;

    // determino todos los lugares donde hay ruta libre alrededor de donde estoy
    const ivec2 K[8] = ivec2[](
                ivec2(-1,1),ivec2(0,1),ivec2(1,1),
                ivec2(-1,0 ),            ivec2(1,0),
                ivec2(-1,-1),ivec2(0,-1),  ivec2(1,-1));
    
    bool ruta[8] , libre[8];
    for(int t = 0;t<8;++t)
    {
        ivec2 pos = ivec2(px,py) + K[t];
        ruta[t] =       texelFetch(uSamplerMap,pos,0).r>0.0;
        libre[t] =    texelFetch(uSampler,pos,0).g==0.0;
    }

    // 0 1 2
    // 3 X 4
    // 5 6 7

    // de todos esos lugares, dependiendo de la direccion del auto, algunos tienen mas prioridad
    // que otros, y otros no se pueden acceder

    const int p_ndx[32] = int[](
                        4,2,7,1,6,0,5,3,              // derecho
                        3,0,5,1,6,2,7,4,              // izquierdo
                        1,0,2,3,4,5,7,6,              // arriba
                        6,5,7,3,4,0,2,1              // abajo
                        );

    const int MASK_DIR[4] = int[](DERECHA,IZQUIERDA,ARRIBA,ABAJO);

    int mov[4] = int[](0,0,0,0);
    for(int i=0;i<4;++i)
    if((g&MASK_DIR[i])!=0)
    {
        bool fl = false;
        bool hay_ruta = false;
        for(int t = 0;t<8  && !fl;++t)
        {
            int index = p_ndx[i*8+t];
            if(ruta[index])
            {
                hay_ruta = true;
                if(libre[index])
                    mov[i] =index+1;          // devuelve el indice donde se puede mover (mas uno)
                fl = true;
            }
        }

        if(!hay_ruta)
        {
            // si no puede seguir avanzando en ninguna parte elimino el auto
            g &= ~MASK_DIR[i];
        }
    }

    rta.g = float(g) / 255.0;

    // rta2.R => mov auto que iba a la derecha
    rta2.r = float(mov[0]) / 255.0;
    rta2.g = float(mov[1]) / 255.0;
    rta2.b = float(mov[2]) / 255.0;
    rta2.a = float(mov[3]) / 255.0;
    
}
