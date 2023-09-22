import Chart from 'chart.js/auto'

(async function() {
  const data = [
    { temp: 30, count: 10 },
    { temp: 35, count: 20 },
    { temp: 40, count: 15 },
    { temp: 45, count: 25 },
    { temp: 50, count: 22 },
    { temp: 55, count: 30 },
    { temp: 60, count: 28 },
    { temp: 65, count: 28 },
    { temp: 70, count: 28 },
    { temp: 75, count: 28 },
    { temp: 80, count: 28 },

  ];

  new Chart(
    document.getElementById('fancurves'),
    {
      type: 'line',
      data: {
        labels: data.map(row => row.temp),
        datasets: [
          {
            label: 'Fan Curves',
            data: data.map(row => row.count)
          }
        ]
      }
    }
  );
})();
 