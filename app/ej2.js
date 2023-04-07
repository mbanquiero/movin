function initMap2()
{
    map_buffer = new Uint8Array(screen_dx*screen_dy*4);

    // carretera horizontal
    for(let j=100;j<500;j+=10)
    {
        for(let i=x0;i<x1;++i)
            setRPixel(i,j,map_buffer,2);
        
        setGPixel(x0,j,map_buffer,TRAFICO_H);
    }
    
    // carreteras vertical
    for(let j=100;j<500;j+=10)
    {
        for(let i=y0;i<y1;++i)
            setRPixel(j,i,map_buffer,1);
        setGPixel(j,y0,map_buffer,TRAFICO_V);

        // semaforo del cruce 
        if(j%50==0)
        {
            for(let i=y0+100;i<y1;i+=50)
            {
                semaforos.push({x:j-3 , y:i});
                semaforos.push({x:j , y:i-3});
            }
        }

    }
    semaforos.forEach(s => 	{
        setSemaforo(s.x,s.y,map_buffer,RED_TIME,0);});

    map_texture = textureFromPixelArray(gl,map_buffer,screen_dx,screen_dy);
}

