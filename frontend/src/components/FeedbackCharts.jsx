import React, { useRef, useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

// Define web-safe colors that html2canvas can handle
const CHART_COLORS = [
  'rgba(255, 99, 132, 0.6)',   // red
  'rgba(54, 162, 235, 0.6)',   // blue
  'rgba(255, 206, 86, 0.6)',   // yellow
  'rgba(75, 192, 192, 0.6)',   // green
  'rgba(153, 102, 255, 0.6)',  // purple
  'rgba(255, 159, 64, 0.6)',   // orange
  'rgba(199, 199, 199, 0.6)',  // gray
  'rgba(83, 102, 255, 0.6)',   // indigo
  'rgba(40, 159, 64, 0.6)',    // forest green
  'rgba(210, 199, 199, 0.6)',  // light gray
];

const FeedbackCharts = ({ chartsData }) => {
  const chartRefs = useRef([]);
  const [isRendered, setIsRendered] = useState(false);

  // Ensure all chart data uses web-safe colors
  const processedChartsData = chartsData.map(chartData => {
    const datasets = chartData.chartData.datasets.map(dataset => ({
      ...dataset,
      backgroundColor: dataset.data.map((_, i) => CHART_COLORS[i % CHART_COLORS.length])
    }));

    return {
      ...chartData,
      chartData: {
        ...chartData.chartData,
        datasets
      }
    };
  });

  useEffect(() => {
    // Reset refs array when chartsData changes
    chartRefs.current = chartRefs.current.slice(0, chartsData.length * 2);
    
    // Set a flag to indicate charts are about to render
    setIsRendered(false);
    
    // Wait for charts to render
    const timer = setTimeout(() => {
      setIsRendered(true);
      console.log("Charts should be fully rendered now");
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [chartsData]);

  const getChartRef = (index) => {
    if (!chartRefs.current[index]) {
      chartRefs.current[index] = React.createRef();
    }
    return chartRefs.current[index];
  };

  // If no data is provided, show a message
  if (!chartsData || chartsData.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No feedback data available. Please upload a feedback Excel file.
      </div>
    );
  }

  const barOptions = {
    responsive: true,
    maintainAspectRatio: true,
    animation: {
      duration: 0 // Disable animations for better capture
    },
    devicePixelRatio: 3, // Add higher pixel ratio for better quality
    layout: {
      padding: {
        top: 10,
        right: 20,
        bottom: 20,
        left: 20
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        font: {
          size: 16,
          family: 'Arial, sans-serif', // Use web-safe font
          weight: 'bold'
        },
        color: '#333333', // Use web-safe color
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          color: '#333333', // Use web-safe color
          font: {
            family: 'Arial, sans-serif', // Use web-safe font
            size: 12
          }
        },
        grid: {
          color: '#dddddd', // Use web-safe color
        }
      },
      x: {
        ticks: {
          color: '#333333', // Use web-safe color
          font: {
            family: 'Arial, sans-serif', // Use web-safe font
            size: 12
          }
        },
        grid: {
          color: '#dddddd', // Use web-safe color
        }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: true,
    animation: {
      duration: 0 // Disable animations for better capture
    },
    devicePixelRatio: 3, // Add higher pixel ratio for better quality
    layout: {
      padding: {
        top: 10,
        right: 20,
        bottom: 20,
        left: 20
      }
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#333333', // Use web-safe color
          font: {
            family: 'Arial, sans-serif', // Use web-safe font
            size: 12
          },
          boxWidth: 15,
          padding: 15
        }
      },
      title: {
        display: true,
        font: {
          size: 16,
          family: 'Arial, sans-serif', // Use web-safe font
          weight: 'bold'
        },
        color: '#333333', // Use web-safe color
      },
    }
  };

  return (
    <div className="my-6" id="chart-container" style={{ backgroundColor: 'white', padding: '12px', minHeight: '500px' }}>
      <h3 className="text-lg font-semibold mb-3 text-gray-800" style={{ color: '#333333', fontFamily: 'Arial, sans-serif' }}>
        Feedback Analysis
      </h3>
      
      <div className="grid grid-cols-1 gap-8">
        {processedChartsData.map((chartData, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow-sm" id={`chart-item-${index}`} style={{ backgroundColor: '#ffffff', border: '1px solid #eaeaea', marginBottom: '20px' }}>
            <h4 className="text-md font-medium mb-2 text-center" style={{ color: '#333333', fontFamily: 'Arial, sans-serif' }}>
              {chartData.question}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div id={`bar-chart-container-${index}`} style={{ height: '220px' }}>
                <p className="text-sm text-center font-medium mb-1" style={{ color: '#333333', fontFamily: 'Arial, sans-serif' }}>Response Distribution</p>
                <Bar 
                  id={`bar-chart-${index}`}
                  key={`bar-${index}-${isRendered}`}
                  ref={getChartRef(index * 2)} 
                  data={chartData.chartData} 
                  options={{
                    ...barOptions,
                    maintainAspectRatio: true,
                    responsive: true,
                    plugins: {
                      ...barOptions.plugins,
                      title: {
                        ...barOptions.plugins.title,
                        display: false
                      }
                    }
                  }}
                />
              </div>
              
              <div id={`pie-chart-container-${index}`} style={{ height: '220px' }}>
                <p className="text-sm text-center font-medium mb-1" style={{ color: '#333333', fontFamily: 'Arial, sans-serif' }}>Percentage Breakdown</p>
                <Pie 
                  id={`pie-chart-${index}`}
                  key={`pie-${index}-${isRendered}`}
                  ref={getChartRef(index * 2 + 1)} 
                  data={chartData.chartData} 
                  options={{
                    ...pieOptions,
                    maintainAspectRatio: true,
                    responsive: true,
                    plugins: {
                      ...pieOptions.plugins,
                      legend: {
                        ...pieOptions.plugins.legend,
                        position: 'right',
                        labels: {
                          ...pieOptions.plugins.legend.labels,
                          boxWidth: 10,
                          padding: 5,
                          font: {
                            ...pieOptions.plugins.legend.labels.font,
                            size: 10
                          }
                        }
                      },
                      title: {
                        ...pieOptions.plugins.title,
                        display: false
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeedbackCharts; 