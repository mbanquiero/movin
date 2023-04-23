

async function loadMap(fname)
{
	var url = "../../app/"+fname;
	try 
	{
		var param = {
				method: 'GET', 
			};
		const request = await fetch(url,param);
		const arrayBuffer = await request.arrayBuffer();
		map_buffer = new Uint8Array(arrayBuffer);
	} 
	catch(e) 
	{
		return false;
	}
	return true;
}

async function loadSemaforos(fname)
{
	var url = "../../app/"+fname;
	try 
	{
		var param = {
				method: 'GET', 
			};
		const request = await fetch(url,param);
		const arrayBuffer = await request.arrayBuffer();
		const data = new Uint32Array(arrayBuffer);
		cant_semaforos = data[0];
		semaforos = [];
		for(let i=0;i<cant_semaforos;++i)
		{
			let x = data[2*i+1];
			let y = data[2*i+2];
			semaforos.push({n:i,x:x , y:y});
			RED_TIME[i] = Math.random()*255 | 0;
			OFFSET[i] = Math.random()*255 | 0;
		}

	} 
	catch(e) 
	{
		return false;
	}
	return true;
}

async function initMap7()
{
	await loadMap("ej7.dat");
	await loadSemaforos("ej7.sem");
	setSemaforosConfig();
	map_texture = textureFromPixelArray(gl, map_buffer, screen_dx, screen_dy);
}


async function initMap8()
{
	await loadMap("ej8.dat");
	await loadSemaforos("ej8.sem");
	setSemaforosConfig();
	map_texture = textureFromPixelArray(gl, map_buffer, screen_dx, screen_dy);
}

async function initMap9()
{
	await loadMap("ej9.dat");
	await loadSemaforos("ej9.sem");
	setSemaforosConfig();
	map_texture = textureFromPixelArray(gl, map_buffer, screen_dx, screen_dy);
}

async function initMap10()
{
	await loadMap("ej10.dat");
	await loadSemaforos("ej10.sem");
	setSemaforosConfig();
	map_texture = textureFromPixelArray(gl, map_buffer, screen_dx, screen_dy);
}

