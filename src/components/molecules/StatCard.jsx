import React from "react"
import ApperIcon from "@/components/ApperIcon"
import { cn } from "@/utils/cn"

const StatCard = ({ 
  title, 
  value, 
  change, 
  changeType = "neutral",
  icon, 
  className = "",
  ...props 
}) => {
  const changeColors = {
    positive: "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20",
    negative: "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20",
    neutral: "text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800"
  }

  return (
    <div className={cn("card", className)} {...props}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{value}</p>
          {change && (
            <div className="flex items-center mt-2">
              <span className={cn("px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1", changeColors[changeType])}>
                <ApperIcon 
                  name={changeType === "positive" ? "TrendingUp" : changeType === "negative" ? "TrendingDown" : "Minus"} 
                  className="h-3 w-3" 
                />
                <span>{change}</span>
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className="h-12 w-12 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
            <ApperIcon name={icon} className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
        )}
      </div>
    </div>
  )
}

export default StatCard