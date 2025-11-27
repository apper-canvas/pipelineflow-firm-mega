import React, { forwardRef } from "react"
import { cn } from "@/utils/cn"

const Button = forwardRef(({ 
  className, 
  variant = "primary", 
  size = "md", 
  children, 
  disabled,
  ...props 
}, ref) => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
  
  const variants = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500",
    secondary: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-primary-500 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700",
    ghost: "text-slate-600 hover:bg-slate-100 focus:ring-primary-500 dark:text-slate-400 dark:hover:bg-slate-800",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500"
  }
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  }

  return (
    <button
      className={cn(baseClasses, variants[variant], sizes[size], className)}
      ref={ref}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
})

Button.displayName = "Button"

export default Button