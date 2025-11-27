import React, { forwardRef } from "react"
import { cn } from "@/utils/cn"

const Badge = forwardRef(({ 
  className, 
  variant = "default", 
  size = "md",
  children, 
  ...props 
}, ref) => {
  const baseClasses = "inline-flex items-center font-medium rounded-full whitespace-nowrap"
  
  const variants = {
    default: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
    primary: "bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-300",
    success: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
    warning: "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300",
    danger: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
    info: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
  }
  
  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm"
  }

  return (
    <span
      className={cn(baseClasses, variants[variant], sizes[size], className)}
      ref={ref}
      {...props}
    >
      {children}
    </span>
  )
})

Badge.displayName = "Badge"

export default Badge