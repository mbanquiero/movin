function initMap2()
{
    map_buffer = new Uint8Array(screen_dx*screen_dy*4);

    cant_semaforos = 0;         // ojo que cant_semaforos <= semaforos.lenght! 
    semaforos = [];

    let x0 = 10;
    let x1 = screen_dx-10;
    let y0 = 10;
    let y1 = screen_dy-10;
    
    // carretera horizontal
    for(let j=y0+50;j<y1-50;j+=10)
    {
        line(x0,j,x1,j,map_buffer);
        setGPixel(x0,j,map_buffer,TRAFICO_H);
    }
    
    // carreteras vertical
    for(let j=x0+50;j<x1-50;j+=10)
    {
        line(j,y0,j,y1,map_buffer);
        setGPixel(j,y0,map_buffer,TRAFICO_V);

        // semaforo del cruce 
        if(j%50==0)
        {
            for(let i=y0+100;i<y1;i+=50)
            {
                semaforos.push({n:cant_semaforos,x:j-3 , y:i});
                semaforos.push({n:cant_semaforos,x:j , y:i-3});
                ++cant_semaforos;
            }
        }
    }

	// establezo la configuracion de los semaforos
    setSemaforosConfig();

    map_texture = textureFromPixelArray(gl,map_buffer,screen_dx,screen_dy);
}

