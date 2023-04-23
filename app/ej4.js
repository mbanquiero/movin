function initMap4()
{
    map_buffer = new Uint8Array(screen_dx*screen_dy*4);

    cant_semaforos = 0;         // ojo que cant_semaforos <= semaforos.lenght! 
    semaforos = [];

    let p = false;

    var x0 = 100;
    var x1 = screen_dx - 100;
    var y0 = 100;
    var y1 = screen_dy - 100;

    // carretera horizontal
    for(let j=y0;j<y1;j+=10)
    {
        line(x0,j , x1 , j , map_buffer , p);
        setGPixel((x0+x1)/2+(p?1:-1),j,map_buffer,TRAFICO_H);
        p = !p;
    }
    
    // carreteras vertical
    for(let j=x0;j<x1;j+=10)
    {
        line(j , y0,  j , y1 , map_buffer , p);
        setGPixel(j,(y0+y1)/2,map_buffer,TRAFICO_V);
        p = !p;

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

