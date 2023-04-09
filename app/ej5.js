function initMap5()
{
    map_buffer = new Uint8Array(screen_dx*screen_dy*4);

    let p = false;

    // carretera horizontal
    for(let j=100;j<500;j+=12)
    {
        for(let i=x0;i<x1;++i)
            setRPixel(i,j,map_buffer,p?2:4);
        setGPixel((x0+x1)/2,j,map_buffer,TRAFICO_H);
        p = !p;
    }
    
    // carreteras vertical
    for(let j=100;j<500;j+=16)
    {
        for(let i=y0;i<y1;++i)
            setRPixel(j,i,map_buffer,p?1:8);
        setGPixel(j,(y0+y1)/2,map_buffer,TRAFICO_V);
        p = !p;

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

    // carretera diagonal
    for(let i=x0;i<x1;i++)
        setRPixel(i,i,map_buffer,10);
    setGPixel(x0+10,x0+10,map_buffer,TRAFICO_V);


    semaforos.forEach(s => 	{
        setSemaforo(s.x,s.y,map_buffer,RED_TIME,0);});

    map_texture = textureFromPixelArray(gl,map_buffer,screen_dx,screen_dy);
}

