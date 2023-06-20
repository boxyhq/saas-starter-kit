import { useEffect, useRef } from 'react';
import { Chart, PieController, ArcElement, Tooltip, CategoryScale, Legend } from 'chart.js';

Chart.register(PieController, ArcElement, CategoryScale, Tooltip, Legend);

const PieChart = () => {
  const chartContainer = useRef(null);

  useEffect(() => {
    if (chartContainer && chartContainer.current) {
      const newChartInstance = new Chart(chartContainer.current, chartConfig);

      return () => {
        newChartInstance.destroy();
      };
    }
  }, [chartContainer]);

  const chartConfig = {
    type: 'pie',
    data: {
      labels: ['Positive', 'Negative', 'Neutral'],
      datasets: [
        {
          label: 'Sentiment',
          data: [45, 25, 30],
          backgroundColor: ['#9b59b6', '#8e44ad', '#7d3c98'],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom', // Change the position of the legend to 'bottom'
          labels: {
            padding: 10, // Add padding between the legend labels and the chart
          },
        },
        title: {
          display: true,
          text: 'Sentiment Analysis',
          font: {
            size: 16,
            weight: 'bold',
          },
          padding: 20, // Add padding above the chart title
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.label || '';
              const value = context.raw || 0;
              const percent =
                context.dataset.data.reduce((a, b) => a + b, 0) === 0
                  ? 0
                  : (value * 100) / context.dataset.data.reduce((a, b) => a + b, 0);
              return `${label}: ${percent.toFixed(1)}%`;
            },
          },
        },
      },
      layout: {
        padding: {
          top: 20,
          bottom: 20, // Add padding above the chart
        },
      },
      elements: {
        arc: {
          borderRadius: 10,
        },
      },
    },
  };

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '15px', marginTop: '20px' }}>
      <h2 className="text-xl font-bold text-navy-700 dark:text-white mt-4 mb-2" style={{ textAlign: 'center' }}>Sentiment Analysis</h2> {/* Add chart title with the specified styling */}
      <canvas ref={chartContainer} style={{ marginBottom: '15px' }} /> {/* Add margin bottom to the chart */}
    </div>
  );
};

export default PieChart;
