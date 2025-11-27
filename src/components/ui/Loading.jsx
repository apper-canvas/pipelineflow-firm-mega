import React from "react"

const Loading = ({ className = "", type = "default", ...props }) => {
  if (type === "skeleton") {
    return (
      <div className={`animate-pulse space-y-4 ${className}`} {...props}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 space-y-3">
              <div className="h-4 bg-slate-200 rounded w-2/3"></div>
              <div className="h-8 bg-slate-200 rounded w-1/2"></div>
              <div className="h-3 bg-slate-200 rounded w-full"></div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl p-6 space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-slate-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex items-center justify-center p-8 ${className}`} {...props}>
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-slate-200 dark:border-slate-700"></div>
          <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-4 border-primary-600 border-t-transparent animate-spin"></div>
        </div>
        <div className="space-y-2">
          <p className="text-slate-600 dark:text-slate-400 font-medium">Loading...</p>
          <div className="flex space-x-1 justify-center">
            <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
            <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Loading