#version 300 es
precision mediump float;

// Este shader se encarga de hacer el movimiento pp dicho del auto
// para ello recorre el entorno de una celda y verifica si hay algun auto que se pueda mover 
// a la celda en cuestion. 

uniform sampler2D uSampler;	
uniform sampler2D uSamplerMap;	
in vec2 vTextureCoord;
layout(location = 0) out vec4 FragColor;

const int ARRIBA = 1;
const int ABAJO = 8;
const int IZQUIERDA = 4;
const int DERECHA = 2;

void main(void) {

    int px = int(vTextureCoord.x*512.0);
    int py = int(vTextureCoord.y*512.0);
    vec4 tx = texelFetch(uSamplerMap,ivec2(px,py),0);
    vec4 rta = texelFetch(uSampler,ivec2(px,py),0);

    // primero verifico si tiene autos, si se mueven o no, los elimino de la celda
    int curr_auto = int(rta.g*255.0+0.5);
    if(curr_auto!=0)
    {
        // la celda tiene uno o mas autos, si lo puedo mover, la celda queda vacia
        int flag = int(rta.a*255.0+0.5);

        if((flag&ARRIBA)!=0)
            curr_auto&=~ARRIBA;
        else
            // si esta atascado en trafico, genero emision de co2
            rta.b+=10.0/255.0;

        if((flag&ABAJO)!=0)
            curr_auto&=~ABAJO;
        else
            rta.b+=10.0/255.0;

        if((flag&DERECHA)!=0)
            curr_auto&=~DERECHA;
        else
            rta.b+=10.0/255.0;

        if((flag&IZQUIERDA)!=0)
            curr_auto&=~IZQUIERDA;
        else
            rta.b+=10.0/255.0;

    }
     
     // ahora verifico si le ingresan autos
    vec4 t = texelFetch(uSampler,ivec2(px-1,py),0);
    int auto = int(t.g*255.0 + 0.5);
    int flag = int(t.a*255.0 + 0.5);
    if((auto&DERECHA)!=0 && (flag&DERECHA)!=0)
        curr_auto |= DERECHA;
        
    t = texelFetch(uSampler,ivec2(px+1,py),0);
    auto = int(t.g*255.0 + 0.5);
    flag = int(t.a*255.0 + 0.5);
    if((auto&IZQUIERDA)!=0 && (flag&IZQUIERDA)!=0)
        curr_auto |= IZQUIERDA;

    t = texelFetch(uSampler,ivec2(px,py+1),0);
    auto = int(t.g*255.0 + 0.5);
    flag = int(t.a*255.0 + 0.5);
    if((auto&ABAJO)!=0 && (flag&ABAJO)!=0)
        curr_auto |= ABAJO;

    t = texelFetch(uSampler,ivec2(px,py-1),0);
    auto = int(t.g*255.0 + 0.5);
    flag = int(t.a*255.0 + 0.5);
    if((auto&ARRIBA)!=0 && (flag&ARRIBA)!=0)
        curr_auto |= ARRIBA;

    rta.g = float(curr_auto) / 255.0;
    FragColor = rta;
}

