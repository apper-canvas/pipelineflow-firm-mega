import React from "react"
import { useNavigate } from "react-router-dom"
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"

const NotFound = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="text-center space-y-8 max-w-md">
        {/* Animated 404 */}
        <div className="relative">
          <div className="text-8xl font-bold text-primary-600/20 dark:text-primary-400/20 select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg animate-bounce">
              <ApperIcon name="Search" className="h-12 w-12 text-white" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Page Not Found
          </h1>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            Sorry, we couldn't find the page you're looking for. The page might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => navigate("/")}
            className="flex items-center space-x-2"
          >
            <ApperIcon name="Home" className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Button>
          
          <Button 
            variant="secondary"
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2"
          >
            <ApperIcon name="ArrowLeft" className="h-4 w-4" />
            <span>Go Back</span>
          </Button>
        </div>

        {/* Helpful Links */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            You might be looking for:
          </p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <button
              onClick={() => navigate("/contacts")}
              className="flex items-center space-x-2 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200"
            >
              <ApperIcon name="Users" className="h-4 w-4 text-primary-600" />
              <span>Contacts</span>
            </button>
            
            <button
              onClick={() => navigate("/deals")}
              className="flex items-center space-x-2 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200"
            >
              <ApperIcon name="Target" className="h-4 w-4 text-primary-600" />
              <span>Deals</span>
            </button>
            
            <button
              onClick={() => navigate("/leads")}
              className="flex items-center space-x-2 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200"
            >
              <ApperIcon name="UserPlus" className="h-4 w-4 text-primary-600" />
              <span>Leads</span>
            </button>
            
            <button
              onClick={() => navigate("/tasks")}
              className="flex items-center space-x-2 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200"
            >
              <ApperIcon name="CheckSquare" className="h-4 w-4 text-primary-600" />
              <span>Tasks</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFound