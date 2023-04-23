function mostrarGrafico(id) {

    const ctx = document.getElementById(id);
                
    let iterac = 1;

    setInterval(() => {
        iterac += 0.5; // SERÍA CADA GENERACIÓN/ITERACIÓN DEL ALGORITMO GENÉTICO (EJE HORIZONTAL)
    }, 500);

    const data = {
        datasets: [
            {
                label: "Valor_CO2",
                data: [],
                backgroundColor: "rgba(54, 162, 235, 0.2)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1,
            }
        ]
    };
    const config = {
        type: "line",
        data: data,
        options: {
            plugins: {
                tooltip: {
                    callbacks: {
                        title(items) {
                            if (items.length) {
                                const item = items[0];
                                const { chart, datasetIndex, dataIndex } = item;
                                const iteracData = chart.data.datasets[0].data[dataIndex];
                                return 'Simutime: ' + iteracData.iterac;
                            }
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'realtime',
                    realtime: {
                        delay: 1000,
                        onRefresh: chart => {
                           
                            const now = Date.now();
                            const data = chart.data.datasets[0].data.filter(element => element.iterac);
                            let simu = iterac;
                            if (data.length) {
                                const lastData = data[data.length - 1];
                                if (lastData.iterac === simu) {
                                    simu = undefined;
                                }
                            }
                            chart.data.datasets[0].data.push({
                                x: now,
                                y: MIN_CO2, // LE DOY VALORES RANDOM DE PRUEBA (AQUÍ IRÍA: geneticAlgorithm(populationSize, individualLength, mutationRate, generations);  )
                                iterac: simu
                            });
                           
                        }
                    },
                    ticks: {
                        source: 'data',
                        callback(value, index, ticks) {
                            const tickValue = ticks[index].value;
                            if (tickValue) {
                                const dataset1Data = this.chart.data.datasets[0].data;
                                const data = dataset1Data.filter(element => element.x === tickValue);
                                if (data.length) {
                                    return data[0].iterac;
                                }
                            }
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    min: 0,
                    max: 100 // QUIZÁ HAYA QUE PONER UN VALOR MÁXIMO MÁS ALTO ( ¿ 1000 ??? )
                },
            },
        },
    };
    const myChart = new Chart(ctx, config);


}

