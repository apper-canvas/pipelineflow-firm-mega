import React from "react";
import { useAuth } from "@/layouts/Root";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import SearchBar from "@/components/molecules/SearchBar";
import UserMenu from "@/components/molecules/UserMenu";

export default function Header({ onMobileMenuToggle, sidebarCollapsed }) {
  const { logout } = useAuth();

  return (
    <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 lg:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMobileMenuToggle}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <ApperIcon name="Menu" className="w-5 h-5" />
          </button>
          
          {!sidebarCollapsed && (
            <div className="hidden md:block">
              <SearchBar placeholder="Search..." />
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <Button
            onClick={logout}
            variant="ghost"
            size="sm"
            className="text-slate-600 hover:text-slate-800"
          >
            <ApperIcon name="LogOut" className="w-4 h-4 mr-2" />
            Logout
          </Button>
          <UserMenu />
        </div>
      </div>
    </div>
)
}