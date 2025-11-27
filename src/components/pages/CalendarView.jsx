import React, { useState, useEffect } from "react"
import { toast } from "react-toastify"
import Loading from "@/components/ui/Loading"
import ErrorView from "@/components/ui/ErrorView"
import Empty from "@/components/ui/Empty"
import ApperIcon from "@/components/ApperIcon"
import Badge from "@/components/atoms/Badge"
import Button from "@/components/atoms/Button"
import { taskService } from "@/services/api/taskService"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths, getDay } from "date-fns"

export default function CalendarView() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTasks, setSelectedTasks] = useState([])

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await taskService.getAll()
      setTasks(response)
    } catch (err) {
      setError("Failed to load tasks. Please try again.")
      console.error("Error loading tasks:", err)
    } finally {
      setLoading(false)
    }
  }

  const navigateMonth = (direction) => {
    setCurrentDate(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1))
  }

  const getTasksForDate = (date) => {
    return tasks.filter(task => 
      task.dueDate && isSameDay(new Date(task.dueDate), date)
    )
  }

  const handleDateClick = (date, dateTasks) => {
    setSelectedDate(date)
    setSelectedTasks(dateTasks)
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent": return "destructive"
      case "high": return "warning"
      case "medium": return "secondary"
      case "low": return "outline"
      default: return "secondary"
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "success"
      case "in-progress": return "warning"
      case "not-started": return "secondary"
      case "cancelled": return "destructive"
      default: return "secondary"
    }
  }

  const renderCalendarHeader = () => {
    const monthStart = startOfMonth(currentDate)
    
    return (
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {format(currentDate, "MMMM yyyy")}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Calendar view of your tasks and deadlines
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('prev')}
            className="flex items-center space-x-1"
          >
            <ApperIcon name="ChevronLeft" className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
            className="px-4"
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('next')}
            className="flex items-center space-x-1"
          >
            <ApperIcon name="ChevronRight" className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  const renderCalendarGrid = () => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd })
    
    // Add previous month days to complete the week
    const startDay = getDay(monthStart)
    const prevMonthDays = []
    for (let i = startDay - 1; i >= 0; i--) {
      const prevDay = new Date(monthStart)
      prevDay.setDate(prevDay.getDate() - (i + 1))
      prevMonthDays.push(prevDay)
    }
    
    // Add next month days to complete the week
    const endDay = getDay(monthEnd)
    const nextMonthDays = []
    for (let i = 1; i <= (6 - endDay); i++) {
      const nextDay = new Date(monthEnd)
      nextDay.setDate(nextDay.getDate() + i)
      nextMonthDays.push(nextDay)
    }
    
    const allDays = [...prevMonthDays, ...calendarDays, ...nextMonthDays]

    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        {/* Week day headers */}
        <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-4 text-center">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {day}
              </span>
            </div>
          ))}
        </div>
        
        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {allDays.map((date, index) => {
            const dateTasks = getTasksForDate(date)
            const isCurrentMonth = isSameMonth(date, currentDate)
            const isCurrentDay = isToday(date)
            const hasTasksDue = dateTasks.length > 0
            
            return (
              <div
                key={index}
                onClick={() => dateTasks.length > 0 && handleDateClick(date, dateTasks)}
                className={`
                  min-h-[120px] p-2 border-r border-b border-slate-100 dark:border-slate-700
                  ${!isCurrentMonth ? 'bg-slate-50 dark:bg-slate-900' : ''}
                  ${hasTasksDue ? 'cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20' : ''}
                  ${isCurrentDay ? 'bg-blue-100 dark:bg-blue-900/30' : ''}
                  transition-colors duration-200
                `}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`
                    text-sm font-medium
                    ${!isCurrentMonth ? 'text-slate-400' : 'text-slate-900 dark:text-slate-100'}
                    ${isCurrentDay ? 'text-blue-600 font-bold' : ''}
                  `}>
                    {format(date, 'd')}
                  </span>
                  {hasTasksDue && (
                    <div className="flex items-center space-x-1">
                      <div className={`
                        w-2 h-2 rounded-full
                        ${dateTasks.some(t => t.status !== 'completed') ? 'bg-red-500' : 'bg-green-500'}
                      `} />
                      <span className="text-xs text-slate-500">
                        {dateTasks.length}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Task previews */}
                <div className="space-y-1">
                  {dateTasks.slice(0, 3).map(task => (
                    <div
                      key={task.Id}
                      className={`
                        text-xs p-1 rounded truncate
                        ${task.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          task.priority === 'urgent' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                          task.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                          'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'}
                      `}
                      title={task.title}
                    >
                      {task.title}
                    </div>
                  ))}
                  {dateTasks.length > 3 && (
                    <div className="text-xs text-slate-500 text-center">
                      +{dateTasks.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderTaskDetails = () => {
    if (!selectedDate || selectedTasks.length === 0) return null

    return (
      <div className="mt-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Tasks for {format(selectedDate, "MMMM d, yyyy")}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedDate(null)}
          >
            <ApperIcon name="X" className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-3">
          {selectedTasks.map(task => (
            <div key={task.Id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <div className="flex-1">
                <h4 className={`font-medium ${
                  task.status === 'completed' 
                    ? 'text-slate-500 line-through' 
                    : 'text-slate-900 dark:text-slate-100'
                }`}>
                  {task.title}
                </h4>
                {task.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {task.description}
                  </p>
                )}
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant={getPriorityColor(task.priority)} size="sm">
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </Badge>
                  <Badge variant={getStatusColor(task.status)} size="sm">
                    {task.status.replace("-", " ").charAt(0).toUpperCase() + task.status.replace("-", " ").slice(1)}
                  </Badge>
                  {task.category && (
                    <Badge variant="outline" size="sm">
                      {task.category.charAt(0).toUpperCase() + task.category.slice(1)}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (loading) {
    return <Loading />
  }

  if (error) {
    return (
      <ErrorView 
        message={error}
        onRetry={loadTasks}
      />
    )
  }

  return (
    <div className="space-y-6">
      {renderCalendarHeader()}
      
      {tasks.length === 0 ? (
        <Empty 
          icon="Calendar"
          title="No tasks scheduled"
          message="Create your first task to see it on the calendar."
          actionLabel="Go to Tasks"
          onAction={() => window.location.href = '/tasks'}
        />
      ) : (
        <>
          {renderCalendarGrid()}
          {renderTaskDetails()}
        </>
      )}
    </div>
  )
}