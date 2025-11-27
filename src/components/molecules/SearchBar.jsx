import React, { useState } from "react"
import ApperIcon from "@/components/ApperIcon"
import Input from "@/components/atoms/Input"

const SearchBar = ({ 
  onSearch, 
  placeholder = "Search...", 
  className = "",
  debounceMs = 300,
  ...props 
}) => {
  const [searchTerm, setSearchTerm] = useState("")

  React.useEffect(() => {
    const timer = setTimeout(() => {
      onSearch?.(searchTerm)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [searchTerm, onSearch, debounceMs])

  return (
    <div className={`relative ${className}`} {...props}>
      <ApperIcon 
        name="Search" 
        className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" 
      />
      <Input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10 pr-4"
      />
      {searchTerm && (
        <button
          onClick={() => setSearchTerm("")}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full transition-colors duration-200"
        >
          <ApperIcon name="X" className="h-3 w-3 text-slate-400" />
        </button>
      )}
    </div>
  )
}

export default SearchBar