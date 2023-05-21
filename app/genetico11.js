// CODIGO DE PRUEBAS PARA EL ALGORITMO GENÉTICO (A PARTIR DEL CÓDIGO "genetico3.js" AMPLIADO) 
// AHORA MINIMIZANDO LA FUNCIÓN FITNESS:

// Función de evaluación fitness
function fitness(individual) 
{
  // seteo la configuracion de los semaforos desde la info del cromosoma del individuo
  RED_TIME = [];
  OFFSET = [];
  for(let i = 0;i<cant_semaforos;++i)
  {
    RED_TIME[i] = individual[2*i];		// el primer byte representa el tiempo rojo
    OFFSET[i] = individual[2*i+1];		// el segundo byte representa el offset de tiempo
  }

  // llamo al simulador para evalua el total de co2 de esta configuracion de semaforos    
  return calcular_co2().co2;

}

// Función para generar una población inicial aleatoria
// hay una variable global poblacion
var _tp;
var _lc;
function generarPoblacionInicial() 
{
  poblacion = [];     // limpio la variable global
  poblacion_creada = false;
	setTimeout(generarIndividuo,100);
}


function generarIndividuo()
{
  // creo un undividuo
  var cromosoma = [];
  for (var j = 0; j < longitudCromosoma; j++) 
  {
    // Generar un número aleatorio del 1 al 255
    var alelo = Math.floor(Math.random() * 255) + 1;
    cromosoma.push(alelo);
  }

  // agrego el inviduo a la poblacion, aca se computa el fitness 
  poblacion.push({c:cromosoma, f:fitness(cromosoma)});

  if(poblacion.length<tamanoPoblacion)
  {
		// muestro la evolucion
		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, 1000, 20);		
		ctx.fillStyle = "yellow";
		ctx.font = "12px Courier New";
		ctx.fillText("Creando individio "+poblacion.length, 10,10);	

    // sigo creando individuos
    setTimeout(generarIndividuo,1);

  }
  else
  {
    // termine de crear todo:
    // Ordenar la población de forma ascendente según el fitness
    poblacion.sort(function (a, b) { return a.f - b.f;});
    // señal para avisar que la poblacion fue creada
    poblacion_creada = true;
  }
}


// Función para realizar el cruce de dos cromosomas
function cruzarCromosomas(cromosoma1, cromosoma2) {
  // Obtener un punto de cruce aleatorio
  var puntoCruce = Math.floor(Math.random() * cromosoma1.length);

  // Realizar el cruce intercambiando las secciones de los cromosomas
  var hijo1 = cromosoma1.slice(0, puntoCruce).concat(cromosoma2.slice(puntoCruce));
  var hijo2 = cromosoma2.slice(0, puntoCruce).concat(cromosoma1.slice(puntoCruce));

  return [hijo1, hijo2];
}

// Función para realizar la mutación de un cromosoma
function mutarCromosoma(cromosoma, tasaMutacion) {
  for (var i = 0; i < cromosoma.length; i++) {
    if (Math.random() < tasaMutacion) {
      // Generar un nuevo alelo aleatorio para la posición i
      cromosoma[i] = Math.floor(Math.random() * 255) + 1;
    }
  }
  return cromosoma;
}



// aplica un paso del algoritmo GA
function geneticAlgorithm() 
{

  // esto son los nuevos individuos que quiero agregar en cada generacion
  var cantidadNuevos = tamanoPoblacion*0.1;
  // y los voy a agregar haciendo cruces desde los primeros cant_sel de la lista
  var cantidadSeleccion = tamanoPoblacion*porcentajeSeleccion;

  // Realizar el cruce y la mutación para generar la nueva población
  for(var i=0;i<cantidadNuevos;++i)
  {
      // Seleccionar dos cromosomas padres aleatorios
      var padre1 = poblacion[Math.floor(Math.random() * cantidadSeleccion)];
      var padre2 = poblacion[Math.floor(Math.random() * cantidadSeleccion)];

      // Realizar el cruce de los padres para obtener dos hijos
      var hijos = cruzarCromosomas(padre1.c, padre2.c);

      // Mutar los hijos
      var hijo1 = mutarCromosoma(hijos[0], tasaMutacion);
      var hijo2 = mutarCromosoma(hijos[1], tasaMutacion);

      // Agregar los hijos a la poblacion
      poblacion.push({c:hijo1 , f:fitness(hijo1)});
      poblacion.push({c:hijo2 , f:fitness(hijo2)});
  }

  // Ordenar la población de forma ascendente según el fitness
  poblacion.sort(function (a, b) { return a.f - b.f;});

  // me quedo con los mejores 
  poblacion = poblacion.slice(0, tamanoPoblacion);


}
  