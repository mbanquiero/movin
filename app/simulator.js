
// globales
var screen_dx = 2048;
var screen_dy = 2048;
var step = 0;
var vel_sim = 1;
var map_buffer = null;
var semaforos = [];
var cant_semaforos = 0;


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
    var postProcessProgram , reShader, copyShader , reduceShader , initCO2Shader;

	
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

var reduceTexture = [];
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
		reduceTexture[i] = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, reduceTexture[i]);
		gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,W, W, border,format, type, data);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, reduceTexture[i], level);	
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
			
		// establezo la configuracion de los semaforos
		semaforos.forEach(s => 	{
			setSemaforo(s.x,s.y,map_buffer,RED_TIME[s.n],OFFSET[s.n]);});

		// actualizo los datos de la textura
		gl.bindTexture(gl.TEXTURE_2D, map_texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, screen_dx, screen_dy, 0, gl.RGBA, gl.UNSIGNED_BYTE, map_buffer);
		step = 0;
		vel_sim = 512;

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

		// Computo con parallel reduce
		// inicializo el reduce con el canalb

		// inicializo el reduce con el canalb
		let W = screen_dx;
		gl.useProgram(initCO2Shader);
		gl.bindFramebuffer(gl.FRAMEBUFFER, reduceBuffer[0]);
		gl.drawBuffers( [gl.COLOR_ATTACHMENT0, gl.NONE]);
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
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, reduceTexture[i-1]);
			gl.viewport(0, 0, W, W);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
			gl.uniform1i(gl.getUniformLocation(reduceShader, 'uSampler'), 0);
			gl.uniform1i(gl.getUniformLocation(reduceShader, 'W'), W);
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, fullscreenQuad.numItems);

		}

		var p = new Uint8Array(4);
		gl.readPixels(0, 0, 1,1, gl.RGBA, gl.UNSIGNED_BYTE, p);
		let co2 = p[0]+p[1]*256+p[2]*256*256+p[3]*256*256*256;


		// devuelvo el valor de emision
		return co2;
		
		
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

		// Computo con parallel reduce
		// inicializo el reduce con el canalb

		// inicializo el reduce con el canalb
		let W = screen_dx;
		gl.useProgram(initCO2Shader);
		gl.bindFramebuffer(gl.FRAMEBUFFER, reduceBuffer[0]);
		gl.drawBuffers( [gl.COLOR_ATTACHMENT0, gl.NONE]);
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
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, reduceTexture[i-1]);
			gl.viewport(0, 0, W, W);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
			gl.uniform1i(gl.getUniformLocation(reduceShader, 'uSampler'), 0);
			gl.uniform1i(gl.getUniformLocation(reduceShader, 'W'), W);
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, fullscreenQuad.numItems);
		}


		gl.bindFramebuffer(gl.FRAMEBUFFER, reduceBuffer[reduceBuffer.length-1]);
		var p = new Uint8Array(4);
		gl.readPixels(0, 0, 1,1, gl.RGBA, gl.UNSIGNED_BYTE, p);
		let co2 = p[0]+p[1]*256+p[2]*256*256+p[3]*256*256*256;



		return co2;		// devuelve la cantidad de co2 emitido
		
    }

	function drawSimulation()
	{
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, accTexture);
		gl.viewport(0, 0, screen_dx, screen_dy);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.useProgram(copyShader);
		gl.uniform1i(gl.getUniformLocation(copyShader, 'uSampler'), 0);
		gl.uniform1i(gl.getUniformLocation(copyShader, 'uSamplerMap'), 1);
		gl.uniform1i(gl.getUniformLocation(copyShader, 'screen_dx'), screen_dx);
		gl.uniform1i(gl.getUniformLocation(copyShader, 'screen_dy'), screen_dy);
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
		data[pos] = r;
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

		var dir = dx>dy ? (sx==1?2:4) : (sy==1?1:8);
	 
		while(true) 
		{
			if(x0>=0 && x0<screen_dx && y0>=0 && y0<screen_dy)
		   	setRPixel(x0, y0 , data , dir);
	 
		   if ((x0 === x1) && (y0 === y1)) break;
		   var e2 = 2*err;
		   if (e2 > -dy) { err -= dy; x0  += sx; }
		   if (e2 < dx) { err += dx; y0  += sy; }
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

	function doKeyDown(e) 
	{
		switch(e.keyCode)
		{
			case 34:
				vel_sim *=2;
				break;
			case 33:
				vel_sim /=2;
				if(vel_sim<1)
					vel_sim = 1;
				break;
		}
	}


    async function webGLStart() {

		// Primero cargo todo los shaders en el html 
		await loadShader("postprocess.vs");
		await loadShader("postprocess.fs");
		await loadShader("re.fs");
		await loadShader("reduce.fs");
		await loadShader("initCO2.fs");
		await loadShader("copy.fs");

        textCanvas = document.getElementById("text_canvas");
		ctx = textCanvas.getContext("2d");
        var canvas = document.getElementById("canvas");
		document.addEventListener( "keydown", doKeyDown, true);
		

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

	