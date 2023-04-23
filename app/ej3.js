// stress city
function initMap3()
{
    map_buffer = new Uint8Array(screen_dx*screen_dy*4);
    cant_semaforos = 0;         // ojo que cant_semaforos <= semaforos.lenght! 
    semaforos = [];

    for(let i =0;i<10;++i)
    {
        let x0 = Math.random()*screen_dx|0;
        let y0 = Math.random()*screen_dy|0;
        setGPixel(x0,y0,map_buffer,30);
        let x1 = Math.random()*screen_dx|0;
        let y1 = Math.random()*screen_dy|0;
        line(x0,y0,x1,y1,map_buffer);
        
    }

    /*
    setGPixel(x0,y0,map_buffer,30);
    for(let i =0;i<10;++i)
    {
        let x1 = x0 + (Math.cos(an)*100)|0;
        let y1 = y0 + (Math.sin(an)*100)|0;
        line(x0,y0,x1,y1,map_buffer);
        x0 = x1;
        y0 = y1;

        if(Math.random()<0.5)
            an += Math.PI/2;
        else
            an -= Math.PI/2;
    }*/

    map_texture = textureFromPixelArray(gl,map_buffer,screen_dx,screen_dy);

}


