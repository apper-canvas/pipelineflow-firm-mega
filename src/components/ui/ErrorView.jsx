import React from "react"
import ApperIcon from "@/components/ApperIcon"

const ErrorView = ({ 
  title = "Something went wrong", 
  message = "We encountered an error while loading the data.", 
  onRetry,
  className = "",
  ...props 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center space-y-6 ${className}`} {...props}>
      <div className="relative">
        <div className="h-20 w-20 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
          <ApperIcon name="AlertTriangle" className="h-10 w-10 text-red-600 dark:text-red-400" />
        </div>
        <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-red-500 flex items-center justify-center">
          <ApperIcon name="X" className="h-3 w-3 text-white" />
        </div>
      </div>
      
      <div className="space-y-2 max-w-md">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
        <p className="text-slate-600 dark:text-slate-400">{message}</p>
      </div>

      {onRetry && (
        <div className="space-y-3">
          <button
            onClick={onRetry}
            className="btn-primary flex items-center space-x-2"
          >
            <ApperIcon name="RotateCcw" className="h-4 w-4" />
            <span>Try Again</span>
          </button>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            If the problem persists, please contact support
          </p>
        </div>
      )}
    </div>
  )
}

export default ErrorView