import React, { useState, useEffect } from "react"
import Chart from "react-apexcharts"
import StatCard from "@/components/molecules/StatCard"
import Loading from "@/components/ui/Loading"
import ErrorView from "@/components/ui/ErrorView"
import ApperIcon from "@/components/ApperIcon"
import Badge from "@/components/atoms/Badge"
import { analyticsService } from "@/services/api/analyticsService"

const Analytics = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
const [selectedPeriod, setSelectedPeriod] = useState("30d")
  const [selectedMetric, setSelectedMetric] = useState("revenue")

  useEffect(() => {
    loadAnalytics()
  }, [selectedPeriod])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      setError("")
      const analytics = await analyticsService.getAnalytics(selectedPeriod)
      setData(analytics)
    } catch (err) {
      setError("Failed to load analytics data")
    } finally {
      setLoading(false)
    }
  }

  const getChartOptions = (type, title) => ({
    chart: {
      type: type,
      height: 350,
      toolbar: { show: false },
      background: 'transparent'
    },
    theme: {
      mode: 'light'
    },
    title: {
      text: title,
      style: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#1e293b'
      }
    },
    colors: ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
    stroke: {
      curve: 'smooth',
      width: 3
    },
    grid: {
      borderColor: '#e2e8f0',
      strokeDashArray: 4
    },
    xaxis: {
      categories: data?.chartData?.categories || [],
      labels: {
        style: {
          colors: '#64748b',
          fontSize: '12px'
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: '#64748b',
          fontSize: '12px'
        },
        formatter: (value) => {
if (selectedMetric === 'revenue') {
            return '$' + value.toLocaleString()
          }
          if (selectedMetric === 'winrate') {
            return value.toFixed(1) + '%'
          }
          return value.toLocaleString()
        }
      }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      labels: {
        colors: '#64748b'
      }
    },
    responsive: [{
      breakpoint: 768,
      options: {
        chart: {
          height: 300
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
  })

const getPipelineChartOptions = () => ({
    chart: {
      type: 'donut',
      height: 350
    },
    labels: data?.pipelineData?.labels || [],
    colors: ['#3b82f6', '#f59e0b', '#8b5cf6', '#f97316', '#10b981', '#ef4444'],
    legend: {
      position: 'bottom',
      labels: {
        colors: '#64748b'
      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total Value',
              formatter: (w) => {
                const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0)
                return '$' + total.toLocaleString()
              }
            }
          }
        }
      }
    },
    responsive: [{
      breakpoint: 768,
      options: {
        chart: {
          height: 300
        }
      }
    }]
  })

  const getWinLossChartOptions = () => ({
    chart: {
      type: 'donut',
      height: 350
    },
    labels: data?.winLossData?.winLossChart?.labels || ['Won Deals', 'Lost Deals'],
    colors: ['#10b981', '#ef4444'],
    legend: {
      position: 'bottom',
      labels: {
        colors: '#64748b'
      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Win Rate',
              formatter: () => {
                return data?.winLossData?.winRate ? `${data.winLossData.winRate.toFixed(1)}%` : '0%'
              }
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function(val, opts) {
        const value = opts.w.globals.series[opts.seriesIndex]
        return `${value} (${val.toFixed(1)}%)`
      }
    },
    responsive: [{
      breakpoint: 768,
      options: {
        chart: {
          height: 300
        }
      }
    }]
  })

  if (loading) return <Loading type="skeleton" />
  if (error) return <ErrorView message={error} onRetry={loadAnalytics} />
  if (!data) return <ErrorView message="No analytics data available" onRetry={loadAnalytics} />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Analytics</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Track your sales performance and team productivity.
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select 
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="input-field"
          >
<option value="revenue">Revenue</option>
            <option value="deals">Deals</option>
            <option value="contacts">Contacts</option>
            <option value="activities">Activities</option>
            <option value="winrate">Win Rate</option>
          </select>
          
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="input-field"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.stats?.map((stat) => (
          <StatCard
            key={stat.id}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            changeType={stat.changeType}
            icon={stat.icon}
          />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue/Metric Trend Chart */}
        <div className="card">
          <Chart
            options={getChartOptions('line', `${selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} Trend`)}
            series={data.chartData?.series || []}
            type="line"
            height={350}
          />
        </div>
{/* Pipeline Distribution */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Pipeline Distribution</h3>
          </div>
          <Chart
            options={getPipelineChartOptions()}
            series={data.pipelineData?.series || []}
            type="donut"
            height={350}
          />
        </div>

        {/* Win/Loss Analysis */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Win/Loss Analysis</h3>
          </div>
          {data?.winLossData ? (
            <>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {data.winLossData.wonDeals}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Won Deals</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {data.winLossData.lostDeals}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Lost Deals</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {data.winLossData.winRate.toFixed(1)}%
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Win Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {data.winLossData.conversionRate.toFixed(1)}%
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Conversion Rate</div>
                </div>
              </div>
              <Chart
                options={getWinLossChartOptions()}
                series={data.winLossData.winLossChart?.series || []}
                type="donut"
                height={300}
              />
            </>
          ) : (
            <div className="flex items-center justify-center h-64 text-slate-500 dark:text-slate-400">
              Loading win/loss data...
            </div>
          )}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performers */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Top Performers</h2>
            <ApperIcon name="Award" className="h-5 w-5 text-primary-600" />
          </div>
          <div className="space-y-3">
            {data.topPerformers?.map((performer, index) => (
              <div key={performer.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-yellow-100 text-yellow-800' :
                    index === 1 ? 'bg-slate-100 text-slate-800' :
                    index === 2 ? 'bg-amber-100 text-amber-800' :
                    'bg-slate-50 text-slate-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">{performer.name}</p>
                    <p className="text-sm text-slate-500">{performer.deals} deals</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary-600">${performer.revenue.toLocaleString()}</p>
                  <p className="text-sm text-slate-500">{performer.conversion}% conv.</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Activity Summary</h2>
            <ApperIcon name="Activity" className="h-5 w-5 text-primary-600" />
          </div>
          <div className="space-y-4">
            {data.activitySummary?.map((activity) => (
              <div key={activity.type} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                    activity.type === 'calls' ? 'bg-green-100 text-green-600' :
                    activity.type === 'emails' ? 'bg-blue-100 text-blue-600' :
                    activity.type === 'meetings' ? 'bg-purple-100 text-purple-600' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    <ApperIcon 
                      name={
                        activity.type === 'calls' ? 'Phone' :
                        activity.type === 'emails' ? 'Mail' :
                        activity.type === 'meetings' ? 'Calendar' :
                        'Activity'
                      } 
                      className="h-4 w-4" 
                    />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100 capitalize">{activity.type}</p>
                    <p className="text-sm text-slate-500">This {selectedPeriod}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{activity.count}</p>
                  <Badge variant={activity.trend === 'up' ? 'success' : activity.trend === 'down' ? 'danger' : 'default'} size="sm">
                    {activity.change}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Conversion Rates */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Conversion Rates</h2>
            <ApperIcon name="TrendingUp" className="h-5 w-5 text-primary-600" />
          </div>
          <div className="space-y-4">
            {data.conversionRates?.map((rate) => (
              <div key={rate.stage}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{rate.stage}</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{rate.percentage}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${rate.percentage}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between mt-1 text-xs text-slate-500">
                  <span>{rate.converted} converted</span>
                  <span>{rate.total} total</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Goal Progress */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Monthly Goals</h2>
          <ApperIcon name="Target" className="h-5 w-5 text-primary-600" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.goals?.map((goal) => (
            <div key={goal.metric} className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-slate-200 dark:text-slate-700"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - goal.progress / 100)}`}
                    className="text-primary-600 transition-all duration-500"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {Math.round(goal.progress)}%
                  </span>
                </div>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">{goal.metric}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {goal.current.toLocaleString()} / {goal.target.toLocaleString()}
              </p>
              <Badge 
                variant={goal.progress >= 90 ? 'success' : goal.progress >= 70 ? 'warning' : 'danger'} 
                size="sm"
                className="mt-2"
              >
                {goal.progress >= 90 ? 'On Track' : goal.progress >= 70 ? 'Behind' : 'Critical'}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Analytics