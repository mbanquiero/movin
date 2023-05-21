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
function generarPoblacionInicial(tamanoPoblacion, longitudCromosoma) {
  var poblacion = [];
  for (var i = 0; i < tamanoPoblacion; i++) {
    var cromosoma = [];
    for (var j = 0; j < longitudCromosoma; j++) {
      // Generar un número aleatorio del 1 al 255
      var alelo = Math.floor(Math.random() * 255) + 1;
      cromosoma.push(alelo);
    }
    poblacion.push(cromosoma);
  }
  return poblacion;
}

// Función para seleccionar los mejores cromosomas de la población
function seleccionarMejores(poblacion, porcentajeSeleccion) {
  // Ordenar la población de forma ascendente según el fitness
  poblacion.sort(function (a, b) {
    return fitness(a) - fitness(b);
  });

  // Calcular la cantidad de cromosomas a seleccionar
  var cantidadSeleccion = Math.floor(poblacion.length * porcentajeSeleccion);

  // Devolver los mejores cromosomas
  return poblacion.slice(0, cantidadSeleccion);
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

// Ejemplo de uso del algoritmo genético
var tamanoPoblacion = 10;
var longitudCromosoma = 2*cant_semaforos;
var porcentajeSeleccion = 0.5;
var tasaMutacion = 0.1;
var generaciones = 20;

// Generar población inicial
var poblacion = generarPoblacionInicial(tamanoPoblacion, longitudCromosoma);
console.log("Población inicial:", poblacion);

// Iterar sobre las generaciones
for (var g = 0; g < generaciones; g++) {
  console.log("Generación:", g + 1);

  // Seleccionar los mejores cromosomas
  var mejoresCromosomas = seleccionarMejores(poblacion, porcentajeSeleccion);
  console.log("Mejores cromosomas:", mejoresCromosomas);
  console.log("Fitness o evaluación de este cromosoma (posible solución) =", fitness(mejoresCromosomas[0]));// LINEA AGREGADA POR MI POSTERIORMENTE PARA COMPROBAR LA EVOLUCIÓN DEL ALGORITMO, SI VA MEJORANDO (REDUCIENDO) LA CIFRA DE CO2 ¿???
  console.log("Fitness o evaluación de este cromosoma (posible solución) =", fitness(mejoresCromosomas[1]));// LINEA AGREGADA POR MI POSTERIORMENTE PARA COMPROBAR LA EVOLUCIÓN DEL ALGORITMO, SI VA MEJORANDO (REDUCIENDO) LA CIFRA DE CO2 ¿???
  console.log("Fitness o evaluación de este cromosoma (posible solución) =", fitness(mejoresCromosomas[2]));// LINEA AGREGADA POR MI POSTERIORMENTE PARA COMPROBAR LA EVOLUCIÓN DEL ALGORITMO, SI VA MEJORANDO (REDUCIENDO) LA CIFRA DE CO2 ¿???
  console.log("Fitness o evaluación de este cromosoma (posible solución) =", fitness(mejoresCromosomas[3]));// LINEA AGREGADA POR MI POSTERIORMENTE PARA COMPROBAR LA EVOLUCIÓN DEL ALGORITMO, SI VA MEJORANDO (REDUCIENDO) LA CIFRA DE CO2 ¿???
  console.log("Fitness o evaluación de este cromosoma (posible solución) =", fitness(mejoresCromosomas[4]));// LINEA AGREGADA POR MI POSTERIORMENTE PARA COMPROBAR LA EVOLUCIÓN DEL ALGORITMO, SI VA MEJORANDO (REDUCIENDO) LA CIFRA DE CO2 ¿???


  // Realizar el cruce y la mutación para generar la nueva población
  var nuevaPoblacion = [];
  while (nuevaPoblacion.length < tamanoPoblacion) {
    // Seleccionar dos cromosomas padres aleatorios
    var padre1 = mejoresCromosomas[Math.floor(Math.random() * mejoresCromosomas.length)];
    var padre2 = mejoresCromosomas[Math.floor(Math.random() * mejoresCromosomas.length)];

    // Realizar el cruce de los padres para obtener dos hijos
    var hijos = cruzarCromosomas(padre1, padre2);

    // Mutar los hijos
    var hijo1 = mutarCromosoma(hijos[0], tasaMutacion);
    var hijo2 = mutarCromosoma(hijos[1], tasaMutacion);

    // Agregar los hijos a la nueva población
    nuevaPoblacion.push(hijo1);
    nuevaPoblacion.push(hijo2);
  }

  // Reemplazar la población anterior con la nueva población
  poblacion = nuevaPoblacion;
}

// Obtener el mejor cromosoma final
var mejorCromosoma = poblacion.reduce(function (mejor, cromosoma) {
  return fitness(cromosoma) < fitness(mejor) ? cromosoma : mejor;
}, poblacion[0]);

console.log("Mejor cromosoma final:", mejorCromosoma);
console.log("Fitness del mejor cromosoma final:", fitness(mejorCromosoma));
