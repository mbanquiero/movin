// stress city

// hace una linea con trafico
function make_line(x0, y0, x1, y1,data) 
{
    x0|=0;
    y0|=0;
    x1|=0;
    y1|=0;
    var dx = Math.abs(x1 - x0);
    var dy = Math.abs(y1 - y0);
    var sx = (x0 < x1) ? 1 : -1;
    var sy = (y0 < y1) ? 1 : -1;
    var err = dx - dy;

    while(true) 
    {
        var px = x0;
        var py = y0;
        var mov_x = false;
        var mov_y = false;
 
       if ((x0 === x1) && (y0 === y1)) break;
       var e2 = 2*err;
       if (e2 > -dy) 
       { 
            err -= dy; 
            x0  += sx;
            mov_x = true;
        }
           if (e2 < dx) 
        { 
            err += dx; 
            y0  += sy;
            mov_y = true;
        }

       if(px>=0 && px<screen_dx && py>=0 && py<screen_dy)
       {
            var dir = 0;
            if(!mov_x)
                dir = sy==1?ARRIBA : ABAJO;
            else
            if(!mov_y)
                dir = sx==1?DERECHA : IZQUIERDA;
            else
            if(sx==1)
                dir = sy==1?ARRIBA_DERECHA : ABAJO_DERECHA;
            else
                dir = sy==1?ARRIBA_IZQUIERDA : ABAJO_IZQUIERDA;
            setRPixel(px, py , data , dir);

            // genero trafico
            if(Math.random()<0.08)
                setGPixel(px,py,data,50);
                /*
            else
            if(Math.random()<0.1)
                semaforos.push({n:cant_semaforos++, x:px , y:py});
                */
                
       }
    }
 }


async function initMap3()
{
    map_buffer = new Uint8Array(screen_dx*screen_dy*4);
    cant_semaforos = 0;         // ojo que cant_semaforos <= semaforos.lenght! 
    semaforos = [];

    // cargo un mapa de fondo
	await loadMap("ej7.dat");

    
    let xm = screen_dx/2;
    let ym = screen_dy/2;

	let x0 = screen_dx/2-200;
	let y0 = screen_dy/2;

    // letra M
    for(let t=0;t<20;t+=3)
    {
        make_line(x0+t,y0,x0+t,y0+120,map_buffer);
        make_line(x0+t,y0+120,x0+40+t,y0+80,map_buffer);
        make_line(x0+40+t,y0+80,x0+80+t,y0+120,map_buffer);
        make_line(x0+80+t,y0+120,x0+80+t,y0,map_buffer);
    }


    // letra O
    ym+=60;
    for(let r = 30; r <60; r+=3)
    {
        let an = 0;
        x0 = xm+r*Math.cos(an);
        y0 = ym+r*Math.sin(an);
        for(let i=0;i<16;++i)
        {
            an += Math.PI/8;
            let x1 = xm+r*Math.cos(an);
            let y1 = ym+r*Math.sin(an);
            make_line(x0,y0,x1,y1,map_buffer);
            x0 = x1;
            y0 = y1;
        }
    }
	ym = y0 = screen_dy/2;

    // letra V
    x0+=20;
    for(let t=0;t<20;t+=3)
    {
        make_line(x0+t,y0+120,x0+30+t,y0,map_buffer);
        make_line(x0+t+30,y0,x0+60+t,y0+120,map_buffer);
    }

    // letra I
    x0+=100;
    for(let t=0;t<20;t+=3)
    {
        make_line(x0+t,y0+120,x0+t,y0,map_buffer);
    }

    x0+=40;
    // letra N
    for(let t=0;t<20;t+=3)
    {
        make_line(x0+t,y0,x0+t,y0+120,map_buffer);
        make_line(x0+t,y0+120,x0+60+t,y0,map_buffer);
        make_line(x0+t+60,y0,x0+60+t,y0+120,map_buffer);
    }


	// establezo la configuracion de los semaforos
    RED_TIME = [128];
	OFFSET = [0];
    setSemaforosConfig();

    map_texture = textureFromPixelArray(gl,map_buffer,screen_dx,screen_dy);

}


