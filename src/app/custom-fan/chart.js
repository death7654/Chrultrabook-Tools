  import { Chart, registerables } from 'chart.js/auto'
  import "chartjs-plugin-dragdata";
function createChart(){  
  const data = {
    //9 data in X-axis
    labels: [
      "40°C",
      "45°C",
      "50°C",
      "55°C",
      "60°C",
      "65°C",
      "70°C",
      "75°C",
      "80°C",
    ],
    datasets: [
      {
        label: "Fan Speed",
        //The 10th vaue is to keep the chart from lowering to 1
        data: [0, 10, 25, 40, 60, 80, 95, 100, 100, 100, 100],
        backgroundColor: [
          "rgba(255, 26, 104, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(255, 206, 86, 0.2)",
          "rgba(75, 192, 192, 0.2)",
          "rgba(153, 102, 255, 0.2)",
          "rgba(255, 159, 64, 0.2)",
          "rgba(0, 0, 0, 0.2)",
        ],
        borderColor: [
          "rgba(255, 26, 104, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
          "rgba(0, 0, 0, 1)",
        ],
        borderWidth: 1,
        dragData: true,
        pointHitRadius: 26,
      },
    ],
  };
  //chart config
  const config = {
    type: "line",
    data: data,
    dragData: true,
    legend: {
      display: false,
    },
    options: {
      //makes lines not so straight
      tension: 0.2,
      legend: false,
      plugins: {
        dragData: {
          round: 0,
          showTooltip: true,
          onDragStart: () => { },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Fan Speed In Percentage",
          },
        },
        x: {
          title: {
            display: true,
            text: "CPU Temperature",
          },
        },
      },
    },
  };
  const myChart = new Chart(document.getElementById("MyChart"), config);

  myChart.update();  
}
export function createChart();