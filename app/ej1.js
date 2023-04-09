function initMap1()
{
    map_buffer = new Uint8Array(screen_dx*screen_dy*4);


    // carretera horizontal
    for(let i=x0;i<x1;++i)
        setRPixel(i,300,map_buffer,2);
    
    // carreteras vertical
    for(let i=y0;i<y1;++i)
        setRPixel(300,i,map_buffer,1);


    // flujo de trafico
    setGPixel(x0,300,map_buffer,TRAFICO_H);
    setGPixel(300,y0+10,map_buffer,TRAFICO_V);

    // semaforo del cruce 
    semaforos.push({x:300-3 , y:300});
    semaforos.push({x:300 , y:300-3});

    semaforos.forEach(s => 	{
        setSemaforo(s.x,s.y,map_buffer,RED_TIME,0);});


    map_texture = textureFromPixelArray(gl,map_buffer,screen_dx,screen_dy);
}



