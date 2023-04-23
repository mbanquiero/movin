function initMap5()
{
    map_buffer = new Uint8Array(screen_dx*screen_dy*4);

    cant_semaforos = 0;         // ojo que cant_semaforos <= semaforos.lenght! 
    semaforos = [];


    let x0 = 5;
    let y0 = screen_dy/2;
    for(let i=0;i<16;i+=2)
    {
        let inv = i<8;
        line(x0,y0+i,x0+screen_dx-5,y0+i,map_buffer,inv);
        if(inv)
        {
            setGPixel(screen_dx/2+100,y0+i,map_buffer,30);
            semaforos.push({n:cant_semaforos,x:screen_dx/2+12, y:y0+i});
        }            
        else
        {
            setGPixel(screen_dx/2-100,y0+i,map_buffer,10);
            semaforos.push({n:cant_semaforos,x:screen_dx/2-5 , y:y0+i});
        }
                 
    }

    x0 = screen_dx/2;
    y0 = 5;
    for(let i=0;i<8;i+=2)
    {
        let inv = i<4;
        line(x0+i,y0,x0+i,y0+screen_dy-10,map_buffer,inv);

        if(inv)
        {
            setGPixel(x0+i,screen_dy/2+100,map_buffer,30);
            semaforos.push({n:cant_semaforos,x:x0+i , y:screen_dy/2+20});
        }            
        else
        {
            setGPixel(x0+i,screen_dx/2-100,map_buffer,10);
            semaforos.push({n:cant_semaforos,x:x0+i , y:screen_dy/2-5});
        }
    }

    ++cant_semaforos;
	// establezo la configuracion de los semaforos
    setSemaforosConfig();

    map_texture = textureFromPixelArray(gl,map_buffer,screen_dx,screen_dy);
}

