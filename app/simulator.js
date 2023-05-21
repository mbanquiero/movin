
// globales
var screen_dx = 2048;
var screen_dy = 2048;
var offset_x = 0;
var offset_y = 0;

// Eventos del mouse
var EV_NADA				= 0;
var EV_PAN_REALTIME		= 1;
var eventoInterno = EV_NADA;
var mouse_x = 0;
var mouse_y = 0;

var RENDER_ZOOM		= 0;
var RENDER_COPY		= 1;
var RENDER_UNZOOM	= 2;

var tipo_render = RENDER_ZOOM;


var step = 0;
var vel_sim = 1;
var map_buffer = null;
var semaforos = [];
var cant_semaforos = 0;

var ARRIBA            = 2;
var ABAJO             = 64;
var IZQUIERDA         = 8;
var DERECHA           = 16;
var ARRIBA_DERECHA    = 4;
var ARRIBA_IZQUIERDA  = 1;
var ABAJO_DERECHA     = 128;
var ABAJO_IZQUIERDA   = 32;


// chrome render loop hack
(function() {
var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                              window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
	window.requestAnimationFrame = requestAnimationFrame;
	})();
	
	


    var gl;
    function initGL(canvas) {
        try {
			gl = canvas.getContext("webgl2", 
                 { antialias: true,
                   depth: true ,
				   alpha: false  
				   });            
		    gl.viewportWidth = screen_dx;
            gl.viewportHeight = screen_dy;
			gl.getExtension("EXT_color_buffer_float");
  	
        } catch (e) {
        }
        if (!gl) {
            alert("Could not initialise WebGL, sorry :-(");
        }
    }

	// -------------- html stuff para cargar los shaders -----------------------
	async function loadShader(fname)
	{
		var url = "../../app/shaders/"+fname;
		try 
		{
			var param = {
					method: 'GET', 
				};
			const request = await fetch(url,param);
			const str = await request.text();
			var el = document.createElement("script");
			el.setAttribute("id",fname);
			el.setAttribute("type",fname.endsWith(".fs") ? "x-shader/x-fragment" : "x-shader/x-vertex");
			el.innerHTML = str;
			document.head.appendChild(el);
		} 
		catch(e) 
		{
			return false;
		}
		return true;
	}
	



    function getShader(gl, id) {
        var shaderScript = document.getElementById(id);
        if (!shaderScript) {
            return null;
        }

        var str = "";
        var k = shaderScript.firstChild;
        while (k) {
            if (k.nodeType == 3) {
                str += k.textContent;
            }
            k = k.nextSibling;
        }

        var shader;
        if (shaderScript.type == "x-shader/x-fragment") {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else if (shaderScript.type == "x-shader/x-vertex") {
            shader = gl.createShader(gl.VERTEX_SHADER);
        } else {
            return null;
        }

        gl.shaderSource(shader, str);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    }

	// inicializo los shaders
    var postProcessProgram , reShader, copyShader , reduceShader , initCO2Shader , 
		zoomShader, unzoomShader;

	
    function initShaders() {
	
    	var fragmentShader = getShader(gl, "postprocess.fs");
        var vertexShader = getShader(gl, "postprocess.vs");
        postProcessProgram = gl.createProgram();
        gl.attachShader(postProcessProgram, vertexShader);
        gl.attachShader(postProcessProgram, fragmentShader);
        gl.linkProgram(postProcessProgram);

        if (!gl.getProgramParameter(postProcessProgram, gl.LINK_STATUS)) {
            alert("Could not initialise shaders");
        }

        gl.useProgram(postProcessProgram);

        postProcessProgram.vertexPositionAttribute = gl.getAttribLocation(postProcessProgram, "aVertexPosition");
        gl.enableVertexAttribArray(postProcessProgram.vertexPositionAttribute);
		
		// Reevaluo Estrategia shader
		fragmentShader = getShader(gl, "re.fs");
		reShader = gl.createProgram();
		gl.attachShader(reShader, vertexShader);
		gl.attachShader(reShader, fragmentShader);
		gl.linkProgram(reShader);
		if (!gl.getProgramParameter(reShader, gl.LINK_STATUS)) {
			alert("Could not initialise shaders");
		}

		// Reduce shader
		fragmentShader = getShader(gl, "reduce.fs");
		reduceShader = gl.createProgram();
		gl.attachShader(reduceShader, vertexShader);
		gl.attachShader(reduceShader, fragmentShader);
		gl.linkProgram(reduceShader);
		if (!gl.getProgramParameter(reduceShader, gl.LINK_STATUS)) {
			alert("Could not initialise shaders");
		}

		// initCO2 shader
		fragmentShader = getShader(gl, "initCO2.fs");
		initCO2Shader = gl.createProgram();
		gl.attachShader(initCO2Shader, vertexShader);
		gl.attachShader(initCO2Shader, fragmentShader);
		gl.linkProgram(initCO2Shader);
		if (!gl.getProgramParameter(initCO2Shader, gl.LINK_STATUS)) {
			alert("Could not initialise shaders");
		}

		// copy shader
		fragmentShader = getShader(gl, "copy.fs");
		copyShader = gl.createProgram();
		gl.attachShader(copyShader, vertexShader);
		gl.attachShader(copyShader, fragmentShader);
		gl.linkProgram(copyShader);
		if (!gl.getProgramParameter(copyShader, gl.LINK_STATUS)) {
			alert("Could not initialise shaders");
		}

		// zoom shader
		fragmentShader = getShader(gl, "zoom.fs");
		zoomShader = gl.createProgram();
		gl.attachShader(zoomShader, vertexShader);
		gl.attachShader(zoomShader, fragmentShader);
		gl.linkProgram(zoomShader);
		if (!gl.getProgramParameter(zoomShader, gl.LINK_STATUS)) {
			alert("Could not initialise shaders");
		}
		

		// unzoom shader
		fragmentShader = getShader(gl, "unzoom.fs");
		unzoomShader = gl.createProgram();
		gl.attachShader(unzoomShader, vertexShader);
		gl.attachShader(unzoomShader, fragmentShader);
		gl.linkProgram(unzoomShader);
		if (!gl.getProgramParameter(unzoomShader, gl.LINK_STATUS)) {
			alert("Could not initialise shaders");
		}

	}

	
    function initFullScreenQuad() {
        
		fullscreenQuad = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, fullscreenQuad);
        var vertices = [
             -1.0, -1.0,  0.5,
            -1.0, 1.0,  0.5,
             1.0, -1.0,  0.5,
             1.0, 1.0,  0.5,
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        fullscreenQuad.itemSize = 3;
        fullscreenQuad.numItems = 4;
		
		
		rt_ready = true;

	}


var accTexture, currTexture;
var accTexture2, currTexture2;
var accBuffer, currBuffer;

function initRenderTexture() 
{
	
	const level = 0;
	const internalFormat = gl.RGBA;
	const border = 0;
	const format = gl.RGBA;
	const type = gl.UNSIGNED_BYTE;
	const data = null;
	var Texture = [];
	var Texture2 = [];
	var Buffer = [];
			
	// accumulation textures
	for(var i=0;i<2;++i)
	{
		// creo el framebuffer
		Buffer[i] = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, Buffer[i]);
		
		// Textura para guardar los primer tanda de datos
		Texture[i] = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, Texture[i]);
		gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
					screen_dx, screen_dy, border,
					format, type, data);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, Texture[i], level);	

		// Textura para guardar segunda tanda de datos
		Texture2[i] = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, Texture2[i]);
		gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
					screen_dx, screen_dy, border,
					format, type, data);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, Texture2[i], level);	

	}	
	
	
	currBuffer = Buffer[0];
	currTexture = Texture[0];
	currTexture2 = Texture2[0];

	accBuffer = Buffer[1];
	accTexture = Texture[1];
	accTextur2 = Texture2[1];

	gl.drawBuffers( [gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);


}

var reduceTexture = [];			// textura para el co2 
var reduceTexture2 = [];		// textura para la cantidad de autos
var reduceBuffer = [];

function initReduceTexture() 
{
	
	const level = 0;
	const internalFormat = gl.RGBA;
	const border = 0;
	const format = gl.RGBA;
	const type = gl.UNSIGNED_BYTE;
	const data = null;

	var W = screen_dx;
	var i = 0;
	while(W>=1)
	{
		// creo el framebuffer
		reduceBuffer[i] = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, reduceBuffer[i]);

		// textura para el co2
		reduceTexture[i] = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, reduceTexture[i]);
		gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,W, W, border,format, type, data);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, reduceTexture[i], level);	

		// textura para la cantidad de autos
		reduceTexture2[i] = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, reduceTexture2[i]);
		gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,W, W, border,format, type, data);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, reduceTexture2[i], level);	

		i++;
		W/=2;
	}	

}




	// render loop
	
	var step = 0;
	var TRAFICO_H = 50;
	var TRAFICO_V = 50;
	var RED_TIME = [240];
	var OFFSET = [0];
	var MEJOR_RED_TIME = RED_TIME.slice();
	var MEJOR_OFFSET = OFFSET.slice();
	var MIN_CO2 = -1;

	
	function calcular_co2() 
	{
		sol_visitadas++;		// cantidad de veces que se llamo a fitness
			
		// establezo la configuracion de los semaforos
		semaforos.forEach(s => 	{
			setSemaforo(s.x,s.y,map_buffer,RED_TIME[s.n],OFFSET[s.n]);});

		// actualizo los datos de la textura
		gl.bindTexture(gl.TEXTURE_2D, map_texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, screen_dx, screen_dy, 0, gl.RGBA, gl.UNSIGNED_BYTE, map_buffer);
		step = 0;

		//vel_sim = 512;
		vel_sim = 64;

		for(let Q=0;Q<vel_sim;++Q)
		{

			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, accTexture);
			gl.activeTexture(gl.TEXTURE1);
			gl.bindTexture(gl.TEXTURE_2D, map_texture);
			
			// Post process 1
			gl.bindFramebuffer(gl.FRAMEBUFFER, currBuffer);
			gl.drawBuffers( [gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);			
			gl.useProgram(postProcessProgram);
			gl.viewport(0, 0, screen_dx, screen_dy);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
			gl.uniform1i(gl.getUniformLocation(postProcessProgram, 'uSampler'), 0);
			gl.uniform1i(gl.getUniformLocation(postProcessProgram, 'uSamplerMap'), 1);
			gl.uniform1i(gl.getUniformLocation(postProcessProgram, 'screen_dx'), screen_dx);
			gl.uniform1i(gl.getUniformLocation(postProcessProgram, 'screen_dy'), screen_dy);
			gl.uniform1i(gl.getUniformLocation(postProcessProgram, 'step'), step++);
			gl.bindBuffer(gl.ARRAY_BUFFER, fullscreenQuad);
			gl.vertexAttribPointer(postProcessProgram.vertexPositionAttribute, fullscreenQuad.itemSize, gl.FLOAT, false, 0, 0);
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, fullscreenQuad.numItems);
			
			// Post process 2
			gl.bindFramebuffer(gl.FRAMEBUFFER, accBuffer);
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, currTexture);
			gl.activeTexture(gl.TEXTURE2);
			gl.bindTexture(gl.TEXTURE_2D, currTexture2);

			gl.viewport(0, 0, screen_dx, screen_dy);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
			gl.useProgram(reShader);
			gl.uniform1i(gl.getUniformLocation(reShader, 'uSampler'), 0);
			gl.uniform1i(gl.getUniformLocation(reShader, 'uSamplerMap'), 1);
			gl.uniform1i(gl.getUniformLocation(reShader, 'uSampler2'), 2);
			gl.uniform1i(gl.getUniformLocation(reShader, 'screen_dx'), screen_dx);
			gl.uniform1i(gl.getUniformLocation(reShader, 'screen_dy'), screen_dy);

			gl.drawArrays(gl.TRIANGLE_STRIP, 0, fullscreenQuad.numItems);
	
		}

		return parallel_reduce();
		
    }

	
	function parallel_reduce()
	{
		// Computo con parallel reduce
		// inicializo el reduce con el canalb

		// inicializo el reduce con el canalb
		let W = screen_dx;
		gl.useProgram(initCO2Shader);
		gl.bindFramebuffer(gl.FRAMEBUFFER, reduceBuffer[0]);
		gl.drawBuffers( [gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, accTexture);
		gl.viewport(0, 0, screen_dx, screen_dx);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.uniform1i(gl.getUniformLocation(initCO2Shader, 'uSampler'), 0);
		gl.uniform1i(gl.getUniformLocation(initCO2Shader, 'W'), W);

		gl.drawArrays(gl.TRIANGLE_STRIP, 0, fullscreenQuad.numItems);		
		
		gl.useProgram(reduceShader);
		for(let i=1;i<reduceBuffer.length;++i)
		{
			W/=2;
			gl.bindFramebuffer(gl.FRAMEBUFFER, reduceBuffer[i]);
			gl.drawBuffers( [gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, reduceTexture[i-1]);
			gl.activeTexture(gl.TEXTURE1);
			gl.bindTexture(gl.TEXTURE_2D, reduceTexture2[i-1]);
			gl.viewport(0, 0, W, W);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
			gl.uniform1i(gl.getUniformLocation(reduceShader, 'uSampler'), 0);
			gl.uniform1i(gl.getUniformLocation(reduceShader, 'uSamplerAutos'), 1);
			gl.uniform1i(gl.getUniformLocation(reduceShader, 'W'), W);
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, fullscreenQuad.numItems);

			
		}

		var p = new Uint8Array(4);
		gl.bindFramebuffer(gl.FRAMEBUFFER, reduceBuffer[reduceBuffer.length-1]);
		gl.drawBuffers( [gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);

		gl.readBuffer(gl.COLOR_ATTACHMENT1);
		gl.readPixels(0, 0, 1,1, gl.RGBA, gl.UNSIGNED_BYTE, p);
		let cant_autos = p[0]+p[1]*256+p[2]*256*256+p[3]*256*256*256;

		gl.readBuffer(gl.COLOR_ATTACHMENT0);
		gl.readPixels(0, 0, 1,1, gl.RGBA, gl.UNSIGNED_BYTE, p);
		let co2 = p[0]+p[1]*256+p[2]*256*256+p[3]*256*256*256;


		// devuelve la cantidad de co2 emitido y la cantidad de autos
		return {co2:co2 , cant_autos:cant_autos};		

	}

	// ejecuta la simulacion
	function simulate(K) 
	{
		if(typeof K === 'undefined')
			K = vel_sim

		for(let Q=0;Q<K;++Q)
		{
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, accTexture);
			gl.activeTexture(gl.TEXTURE1);
			gl.bindTexture(gl.TEXTURE_2D, map_texture);
			
			// Post process 1
			gl.bindFramebuffer(gl.FRAMEBUFFER, currBuffer);
			gl.drawBuffers( [gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);
			gl.useProgram(postProcessProgram);
			gl.viewport(0, 0, screen_dx, screen_dy);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
			gl.uniform1i(gl.getUniformLocation(postProcessProgram, 'uSampler'), 0);
			gl.uniform1i(gl.getUniformLocation(postProcessProgram, 'uSamplerMap'), 1);
			gl.uniform1i(gl.getUniformLocation(postProcessProgram, 'screen_dx'), screen_dx);
			gl.uniform1i(gl.getUniformLocation(postProcessProgram, 'screen_dy'), screen_dy);
			gl.uniform1i(gl.getUniformLocation(postProcessProgram, 'step'), step++);
			gl.bindBuffer(gl.ARRAY_BUFFER, fullscreenQuad);
			gl.vertexAttribPointer(postProcessProgram.vertexPositionAttribute, fullscreenQuad.itemSize, gl.FLOAT, false, 0, 0);
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, fullscreenQuad.numItems);
			
			// Post process 2
			gl.bindFramebuffer(gl.FRAMEBUFFER, accBuffer);
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, currTexture);
			gl.activeTexture(gl.TEXTURE2);
			gl.bindTexture(gl.TEXTURE_2D, currTexture2);

			gl.viewport(0, 0, screen_dx, screen_dy);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
			gl.useProgram(reShader);
			gl.uniform1i(gl.getUniformLocation(reShader, 'uSampler'), 0);
			gl.uniform1i(gl.getUniformLocation(reShader, 'uSamplerMap'), 1);
			gl.uniform1i(gl.getUniformLocation(reShader, 'uSampler2'), 2);
			gl.uniform1i(gl.getUniformLocation(reShader, 'screen_dx'), screen_dx);
			gl.uniform1i(gl.getUniformLocation(reShader, 'screen_dy'), screen_dy);
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, fullscreenQuad.numItems);
	
		}

		return parallel_reduce();		
    }

	function drawSimulation()
	{
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, accTexture);
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, map_texture);

		gl.viewport(0, 0, 1200, 600);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
		var program;
		
		switch(tipo_render)
		{
			case RENDER_COPY:
			default:
				program = copyShader;
				break;
			case RENDER_ZOOM:
				program = zoomShader;
				break;
			case RENDER_UNZOOM:
				program = unzoomShader;
				break;
		}

		gl.useProgram(program);
		gl.uniform1i(gl.getUniformLocation(program, 'uSampler'), 0);
		gl.uniform1i(gl.getUniformLocation(program, 'uSamplerMap'), 1);
		gl.uniform1i(gl.getUniformLocation(program, 'screen_dx'), screen_dx);
		gl.uniform1i(gl.getUniformLocation(program, 'screen_dy'), screen_dy);
		gl.uniform1i(gl.getUniformLocation(program, 'offset_x'), offset_x);
		gl.uniform1i(gl.getUniformLocation(program, 'offset_y'), offset_y);

		gl.drawArrays(gl.TRIANGLE_STRIP, 0, fullscreenQuad.numItems);

	}

	
	// textura para guardar el map
	var map_texture;
	
	function textureFromPixelArray(gl, dataTypedArray, width, height) 
	{
		var tx = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, tx);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, dataTypedArray);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);	
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); 
		return tx;
	}	

	function setRPixel(x,y,data , r)
	{
		var pos = (y*screen_dx + x)*4;
		data[pos] |= r;
	}

	function setGPixel(x,y,data , g)
	{
		var pos = (y*screen_dx + x)*4;
		data[pos+1] = g;
	}

	function setBPixel(x,y,data , b)
	{
		var pos = (y*screen_dx + x)*4;
		data[pos+2] = b;
	}

	function setAPixel(x,y,data , a)
	{
		var pos = (y*screen_dx + x)*4;
		data[pos+3] = a;
	}

	function getRPixel(x,y,data , r)
	{
		var pos = (y*screen_dx + x)*4;
		return data[pos];
	}


	function setSemaforo(x,y,data , tr, t0)
	{
		// tr = tiempo rojo
		// t0 = tiempo inicial
		var pos = (y*screen_dx + x)*4;
		data[pos+2] = tr;
		data[pos+3] = t0;
	}


	function line(x0, y0, x1, y1,data, inv) 
	{
		x0|=0;
		y0|=0;
		x1|=0;
		y1|=0;
		if(typeof inv!=="undefined" && inv)
		{
			let aux = x1;
			x1 = x0;
			x0 = aux;
			aux = y1;
			y1 = y0;
			y0 = aux;
		}
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
		   }

		}
	 }


	    function getStrShader(id) {
        var shaderScript = document.getElementById(id);
        if (!shaderScript) {
            return null;
        }

        var str = "";
        var k = shaderScript.firstChild;
        while (k) {
            if (k.nodeType == 3) {
                str += k.textContent;
            }
            k = k.nextSibling;
        }
		return str;
	}


	var textCanvas;
	var ctx = null;

    async function webGLStart() {

		// Primero cargo todo los shaders en el html 
		await loadShader("postprocess.vs");
		await loadShader("postprocess.fs");
		await loadShader("re.fs");
		await loadShader("reduce.fs");
		await loadShader("initCO2.fs");
		await loadShader("copy.fs");
		await loadShader("zoom.fs");
		await loadShader("unzoom.fs");

        textCanvas = document.getElementById("text_canvas");
		ctx = textCanvas.getContext("2d");
        var canvas = document.getElementById("canvas");
		canvas.addEventListener("mousemove", onMouseMove, true);
		canvas.addEventListener("mousedown", onMouseDown, true);
		canvas.addEventListener("mouseup", onMouseUp, true);
		canvas.addEventListener("mousewheel", onMouseWheel, true);

		

		initGL(canvas);
        initShaders();
		initRenderTexture();
		initReduceTexture();
		initFullScreenQuad();
		gl.clearColor(0.5, 0.5, 0.5, 1.0);
        gl.enable(gl.DEPTH_TEST);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);		
		gl.disable(gl.BLEND);
    }
	

	// format number
	function fn(x,n)
	{
		return (' '.repeat(n)  + x.toFixed()).slice(-n);
	}

	// link con algoritmo genetico
	// setea la configuracion de TODOS los semaforos
	// semaforos es una variable global 

	function setSemaforosConfig()
	{
		// establezo la configuracion de los semaforos
		semaforos.forEach(s => 	{
			let red_time = s.n< RED_TIME.length ? RED_TIME[s.n] : RED_TIME[0];
			let offset = s.n< OFFSET.length ? OFFSET[s.n] : OFFSET[0];
			setSemaforo(s.x,s.y,map_buffer,red_time,offset);
			});
	}

	

	// --------------------------------------------
	// ---------------------- EVENTOS DEL MOUSE ----------------------
function onMouseMove() 
{
	var xPos = window.event.offsetX;
	var yPos = window.event.offsetY;

	var dr = tipo_render==RENDER_ZOOM ? 8 : 1;
	switch (eventoInterno) {

	    case EV_PAN_REALTIME:
			offset_x -= (xPos - mouse_x)/dr;
			offset_y += (yPos - mouse_y)/dr;
	        break;
	}

    // actualizo la posicion del mouse
	mouse_x = xPos;
	mouse_y = yPos;
	drawSimulation();
}

function onMouseDown(e) {
	mouse_x = window.event.offsetX;
	mouse_y = window.event.offsetY;
	eventoInterno = EV_PAN_REALTIME;
}


function onMouseUp(e) {
    // termino event de pan realtime
    eventoInterno = EV_NADA;
}


function onMouseWheel(e) {

    var delta = e.wheelDelta;
}


function rectangle(x0,y0,x1,y1,map_buffer)
{
	let xm = (x0+x1)/2;
	let ym = (y0+y1)/2;
	line(x0,y0,x1,y0,map_buffer);
    setGPixel(xm,y0,map_buffer,100);
    line(x1,y0,x1,y1,map_buffer);
    setGPixel(x1,ym,map_buffer,100);
    line(x1,y1,x0,y1,map_buffer);
    setGPixel(xm,y1,map_buffer,100);
    line(x0,y1,x0,y0,map_buffer);
    setGPixel(x0,ym,map_buffer,100);
}


function circle(xm,ym,r,map_buffer)
{
	let an = 0;
	let x0 = xm+r*Math.cos(an);
	let y0 = ym+r*Math.sin(an);
	setGPixel(x0,y0,map_buffer,100);
	for(let i=0;i<16;++i)
	{
		an += Math.PI/8;
		let x1 = xm+r*Math.cos(an);
		let y1 = ym+r*Math.sin(an);
		line(x0,y0,x1,y1,map_buffer);
		x0 = x1;
		y0 = y1;
	}
}
	

	
