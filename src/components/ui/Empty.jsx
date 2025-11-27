import React from "react"
import ApperIcon from "@/components/ApperIcon"

const Empty = ({ 
  icon = "Inbox",
  title = "No data found", 
  message = "Get started by creating your first item.",
  actionLabel = "Get Started",
  onAction,
  className = "",
  ...props 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center space-y-6 ${className}`} {...props}>
      <div className="relative">
        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 flex items-center justify-center">
          <ApperIcon name={icon} className="h-12 w-12 text-primary-600 dark:text-primary-400" />
        </div>
        <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
          <ApperIcon name="Plus" className="h-4 w-4 text-white" />
        </div>
      </div>
      
      <div className="space-y-3 max-w-md">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{message}</p>
      </div>

      {onAction && (
        <button
          onClick={onAction}
          className="btn-primary flex items-center space-x-2 px-6 py-3 text-base"
        >
          <ApperIcon name="Plus" className="h-5 w-5" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  )
}

export default Empty