import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dashboardService } from "@/services/api/dashboardService";
import { activityService } from "@/services/api/activityService";
import { format } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import Badge from "@/components/atoms/Badge";
import StatCard from "@/components/molecules/StatCard";
import AssigneeDisplay from "@/components/molecules/AssigneeDisplay";

const Dashboard = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState([])
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError("")
      
      const [statsData, activitiesData] = await Promise.all([
        dashboardService.getStats(),
        activityService.getRecent()
      ])
      
      setStats(statsData)
      setActivities(activitiesData)
    } catch (err) {
      setError("Failed to load dashboard data")
      console.error("Dashboard loading error:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loading type="skeleton" />
  if (error) return <ErrorView message={error} onRetry={loadDashboardData} />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Welcome back! Here's what's happening with your sales pipeline.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select className="input-field bg-white dark:bg-slate-800">
            <option>Last 30 days</option>
            <option>Last 7 days</option>
            <option>Last quarter</option>
          </select>
          <button
            onClick={() => navigate("/deals")}
            className="btn-primary flex items-center space-x-2"
          >
            <ApperIcon name="Plus" className="h-4 w-4" />
            <span>New Deal</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Recent Activity</h2>
              <button 
                onClick={() => navigate("/analytics")}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                View All
              </button>
            </div>
            {activities.length === 0 ? (
              <Empty 
                icon="Activity"
                title="No recent activity"
                message="Your team activities will appear here."
                actionLabel="View Analytics"
                onAction={() => navigate("/analytics")}
              />
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.Id} className="flex items-start space-x-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      activity.type === "deal" ? "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400" :
                      activity.type === "contact" ? "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" :
                      activity.type === "task" ? "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400" :
                      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    }`}>
                      <ApperIcon 
                        name={activity.type === "deal" ? "Target" : activity.type === "contact" ? "User" : "CheckSquare"} 
                        className="h-4 w-4" 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
<div className="flex items-center justify-between">
                        <p className="text-sm text-slate-900 dark:text-slate-100">
                          <span className="font-medium">{activity.userName}</span> {activity.description}
                        </p>
                        {activity.assignedTo && (
                          <AssigneeDisplay 
                            assigneeId={activity.assignedTo} 
                            size="xs" 
                          />
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {format(new Date(activity.createdAt), "MMM d, h:mm a")}
                        </p>
                        {activity.priority && (
                          <Badge variant={activity.priority === "high" ? "danger" : "default"} size="sm">
                            {activity.priority}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          {/* Pipeline Overview */}
          <div className="card">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Pipeline Overview</h2>
            <div className="space-y-3">
              {[
                { stage: "New Leads", count: 12, color: "bg-blue-500" },
                { stage: "Qualified", count: 8, color: "bg-amber-500" },
                { stage: "Proposal", count: 5, color: "bg-purple-500" },
                { stage: "Negotiation", count: 3, color: "bg-orange-500" },
                { stage: "Closed Won", count: 15, color: "bg-green-500" }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <span className="text-sm text-slate-700 dark:text-slate-300">{item.stage}</span>
                  </div>
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{item.count}</span>
                </div>
              ))}
            </div>
            <button 
              onClick={() => navigate("/deals")}
              className="w-full mt-4 btn-secondary"
            >
              View Pipeline
            </button>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              {[
                { icon: "UserPlus", label: "Add Contact", action: () => navigate("/contacts") },
                { icon: "Target", label: "Create Deal", action: () => navigate("/deals") },
                { icon: "CheckSquare", label: "New Task", action: () => navigate("/tasks") },
                { icon: "BarChart3", label: "View Reports", action: () => navigate("/analytics") }
              ].map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200"
                >
                  <ApperIcon name={action.icon} className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard