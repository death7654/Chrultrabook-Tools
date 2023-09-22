import Chart from 'chart.js/auto'

(async function() {

  new Chart(
    document.getElementById('fancurves'),
    {
      type: 'line',
      options:{
        scales: {
          y: {
            title: {
              display:true,
              text: 'Fan Speed in Percentage'
            }
          },
          x: {
            title: {
              display:true,
              text:'CPU Temperature in Celsius'
            }
          }
        }
      },
      data: {
        labels:[0, 30, 35, 40, 45, 50, 55, 60, 65, 70],
        datasets: [
          {
            label: 'Fan Curves',
            data: [0, 10, 20, 30, 40, 50, 60, 100, 100, 100],
          }
        ]
      },
    }
  );
})();
 