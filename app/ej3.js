// diagonales
function initMap3()
{
    var map_buffer = new Uint8Array(screen_dx*screen_dy*4);

    var x0 = 50;
    var x1 = 500;

    for(let i=x0;i<x1;++i)
    {
        setRPixel(x0+x1-i,i,map_buffer,4+8);
        setRPixel(i,i,map_buffer,2+8);
    }
    setGPixel(x1,x0,map_buffer,80);
    setGPixel(x0,x0,map_buffer,80);

    let pm = (x1+x0)/2;
    setSemaforo(pm+5,pm-5,map_buffer,192,0);
    setSemaforo(pm-5,pm-5,map_buffer,192,0);

    x0+=50;
    x1+=50;
    for(let i=x0;i<=x1;++i)
    {
        setRPixel(x0+x1-i,i,map_buffer,2+1);
        setRPixel(i,i,map_buffer,4+1);
    }
    setGPixel(x1,x1,map_buffer,80);
    setGPixel(x0,x1,map_buffer,80);
    pm = (x1+x0)/2;
    setSemaforo(pm+5,pm-5,map_buffer,192,0);
    setSemaforo(pm-5,pm-5,map_buffer,192,0);

    map_texture = textureFromPixelArray(gl,map_buffer,screen_dx,screen_dy);
    // actualizo los datos de la textura
	gl.bindTexture(gl.TEXTURE_2D, map_texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, screen_dx, screen_dy, 0, gl.RGBA, gl.UNSIGNED_BYTE, map_buffer);
    step = 0;

}


