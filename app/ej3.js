// diagonales
function initMap3()
{
    map_buffer = new Uint8Array(screen_dx*screen_dy*4);
    cant_semaforos = 0;         // ojo que cant_semaforos <= semaforos.lenght! 
    semaforos = [];

    var x0 = 50;
    var x1 = 500;
    var y  = 300;
    for(let i=x0;i<x1;++i)
    {
        setRPixel(i,y,map_buffer,2);
        setRPixel(i,500-y,map_buffer,2);

        if(i%10==0)
            y++;
    }
    setGPixel(x0,300,map_buffer,80);
    setGPixel(x0,200,map_buffer,80);

    for(let i=y0;i<y1;++i)
        setRPixel(300,i,map_buffer,1);
    setGPixel(300,y0,map_buffer,TRAFICO_V);
    setSemaforosConfig();


    map_texture = textureFromPixelArray(gl,map_buffer,screen_dx,screen_dy);

}


