import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import MobileSidebar from "@/components/organisms/MobileSidebar";
import Header from "@/components/organisms/Header";
import Sidebar from "@/components/organisms/Sidebar";

const Layout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen)
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex">
        <Sidebar isCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          onMobileMenuToggle={toggleMobileSidebar}
          sidebarCollapsed={sidebarCollapsed}
        />
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 lg:p-6 space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout