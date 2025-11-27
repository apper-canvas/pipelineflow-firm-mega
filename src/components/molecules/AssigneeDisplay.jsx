import React, { useState, useEffect } from 'react'
import { teamMemberService } from '@/services/api/teamMemberService'

export default function AssigneeDisplay({ assigneeId, assignees, size = "sm", showName = false, className = "" }) {
  const [assignee, setAssignee] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
if (assigneeId || (assignees && assignees.length > 0)) {
      loadAssignee()
    } else {
      setLoading(false)
    }
  }, [assigneeId, assignees])

const loadAssignee = async () => {
    try {
      setLoading(true)
      
      // Only attempt to load if assigneeId is valid
      if (!assigneeId) {
        setAssignee(null)
        return
      }
      
      const member = await teamMemberService.getById(assigneeId)
      setAssignee(member) // member will be null if not found, which is handled gracefully
    } catch (error) {
      console.error('Error loading assignee:', error)
      setAssignee(null)
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const sizeClasses = {
    xs: "w-6 h-6 text-xs",
    sm: "w-8 h-8 text-sm", 
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base"
  }

if ((!assigneeId && (!assignees || assignees.length === 0)) || loading) {
    return null
  }

// Handle multiple assignees (future feature) or single assignee
  const displayAssignees = assignees && assignees.length > 0 ? assignees : (assignee ? [assignee] : [])
  
  if (displayAssignees.length === 0) {
    return <div className={`${sizeClasses[size]} rounded-full bg-slate-300 ${className}`} title="Unassigned"></div>
  }

  // For now, display first assignee (single assignee system)
  // In future: handle multiple assignees with overlap display
  const primaryAssignee = displayAssignees[0]
  const hasMultiple = displayAssignees.length > 1

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="relative">
        {primaryAssignee.avatar ? (
          <img 
            src={primaryAssignee.avatar} 
            alt={primaryAssignee.name}
            className={`${sizeClasses[size]} rounded-full object-cover`}
            title={hasMultiple ? `${primaryAssignee.name} +${displayAssignees.length - 1} more` : primaryAssignee.name}
          />
        ) : (
          <div 
            className={`${sizeClasses[size]} rounded-full bg-primary-500 flex items-center justify-center`}
            title={hasMultiple ? `${primaryAssignee.name} +${displayAssignees.length - 1} more` : primaryAssignee.name}
          >
            <span className="font-medium text-white text-xs">
              {getInitials(primaryAssignee.name)}
            </span>
          </div>
        )}
        {hasMultiple && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
            <span className="text-xs text-white font-bold">+</span>
          </div>
        )}
      </div>
{showName && (
        <span className="text-sm font-medium text-slate-700">
          {hasMultiple ? `${primaryAssignee.name} +${displayAssignees.length - 1}` : primaryAssignee.name}
        </span>
      )}
    </div>
  )
}