#version 300 es
precision mediump float;

// Este shader se encarga de computar para cada auto de una celda (pixel) si se puede 
// mover o no, eso depende de la direccion del auto, si en la celda siguiente hay o no lugar
// y si hay semaforo en rojo. 
// devuelve G info del auto, A = si lo puede mover , R = semaforo en rojo , B=huella co2


uniform sampler2D uSampler;	
uniform sampler2D uSamplerMap;	
uniform int screen_dx;
uniform int screen_dy;
uniform int step;
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

    int px = int(vTextureCoord.x*float(screen_dx));
    int py = int(vTextureCoord.y*float(screen_dy));
    int seed = tea16(py*screen_dx+px, step);
    
    // uSamplerMap representa el mapa pp dicho
    vec4 tx = texelFetch(uSamplerMap,ivec2(px,py),0);
    // en el canal R tenemos el dato de las conexiones, que indican hacia adonde se puede ir desde 
    // el punto en cuestion X, codificado en bits 
    // 0 1 2
    // 3 X 4
    // 5 6 7 
    int ruta_dir = int(tx.r*255.0+0.5);

    rta = texelFetch(uSampler,ivec2(px,py),0);

    if(tx.g>0.0)
    {
        // tx.g representa la densidad de trafico medida en el punto px,py
        // ese dato es real, entonces, con dicha probabilidad genero un viaje
        // o borro el que habia. 
        // Sea como sea luego de este punto la densidad de trafico tiene que ser la real
        float ka = 5.0;  // factor de densidad
        if(rnd(seed)<tx.g*ka)
        //if(rnd(seed)<0.1)
        {
            // se supone que no es un cruce
            int auto_dir;
            switch(ruta_dir)
            {
                case ARRIBA_DERECHA:
                case ARRIBA:
                    auto_dir = ARRIBA;
                    break;
                case ABAJO_IZQUIERDA:
                case ABAJO:
                    auto_dir = ABAJO;
                    break;
                case ARRIBA_IZQUIERDA:
                case IZQUIERDA:
                    auto_dir = IZQUIERDA;
                    break;
                default:
                    auto_dir = DERECHA;
                    break;
            }
            rta.g = float(auto_dir) / 255.0;
        }
        else
            rta.g = 0.0;
    }

    // determino si hay semaforo en rojo
    if(tx.b>0.0)
    {
        // hay semaforo
        bool arr = (ruta_dir&ARRIBA)!=0;
        bool aba = (ruta_dir&ABAJO)!=0;
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
    int g = int(rta.g*255.0+0.5);
    if(g==0)
        return;

    // determino todos los lugares donde hay ruta libre alrededor de donde estoy
    const int pot2[8] = int[](1,2,4,8,16,32,64,128);
    const ivec2 K[8] = ivec2[](
                ivec2(-1,1),ivec2(0,1),ivec2(1,1),
                ivec2(-1,0 ),            ivec2(1,0),
                ivec2(-1,-1),ivec2(0,-1),  ivec2(1,-1));

    bool ruta[8] , libre[8];
    for(int t = 0;t<8;++t)
    {
        ivec2 pos = ivec2(px,py) + K[t];
        ruta[t] = (ruta_dir & pot2[t])!=0;
        libre[t] =    texelFetch(uSampler,pos,0).g==0.0;
    }

    // 0 1 2
    // 3 X 4
    // 5 6 7
    // ruta[t] es true si hay carretera en t
    // libre[t] es true si esta libre (no hay otro auto en ese lugar)

    // De todos esos lugares, dependiendo de la direccion del auto, algunos tienen mas prioridad
    // que otros, y otros no se pueden acceder

    int p_ndx[32] = int[](
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

        if(rnd(seed)<0.1)
        {
            int aux = p_ndx[i*8];
            p_ndx[i*8] = p_ndx[i*8+1];
            p_ndx[i*8+1] = aux;
        }

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
