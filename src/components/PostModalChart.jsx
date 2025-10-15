import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import annotationPlugin from 'chartjs-plugin-annotation';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import VerifiedBadge from './VerifiedBadge';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin,
  ChartDataLabels
);

export default function PostModalChart({ form }) {
  const [chartData, setChartData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [isMobile, setIsMobile] = React.useState(false);
  const [isDark, setIsDark] = React.useState(false);

  // Detect dark mode
  React.useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  // Detect mobile screen size
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  React.useEffect(() => {
    const fetchSalarySummary = async () => {
      setLoading(true);
      setError('');
      
      try {
        const response = await fetch('https://tsalin-ai.onrender.com/api/salary-posts/summary', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            industry_id: form.industryId || '68edff1df30719918c3325df',
            position_id: form.positionId || undefined,
            salary: form.salary ? parseInt(form.salary.replace(/[^0-9]/g, '')) : undefined,
            experience_year: parseInt(form.years) || 4,
            pro_levels: parseInt(form.proLevelLevel) || 5
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        console.log('Chart data received:', data);
        setChartData(data);
      } catch (err) {
        console.error('Chart error:', err);
        setError(err.message || 'Алдаа гарлаа');
        setChartData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSalarySummary();
  }, []);

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('mn-MN').format(num);
  };

  const formatAxisLabel = (value) => {
    return new Intl.NumberFormat('mn-MN').format(value);
  };

  if (loading) {
    return (
      <div className="w-full">
        <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Цалингийн харьцуулалт
        </h4>
        <div className="flex items-center justify-center py-8">
          <div className="text-slate-500 dark:text-slate-400">Уншиж байна...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Цалингийн харьцуулалт
        </h4>
        <div className="text-red-500 text-sm p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          Алдаа: {error}
        </div>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="w-full">
        <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Цалингийн харьцуулалт
        </h4>
        <div className="text-slate-500 dark:text-slate-400 text-sm">
          Мэдээлэл байхгүй байна
        </div>
      </div>
    );
  }

  // Prepare salary posts for bar chart - use ALL posts including synthetic
  const salaryPosts = chartData.salaryPosts || [];
  
  if (salaryPosts.length === 0) {
    return (
      <div className="w-full">
        <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Цалингийн харьцуулалт
        </h4>
        <div className="text-slate-500 dark:text-slate-400 text-sm">
          Мэдээлэл байхгүй байна
        </div>
      </div>
    );
  }
  
  // Prepare Chart.js data
  const sortedData = salaryPosts
    .map((post, idx) => ({
      salary: post.salary,
      isUser: post.isUser || false,
      isVerified: post.is_verified || false,
      label: post.isUser ? 'Та энд байна 👇' : 
             (post.position_id?.name_en || `${formatCurrency(post.salary)}₮`) + 
             (post.is_verified ? ' ✅' : '')
    }))
    .sort((a, b) => a.salary - b.salary);

  const chartData_chartjs = {
    labels: sortedData.map(item => item.label),
    datasets: [
      {
        label: 'Цалин',
        data: sortedData.map(item => item.salary),
        backgroundColor: sortedData.map(item => 
          item.isUser ? '#dc2626' : '#2563eb' // Red for user, blue for others
        ),
        borderColor: sortedData.map(item => 
          item.isUser ? '#dc2626' : '#2563eb'
        ),
        borderRadius: 5,
        borderSkipped: false,
        barThickness: isMobile ? 5 : 15,
        maxBarThickness: isMobile ? 12 : 20,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Цалин: ${formatCurrency(context.parsed.y)}₮`;
          }
        }
      },
      datalabels: {
        display: function(context) {
          const dataIndex = context.dataIndex;
          const item = sortedData[dataIndex];
          return item.isUser; // Only show label for user's salary
        },
        color: isDark ? 'white' : 'black',
        font: {
          size: 10,
          weight: 'bold'
        },
        formatter: function(value) {
          return 'ТА ЭНД БАЙНА';
        },
        anchor: 'end',
        align: 'top',
        offset: 4,
        padding: 20
      },
      annotation: {
        annotations: {
          averageLine: {
            type: 'line',
            yMin: chartData.industryAvgSalary,
            yMax: chartData.industryAvgSalary,
            borderColor: '#dc2626',
            borderWidth: 2,
            borderDash: [5, 5],
            label: {
              content: `Дундаж цалин: ${formatCurrency(chartData.industryAvgSalary)}₮`,
              enabled: true,
              position: 'end',
              color: '#dc2626',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              font: {
                size: 12,
                weight: 'bold'
              },
              padding: 4
            }
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return formatAxisLabel(value);
          }
        }
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 0
        }
      }
    },
  };

  return (
    <div className="w-full">
     
      
      {/* Summary Stats */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <div className="text-xs text-slate-500 dark:text-slate-400">Нийт тоо</div>
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {chartData.totalCount}
          </div>
        </div>
        <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <div className="text-xs text-slate-500 dark:text-slate-400">Таны түвшин</div>
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {chartData.userLevel}
          </div>
        </div>
        <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <div className="text-xs text-slate-500 dark:text-slate-400">Салбарын дундаж цалин</div>
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {formatCurrency(chartData.industryAvgSalary)}₮
          </div>
        </div>
      </div> */}

      {/* Salary Breakdown with Pie Chart */}
      <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
        Цалингийн задаргаа
      </h4>
      <div className="mb-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Breakdown Table */}
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-white dark:bg-slate-800 rounded-lg">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Үндсэн цалин</span>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {formatCurrency(parseInt(form.salary?.replace(/[^0-9]/g, '') || 0))}₮
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <span className="text-sm font-medium text-red-700 dark:text-red-400">НДШ (11.5%)</span>
              <span className="text-sm font-bold text-red-900 dark:text-red-300">
                -{formatCurrency(Math.round(parseInt(form.salary?.replace(/[^0-9]/g, '') || 0) * 0.115))}₮
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <span className="text-sm font-medium text-red-700 dark:text-red-400">Хувь хүний орлогын татвар (10%)</span>
              <span className="text-sm font-bold text-red-900 dark:text-red-300">
                -{formatCurrency(Math.round(parseInt(form.salary?.replace(/[^0-9]/g, '') || 0) * 0.10))}₮
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-500">
              <span className="text-sm font-bold text-green-700 dark:text-green-400">Гарт олгох цалин</span>
              <span className="text-base font-bold text-green-900 dark:text-green-300">
                {formatCurrency(Math.round(parseInt(form.salary?.replace(/[^0-9]/g, '') || 0) * 0.785))}₮
              </span>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="flex items-center justify-center">
            <div className="w-64 h-64">
              <Doughnut
                data={{
                  labels: ['Гарт олгох', 'НДШ (11.5%)', 'ХХОАТ (10%)'],
                  datasets: [{
                    data: [
                      Math.round(parseInt(form.salary?.replace(/[^0-9]/g, '') || 0) * 0.785),
                      Math.round(parseInt(form.salary?.replace(/[^0-9]/g, '') || 0) * 0.115),
                      Math.round(parseInt(form.salary?.replace(/[^0-9]/g, '') || 0) * 0.10)
                    ],
                    backgroundColor: [
                      'rgb(34, 197, 94)', // green
                      'rgb(239, 68, 68)', // red
                      'rgb(251, 146, 60)', // orange
                    ],
                    borderColor: [
                      'rgb(22, 163, 74)',
                      'rgb(220, 38, 38)',
                      'rgb(234, 88, 12)',
                    ],
                    borderWidth: 2,
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        color: 'rgb(100, 116, 139)',
                        font: {
                          size: 11,
                        },
                        padding: 10,
                      }
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          const label = context.label || '';
                          const value = context.parsed;
                          const total = context.dataset.data.reduce((a, b) => a + b, 0);
                          const percentage = ((value / total) * 100).toFixed(1);
                          return `${label}: ${formatCurrency(value)}₮ (${percentage}%)`;
                        }
                      }
                    },
                    datalabels: {
                      color: '#fff',
                      font: {
                        weight: 'bold',
                        size: 12,
                      },
                      formatter: (value, context) => {
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(0);
                        return `${percentage}%`;
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Salary Period Breakdown - Compact */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="text-center p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Жилийн цалин</div>
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {formatCurrency(Math.round(parseInt(form.salary?.replace(/[^0-9]/g, '') || 0) * 0.785 * 12))}₮
            </div>
          </div>
          <div className="text-center p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Сарын цалин</div>
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {formatCurrency(Math.round(parseInt(form.salary?.replace(/[^0-9]/g, '') || 0) * 0.785))}₮
            </div>
          </div>
          <div className="text-center p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">7 хоногийн цалин</div>
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {formatCurrency(Math.round(parseInt(form.salary?.replace(/[^0-9]/g, '') || 0) * 0.785 / 4.33))}₮
            </div>
          </div>
          <div className="text-center p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Өдрийн цалин</div>
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {formatCurrency(Math.round(parseInt(form.salary?.replace(/[^0-9]/g, '') || 0) * 0.785 / 30.44))}₮
            </div>
          </div>
        </div>
      </div>
       <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
         Цалингийн харьцуулалт
       </h4>
      {/* Chart.js Bar Chart */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
        {/* Legend */}
        <div className="flex gap-4 mb-4 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex gap-4 flex-wrap">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-red-600" />
              <span>Таны цалин</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-blue-600" />
              <span>Бусад</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-8 border-t-2 border-dashed border-red-600" />
              <span>Дундаж цалин: {formatCurrency(chartData.industryAvgSalary)}₮</span>
            </div>
          </div>
        </div>

        <div style={{ height: '600px', width: '100%' }}>
          <Bar data={chartData_chartjs} options={options} />
        </div>
      </div>
      
      {/* Salary Ranges */}
      {/* <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
        <h5 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
          Цалингийн түвшин
        </h5>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Junior:</span>
            <span className="font-medium">{formatCurrency(chartData.industrySalaryRanges.junior)}₮</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Mid:</span>
            <span className="font-medium">{formatCurrency(chartData.industrySalaryRanges.mid)}₮</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Senior:</span>
            <span className="font-medium">{formatCurrency(chartData.industrySalaryRanges.senior)}₮</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Дундаж:</span>
            <span className="font-medium">{formatCurrency(chartData.industrySalaryRanges.average)}₮</span>
          </div>
        </div>
      </div> */}
    </div>
  );
}
