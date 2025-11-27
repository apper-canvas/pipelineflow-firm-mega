import React, { useEffect } from "react"
import { NavLink } from "react-router-dom"
import ApperIcon from "@/components/ApperIcon"
import { cn } from "@/utils/cn"

const MobileSidebar = ({ isOpen, onClose }) => {
  const navigationItems = [
    { name: "Dashboard", href: "", icon: "LayoutDashboard" },
    { name: "Contacts", href: "contacts", icon: "Users" },
    { name: "Leads", href: "leads", icon: "UserPlus" },
    { name: "Deals", href: "deals", icon: "Target" },
    { name: "Tasks", href: "tasks", icon: "CheckSquare" },
    { name: "Analytics", href: "analytics", icon: "BarChart3" }
  ]

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 h-full w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 z-50 transform transition-transform duration-300 lg:hidden",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo Section */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <ApperIcon name="Zap" className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">PipelineFlow</h1>
              <p className="text-xs text-slate-600 dark:text-slate-400">CRM System</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200"
          >
            <ApperIcon name="X" className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navigationItems.map((item) => (
            <NavLink
              key={item.name}
              to={`/${item.href}`}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-primary-600 text-white shadow-md shadow-primary-600/25"
                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                )
              }
            >
              <ApperIcon name={item.icon} className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Section */}
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
      </aside>
    </>
  )
}

export default MobileSidebar