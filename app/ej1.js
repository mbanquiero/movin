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

    // carretera horizontal
    for(let i=x0;i<x1;++i)
        setRPixel(i,ym,map_buffer,2);
    
    // carreteras vertical
    for(let i=y0;i<y1;++i)
        setRPixel(ym,i,map_buffer,1);


    // flujo de trafico
    setGPixel(x0,ym,map_buffer,TRAFICO_H);
    setGPixel(ym,y0+10,map_buffer,TRAFICO_V);

    // semaforo del cruce 
    semaforos.push({n:cant_semaforos, x:ym-3 , y:ym});
    semaforos.push({n:cant_semaforos,x:ym , y:ym-3});
    cant_semaforos++;

	// establezo la configuracion de los semaforos
    setSemaforosConfig();


    map_texture = textureFromPixelArray(gl,map_buffer,screen_dx,screen_dy);
}



