import { Bar } from "react-chartjs-2";
import { Chart } from 'chart.js/auto';

const BarGraph = (labels, data) => {
    return (
        <div style={{ maxWidth: "650px", color: 'white' }}>
                <Bar
                    data={{labels: labels,
                      // datasets is an array of objects where each object represents a set of data to display corresponding to the labels above. for brevity, we'll keep it at one object
                      datasets: [
                          {
                            label: 'Count',
                            data: data,
                            // you can set indiviual colors for each bar
                            backgroundColor: [
                              'rgba(255, 215, 0, 1)',
                              'rgba(192, 192, 192, 1)',
                              'rgba(160, 160, 160, 1)',
                              'rgba(128, 128, 128, 1)',
                            ],
                            borderWidth: 1,
                          }
                      ]}}
                    // Height of graph
                    options={{
                      
                      plugins: {
                        title: {
                          display: true,
                          text: 'Placements',
                          color: 'white',
                          font: {
                            size: 20,
                            weight: 'bold',
                          }
                        },
                        legend: {
                          display: false,
                        },
                        datalabels: {
                          anchor: 'end',
                          align: 'end',
                          color: 'white',
                          font: {
                            weight: 'bold',
                          },
                          formatter: function (value) {
                            return value;
                          },
                        },
                        scales: {
                          x: {
                            ticks: {
                              color: 'white',
                            },
                          },
                          y: {
                            tick: {
                              color: 'white',
                            },
                          }
                        }
                      },
                    }}
                />
            </div>
    )
}

export default BarGraph;
