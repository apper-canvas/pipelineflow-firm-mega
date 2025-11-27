import React, { useState, useRef, useEffect } from "react"
import ApperIcon from "@/components/ApperIcon"
import { useTheme } from "@/hooks/useTheme"

const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const menuItems = [
    { icon: "User", label: "Profile", action: () => console.log("Profile clicked") },
    { icon: "Settings", label: "Settings", action: () => console.log("Settings clicked") },
    { icon: theme === "dark" ? "Sun" : "Moon", label: `${theme === "dark" ? "Light" : "Dark"} Mode`, action: toggleTheme },
    { icon: "HelpCircle", label: "Help & Support", action: () => console.log("Help clicked") },
    { icon: "LogOut", label: "Sign Out", action: () => console.log("Logout clicked"), danger: true }
  ]

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
      >
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
          <span className="text-sm font-semibold text-white">JD</span>
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">John Doe</p>
          <p className="text-xs text-slate-600 dark:text-slate-400">Sales Manager</p>
        </div>
        <ApperIcon name="ChevronDown" className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-50 animate-scale-in">
          <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-700">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">John Doe</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">john.doe@company.com</p>
          </div>
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                item.action()
                setIsOpen(false)
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200 ${
                item.danger ? "text-red-600 dark:text-red-400" : "text-slate-700 dark:text-slate-300"
              }`}
            >
              <ApperIcon name={item.icon} className="h-4 w-4" />
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default UserMenu