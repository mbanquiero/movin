// Definir la función de fitness
function fitness(individual) {
    // En este ejemplo, la función de fitness simplemente suma los valores de los genes
    return individual.reduce((a, b) => a + b, 0);
  }
  
  // Definir la población inicial
  function createPopulation(populationSize, individualLength) {
    const population = [];
    for (let i = 0; i < populationSize; i++) {
      const individual = [];
      for (let j = 0; j < individualLength; j++) {
        individual.push(Math.round(Math.random()));
      }
      population.push(individual);
    }
    return population;
  }
  
  // Definir la función de selección
  function selectParents(population) {
    // En este ejemplo, la selección es aleatoria
    const parent1 = population[Math.floor(Math.random() * population.length)];
    const parent2 = population[Math.floor(Math.random() * population.length)];
    return [parent1, parent2];
  }
  
  // Definir la función de cruce
  function crossover(parent1, parent2) {
    const child = [];
    for (let i = 0; i < parent1.length; i++) {
      if (Math.random() < 0.5) {
        child.push(parent1[i]);
      } else {
        child.push(parent2[i]);
      }
    }
    return child;
  }
  
  // Definir la función de mutación
  function mutate(individual, mutationRate) {
    for (let i = 0; i < individual.length; i++) {
      if (Math.random() < mutationRate) {
        individual[i] = 1 - individual[i];
      }
    }
    return individual;
  }
  
  // Definir la función principal del algoritmo genético
  function geneticAlgorithm(populationSize, individualLength, mutationRate, generations) {
    let population = createPopulation(populationSize, individualLength);
    for (let i = 0; i < generations; i++) {
      const newPopulation = [];
      for (let j = 0; j < populationSize; j++) {
        const [parent1, parent2] = selectParents(population);
        const child = crossover(parent1, parent2);
        const mutatedChild = mutate(child, mutationRate);
        newPopulation.push(mutatedChild);
      }
      population = newPopulation;
    }
    const bestIndividual = population.reduce((best, current) => {
      return fitness(current) > fitness(best) ? current : best;
    }, population[0]);
    return bestIndividual;
  }
  
  // Ejemplo de uso del algoritmo genético
  const populationSize = 100;
  const individualLength = 10;
  const mutationRate = 0.01;
  const generations = 100;
  const bestIndividual = geneticAlgorithm(populationSize, individualLength, mutationRate, generations);
  console.log(bestIndividual);
  console.log("PROCESO TERMINADO")
  