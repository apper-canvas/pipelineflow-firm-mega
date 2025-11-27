import React from "react"
import ApperIcon from "@/components/ApperIcon"
import UserMenu from "@/components/molecules/UserMenu"
import SearchBar from "@/components/molecules/SearchBar"

const Header = ({ onMobileMenuToggle, sidebarCollapsed }) => {
  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 h-16 flex items-center justify-between px-4 lg:px-6">
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        {/* Mobile menu button */}
        <button
          onClick={onMobileMenuToggle}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200 lg:hidden"
        >
          <ApperIcon name="Menu" className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        </button>

        {/* Search Bar */}
        <div className="hidden md:block">
          <SearchBar
            placeholder="Search contacts, deals, tasks..."
            className="w-80"
            onSearch={(term) => console.log("Search:", term)}
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-4">
        {/* Mobile search button */}
        <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200 md:hidden">
          <ApperIcon name="Search" className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200">
            <ApperIcon name="Bell" className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-white">3</span>
            </span>
          </button>
        </div>

        {/* Quick Actions */}
        <button className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200">
          <ApperIcon name="Plus" className="h-4 w-4" />
          <span className="text-sm font-medium">New Deal</span>
        </button>

        {/* User Menu */}
        <UserMenu />
      </div>
    </header>
  )
}

export default Header