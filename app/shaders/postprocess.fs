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
layout(location = 0) out vec4 FragColor;

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

    int px = int(vTextureCoord.x*512.0);
    int py = int(vTextureCoord.y*512.0);
    int seed = tea16(px*512+py, step);
    vec4 tx = texelFetch(uSamplerMap,ivec2(px,py),0);
    vec4 rta = texelFetch(uSampler,ivec2(px,py),0);
    
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

    // lugares a donde me puedo mover
    int r = int(tx.r*255.0+0.5);
    bool der = (r&DERECHA)!=0;
    bool izq = (r&IZQUIERDA)!=0;
    bool arr = (r&ARRIBA)!=0;
    bool aba = (r&ABAJO)!=0;

    int flag = 0;           // flag de movimiento

    bool semaforo_rojo = false;
    if(tx.b>0.0)
    {
        // hay semaforo
        int tr = int(tx.b*255.0+0.5)-1;
        int t0 = int(tx.a*255.0+0.5);
        semaforo_rojo = (step*4+t0)%256<tr;
        if((arr || aba))
            semaforo_rojo = !semaforo_rojo;
    }

    rta.r = semaforo_rojo ? 1.0 : 0.0;

    // simulo el mov. de los autos
    // lugar a donde me quiero mover
    int g = int(rta.g*255.0+0.5);
    if(g!=0)
    {
        int flag = 0;       // flag de movimiento
        // tengo un auto, verifico si puede salir?
        if(!semaforo_rojo)
        {
            bool auto_der = (g&DERECHA)!=0;
            bool auto_izq = (g&IZQUIERDA)!=0;
            bool auto_arr = (g&ARRIBA)!=0;
            bool auto_aba = (g&ABAJO)!=0;


            if(auto_der)
            {
                // la celda solo almacena un auto que se mueve hacia derecha
                // si en la celda a la que me quiero mover ya hay otro auto no lo dejo mover

                // verifico si hay ruta a la derecha
                if(texelFetch(uSamplerMap,ivec2(px+1,py),0).r!=0.0)
                {
                    // si hay ruta, y si no esta ocupada con otro auto que se mueve 
                    // a derecha = > me muevo, si no espero
                    if(texelFetch(uSampler,ivec2(px+1,py),0).g==0.0)
                        flag |= DERECHA;        // El auto que va hacia la derecha se puede mover
                }
                else
                {
                    // si no tiene mas ruta a la derecha, elimino el auto que va a la derecha
                    g &= ~DERECHA;
                }
            }

            if(auto_izq)
            {            
                if(texelFetch(uSamplerMap,ivec2(px-1,py),0).r!=0.0)
                {
                    if(texelFetch(uSampler,ivec2(px-1,py),0).g==0.0)
                        flag |= IZQUIERDA;
                }
                else
                    g &= ~IZQUIERDA;

            }

            if(auto_arr)
            {
                // arriba
                if(texelFetch(uSamplerMap,ivec2(px,py+1),0).r!=0.0)
                {
                    if(texelFetch(uSampler,ivec2(px,py+1),0).g==0.0)
                        flag |= ARRIBA;
                }
                else
                    g &= ~ARRIBA;
            }

            if(auto_aba)
            {
                // abajo
                if(texelFetch(uSamplerMap,ivec2(px,py-1),0).r!=0.0)
                {
                    if(texelFetch(uSampler,ivec2(px,py-1),0).g==0.0)
                        flag |= ABAJO;
                }
                else
                    g &= ~ABAJO;
            }
        }
        rta.a = float(flag) / 255.0;
        rta.g = float(g) / 255.0;

    }


    if(step==0)
        rta = vec4(0.0, 0.0, 0.0 , 1.0);


    // devuelve G info del auto, A = si lo puede mover , R = semaforo en rojo , B=huella co2
    FragColor = rta;		
}
