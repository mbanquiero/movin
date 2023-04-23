function initMap1()
{
    map_buffer = new Uint8Array(screen_dx*screen_dy*4);

    cant_semaforos = 0;         // ojo que cant_semaforos <= semaforos.lenght! 
    semaforos = [];

    let x0 = 10;
    let x1 = screen_dx-10;
    let y0 = 10;
    let y1 = screen_dy-10;

    let ym = (y1+y0)/2;
    let xm = (x1+x0)/2;

    // carretera horizontal
    for(let i=x0;i<x1;++i)
        setRPixel(i,ym,map_buffer,DERECHA);
    
    // carreteras vertical
    for(let i=y0;i<y1;++i)
        setRPixel(xm,i,map_buffer,ARRIBA);


    // flujo de trafico
    setGPixel(xm-150,ym,map_buffer,TRAFICO_H);
    setGPixel(xm,ym-150,map_buffer,TRAFICO_V);

    // semaforo del cruce 
    semaforos.push({n:cant_semaforos, x:ym-3 , y:ym});
    semaforos.push({n:cant_semaforos,x:ym , y:ym-3});
    cant_semaforos++;

	// establezo la configuracion de los semaforos
    setSemaforosConfig();


    map_texture = textureFromPixelArray(gl,map_buffer,screen_dx,screen_dy);
}



