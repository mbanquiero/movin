function initMap5()
{
    map_buffer = new Uint8Array(screen_dx*screen_dy*4);

    cant_semaforos = 0;         // ojo que cant_semaforos <= semaforos.lenght! 
    semaforos = [];


    let x0 = 5;
    let y0 = 200;
    for(let i=0;i<32;i+=2)
    {
        let inv = i<16;
        line(x0,y0+i,x0+500,y0+i,map_buffer,inv);
        if(inv)
        {
            setGPixel(x0+500,y0+i,map_buffer,30);
            semaforos.push({n:cant_semaforos,x:x0+220 , y:y0+i});
        }            
        else
        {
            setGPixel(x0,y0+i,map_buffer,10);
            semaforos.push({n:cant_semaforos,x:x0+180 , y:y0+i});
        }
                 
    }

    x0 = 200;
    y0 = 5;
    for(let i=0;i<16;i+=2)
    {
        let inv = i<8;
        line(x0+i,y0,x0+i,y0+500,map_buffer,inv);

        if(inv)
        {
            setGPixel(x0+i,y0+500,map_buffer,30);
            semaforos.push({n:cant_semaforos,x:x0+i , y:y0+250});
        }            
        else
        {
            setGPixel(x0+i,y0,map_buffer,10);
            semaforos.push({n:cant_semaforos,x:x0+i , y:y0+180});
        }
                 

    }

    ++cant_semaforos;

    /*
    let x0 = 5;
    let y0 = 5;
    for(let i=0;i<32;i+=3)
    {
        let inv = i<16;
        line(x0,y0+i,x0+200,y0+i,map_buffer,inv);
        line(x0+200,y0+i,x0+400-i,y0+200,map_buffer,inv);
        line(x0+400-i,y0+200,x0+400-i,y0+500,map_buffer,inv);
        if(inv)
            setGPixel(x0+400-i,y0+500,map_buffer,30);
        else
            setGPixel(x0,y0+i,map_buffer,10);

        //semaforos.push({x:x0+10 , y:i});
                 
    }

    for(let j=0;j<1;++j)
    for(let i=0;i<8;i+=2)
    {
        let y = y0+400+i-j*50;
        let inv = i<4;
        line(x0,y,x0+500,y,map_buffer,inv);
        if(inv)
            setGPixel(x0+500,y,map_buffer,30);
        else
            setGPixel(x0,y,map_buffer,10);

        //semaforos.push({x:x0+10 , y:i});
                 
    }
    */

	// establezo la configuracion de los semaforos
    setSemaforosConfig();

    map_texture = textureFromPixelArray(gl,map_buffer,screen_dx,screen_dy);
}

