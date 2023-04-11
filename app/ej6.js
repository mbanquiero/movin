function initMap6()
{
    map_buffer = new Uint8Array(screen_dx*screen_dy*4);

    cant_semaforos = 0;         // ojo que cant_semaforos <= semaforos.lenght! 
    semaforos = [];

    let ds = 250;
    let x0 = 5;
    for(let y0 = 100;y0<450;y0+=ds)
    {
        for(let i=0;i<4;i+=2)
        {
            let inv = i<2;
            line(x0,y0+i,x0+500,y0+i,map_buffer,inv);
            if(inv)
                setGPixel(x0+500,y0+i,map_buffer,30);
            else
                setGPixel(x0,y0+i,map_buffer,10);

            
        }


        for(let x=100;x<450;x+=ds)
        {
            // los 4 semaforos de esta interseccion comparten el mismo nro de semaforo
            // porque estan sincronizados

            for(let i=0;i<4;i+=2)
            if(i<2)
            {
                semaforos.push({n:cant_semaforos , x:x+8 , y:y0+i});
                semaforos.push({n:cant_semaforos , x:x , y:y0+i+8});
            }
            else
            {
                semaforos.push({n:cant_semaforos , x:x-6 , y:y0+i});
                semaforos.push({n:cant_semaforos , x:x+2 , y:y0+i-6});
            }
            ++cant_semaforos;
        }

    }
    
    y0 = 5;
    for(let x0 = 100;x0<450;x0+=ds)
    for(let i=0;i<4;i+=2)
    {
        let inv = i<2;
        line(x0+i,y0,x0+i,y0+500,map_buffer,inv);

        if(inv)
            setGPixel(x0+i,y0+500,map_buffer,30);
        else
            setGPixel(x0+i,y0,map_buffer,10);

    }
    // establezo la configuracion de los semaforos
    setSemaforosConfig();
    
    map_texture = textureFromPixelArray(gl,map_buffer,screen_dx,screen_dy);
}

