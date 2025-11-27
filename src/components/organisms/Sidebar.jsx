import React from "react"
import { NavLink } from "react-router-dom"
import ApperIcon from "@/components/ApperIcon"
import { cn } from "@/utils/cn"

const Sidebar = ({ isCollapsed = false, onToggle }) => {
const navigationItems = [
    { name: "Dashboard", href: "", icon: "LayoutDashboard" },
    { name: "Contacts", href: "contacts", icon: "Users" },
    { name: "Leads", href: "leads", icon: "UserPlus" },
    { name: "Deals", href: "deals", icon: "Target" },
    { name: "Tasks", href: "tasks", icon: "CheckSquare" },
    { name: "My Assignments", href: "my-assignments", icon: "UserCheck" },
    { name: "Analytics", href: "analytics", icon: "BarChart3" }
  ]

  return (
    <aside className={cn(
      "bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-all duration-300 flex flex-col h-full",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Logo Section */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
            <ApperIcon name="Zap" className="h-5 w-5 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">PipelineFlow</h1>
              <p className="text-xs text-slate-600 dark:text-slate-400">CRM System</p>
            </div>
          )}
        </div>
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200"
        >
          <ApperIcon name={isCollapsed ? "ChevronRight" : "ChevronLeft"} className="h-4 w-4 text-slate-600 dark:text-slate-400" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigationItems.map((item) => (
          <NavLink
            key={item.name}
            to={`/${item.href}`}
            className={({ isActive }) =>
              cn(
                "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                isActive
                  ? "bg-primary-600 text-white shadow-md shadow-primary-600/25"
                  : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700",
                isCollapsed && "justify-center"
              )
            }
          >
            <ApperIcon name={item.icon} className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && (
              <span className="font-medium">{item.name}</span>
            )}
            {isCollapsed && (
              <span className="sr-only">{item.name}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Section */}
      {!isCollapsed && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3 p-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
              <span className="text-sm font-semibold text-white">JD</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">John Doe</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 truncate">Sales Manager</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}

export default Sidebar