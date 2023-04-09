#version 300 es
precision mediump float;

// Este shader se encarga de hacer el movimiento pp dicho del auto
// para ello recorre el entorno de una celda y verifica si hay algun auto que se pueda mover 
// a la celda en cuestion. 

uniform sampler2D uSampler;	
uniform sampler2D uSamplerMap;	
uniform sampler2D uSampler2;	
in vec2 vTextureCoord;
layout(location = 0) out vec4 rta;
layout(location = 1) out vec4 rta2;

const int ARRIBA = 1;
const int ABAJO = 8;
const int IZQUIERDA = 4;
const int DERECHA = 2;

void main(void) {


    int px = int(vTextureCoord.x*512.0);
    int py = int(vTextureCoord.y*512.0);
    vec4 tx = texelFetch(uSamplerMap,ivec2(px,py),0);

    rta = texelFetch(uSampler,ivec2(px,py),0);
    rta2 = texelFetch(uSampler2,ivec2(px,py),0);


    if(tx.r==0.0)
    {
        // no hay ruta, no tiene lo que hacer
        return;
    }

    // verifico si tiene autos, si se mueven o no, los elimino de la celda
    int curr_auto = int(rta.g*255.0+0.5);

    if(curr_auto!=0)
    {
        bool flag_der = int(rta2.r*255.0+0.5)!=0;
        bool flag_izq = int(rta2.g*255.0+0.5)!=0;
        bool flag_arr = int(rta2.b*255.0+0.5)!=0;
        bool flag_aba = int(rta2.a*255.0+0.5)!=0;

        // la celda tiene uno o mas autos, si lo puedo mover, la celda queda vacia
        if(flag_arr)
        {
            rta.b+=1.0/255.0;
            curr_auto&=~ARRIBA;
        }
        else
            // si esta atascado en trafico, genero emision de co2
            rta.b+=10.0/255.0;

        if(flag_aba)
        {
            curr_auto&=~ABAJO;
            rta.b+=1.0/255.0;
        }
        else
            rta.b+=10.0/255.0;

        if(flag_der)
        {
            rta.b+=1.0/255.0;
            curr_auto&=~DERECHA;
        }
        else
            rta.b+=10.0/255.0;

        if(flag_izq)
        {
            rta.b+=1.0/255.0;
            curr_auto&=~IZQUIERDA;
        }
        else
            rta.b+=10.0/255.0;

    }

    // determino todos los lugares donde hay ruta libre alrededor de donde estoy
    const ivec2 K[8] = ivec2[](
                ivec2(-1,1),ivec2(0,1),ivec2(1,1),
                ivec2(-1,0 ),            ivec2(1,0),
                ivec2(-1,-1),ivec2(0,-1),  ivec2(1,-1));

    // 0 1 2
    // 3 X 4
    // 5 6 7

    
    vec4 tmpSampler[8];
    int index_value[32];
    for(int t = 0;t<8;++t)
    {
        ivec2 pos = ivec2(px,py) - K[t];
        tmpSampler[t] =  texelFetch(uSampler,pos,0);
        vec4 tx2 = texelFetch(uSampler2,pos,0);
        index_value[4*t+0] = int(tx2.r*255.0 + 0.5)-1;
        index_value[4*t+1] = int(tx2.g*255.0 + 0.5)-1;
        index_value[4*t+2] = int(tx2.b*255.0 + 0.5)-1;
        index_value[4*t+3] = int(tx2.a*255.0 + 0.5)-1;
    }

    const int p_ndx[20] = int[](
                        4,2,7,1,6,              // derecho
                        3,0,5,1,6,              // izquierdo
                        1,0,2,3,4,              // arriba
                        6,5,7,3,4               // abajo
                        );

    const int MASK_DIR[4] = int[](DERECHA,IZQUIERDA,ARRIBA,ABAJO);

    // ahora verifico si le ingresan autos
    {
        for(int i=0;i<4;++i)
        for(int j=0;j<5;++j)
        {
            int index = p_ndx[i*5+j];
            vec4 t = tmpSampler[index];
            int auto = int(t.g*255.0 + 0.5);
            int ndx = index_value[index*4+i];
            if((auto&MASK_DIR[i])!=0 && ndx==index)
                curr_auto |= MASK_DIR[i];
        }

    }
    rta.g = float(curr_auto) / 255.0;

    
}



/*
        // --------------------------------------------
        t = texelFetch(uSampler,ivec2(px+1,py),0);
        t2 = texelFetch(uSampler2,ivec2(px+1,py),0);
        auto = int(t.g*255.0 + 0.5);
        ndx = int(t2.g*255.0 + 0.5)-1;
        if((auto&IZQUIERDA)!=0 && ndx==3)
            curr_auto |= IZQUIERDA;


        t = texelFetch(uSampler,ivec2(px,py-1),0);
        t2 = texelFetch(uSampler2,ivec2(px,py-1),0);
        auto = int(t.g*255.0 + 0.5);
        ndx = int(t2.b*255.0 + 0.5)-1;
        if((auto&ARRIBA)!=0 && ndx==1)
            curr_auto |= ARRIBA;

        t = texelFetch(uSampler,ivec2(px,py+1),0);
        t2 = texelFetch(uSampler2,ivec2(px,py+1),0);
        auto = int(t.g*255.0 + 0.5);
        ndx = int(t2.a*255.0 + 0.5)-1;
        if((auto&ABAJO)!=0 && ndx==6)
            curr_auto |= ABAJO;
*/