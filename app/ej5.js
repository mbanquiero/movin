function initMap5()
{
    map_buffer = new Uint8Array(screen_dx*screen_dy*4);

    /*    
    line(x0,y0,x0+100,y0+100,map_buffer);
    line(x0+100,y0+100,x0+300,y0+30,map_buffer);
    setGPixel(x0,y0,map_buffer,10);
    */


    for(let j=0;j<100;++j)
    {
        let x0 = 100 + Math.random()*256 | 0 ;
        let y0 = 100 + Math.random()*256 | 0 ;
        setGPixel(x0,y0,map_buffer,100);
        let an = 0;
        for(let i=0;i<10;++i)
        {
            let x1 = x0 + 20*Math.cos(an) | 0;
            let y1 = y0 + 20*Math.sin(an) | 0;
            line(x0,y0,x1,y1,map_buffer);
            x0 = x1;
            y0 = y1;

            an += Math.random()*Math.PI/4.0;
        }
    }

    semaforos.forEach(s => 	{
        setSemaforo(s.x,s.y,map_buffer,RED_TIME,0);});

    map_texture = textureFromPixelArray(gl,map_buffer,screen_dx,screen_dy);
}

