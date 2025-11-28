import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { taskService } from "@/services/api/taskService";
import { contactService } from "@/services/api/contactService";
import { format, isPast, isToday, isTomorrow } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Badge from "@/components/atoms/Badge";
import CommentsPanel from "@/components/molecules/CommentsPanel";
import AssigneeDisplay from "@/components/molecules/AssigneeDisplay";
import AssigneeSelector from "@/components/molecules/AssigneeSelector";
const TaskModal = ({ isOpen, task, onClose, onSave }) => {
const [formData, setFormData] = useState({
    name: "",
    tags: "",
    title: "",
    description: "",
    dueDate: "",
    priority: "medium",
    status: "not-started",
    category: "follow-up",
    assignedTo: null,
    assignmentHistory: [],
    relatedTo: "",
    relatedType: "contact",
    recurrenceType: "none",
    recurrenceInterval: 1
  })
  const [contacts, setContacts] = useState([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadContacts()
    }
  }, [isOpen])

  useEffect(() => {
if (task) {
setFormData({
        ...task,
        name: task.name || "",
        tags: task.tags || "",
        assignedTo: task.assignedTo || null,
        assignmentHistory: task.assignmentHistory || [],
        dueDate: task.dueDate ? format(new Date(task.dueDate), "yyyy-MM-dd") : ""
      })
    } else {
setFormData({
        name: "",
        tags: "",
        title: "",
        description: "",
        dueDate: "",
        priority: "medium",
        status: "not-started",
        assignedTo: null,
        category: "follow-up",
        assignmentHistory: [],
        relatedTo: "",
        relatedType: "contact",
        recurrenceType: "none",
        recurrenceInterval: 1
      })
    }
  }, [task])

  const loadContacts = async () => {
    try {
      const data = await contactService.getAll()
      setContacts(data)
    } catch (error) {
      console.error("Failed to load contacts:", error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      toast.error("Task title is required")
      return
    }

    setSaving(true)
    try {
      const savedTask = task
        ? await taskService.update(task.Id, formData)
        : await taskService.create(formData)
      
      onSave(savedTask)
      toast.success(task ? "Task updated successfully" : "Task created successfully")
      onClose()
    } catch (error) {
      toast.error("Failed to save task")
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] animate-scale-in flex">
        {/* Task Form Section */}
        <div className="w-1/2 border-r border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {task ? "Edit Task" : "New Task"}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
              <ApperIcon name="X" className="h-4 w-4" />
            </button>
          </div>

<form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[calc(90vh-80px)] overflow-y-auto">
            <Input
              label="Task Name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Task name"
              required
            />

            <Input
              label="Tags"
              value={formData.tags}
              onChange={(e) => setFormData({...formData, tags: e.target.value})}
              placeholder="Enter tags separated by commas"
            />
            
            <Input
              label="Task Title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Follow up with client"
              required
            />
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Additional details about this task..."
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Due Date"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
              />
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Priority
                </label>
                <select 
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  className="input-field"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Status
                </label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="input-field"
                >
                  <option value="not-started">Not Started</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Category
                </label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="input-field"
                >
                  <option value="follow-up">Follow-up</option>
                  <option value="proposal">Proposal</option>
                  <option value="meeting">Meeting</option>
                  <option value="email">Email</option>
                  <option value="call">Call</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Assigned To
                </label>
                <AssigneeSelector
                  value={formData.assignedTo}
                  onChange={(value) => setFormData({...formData, assignedTo: value})}
                  placeholder="Assign task to..."
                  className="flex-1"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Related To
                </label>
                <select 
                  value={formData.relatedTo}
                  onChange={(e) => setFormData({...formData, relatedTo: e.target.value})}
                  className="input-field"
                >
                  <option value="">No relation</option>
                  {contacts.map(contact => (
                    <option key={contact.Id} value={contact.Id}>
                      {contact.name} - {contact.company}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="flex-1">
                {saving ? "Saving..." : task ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </div>

        {/* Comments Section */}
        <div className="w-1/2">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Discussion
            </h3>
          </div>
          <div className="h-[calc(90vh-80px)] overflow-hidden">
            {task ? (
              <CommentsPanel taskId={task.Id} />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">
                <div className="text-center">
                  <ApperIcon name="MessageCircle" className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Save the task to start discussing</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const Tasks = () => {
  // Bulk assignment state
  const [bulkAssigneeId, setBulkAssigneeId] = useState(null)
  const [isBulkAssigning, setIsBulkAssigning] = useState(false)
  const [selectedTasks, setSelectedTasks] = useState([])

  // Handle bulk assignment
  const handleBulkAssign = async (assigneeId) => {
    if (selectedTasks.length === 0) {
      toast.error("No tasks selected for assignment")
      return
    }
    
    setIsBulkAssigning(true)
    try {
      const result = await taskService.bulkAssign(selectedTasks, assigneeId)
      
      // Refresh data (assuming there's a loadTasks function)
      // await loadTasks()
      
      // Clear selection
      setSelectedTasks([])
      setBulkAssigneeId(null)
      
      const assigneeName = assigneeId ? 'Selected assignee' : 'Unassigned'
      toast.success(`Successfully assigned ${result.updated} task${result.updated !== 1 ? 's' : ''} to ${assigneeName}`)
    } catch (error) {
      console.error("Bulk assignment error:", error)
      toast.error(error.message || "Failed to assign tasks")
    } finally {
      setIsBulkAssigning(false)
    }
  }

  // Handle task selection
  const handleTaskSelection = (taskId, checked) => {
    setSelectedTasks(prev => 
      checked 
        ? [...prev, taskId]
        : prev.filter(id => id !== taskId)
    )
  }

  // Handle select all tasks
  const handleSelectAllTasks = (checked) => {
    // This would need to be connected to the actual tasks list
    // setSelectedTasks(checked ? allTasks.map(t => t.Id) : [])
  }
  const [tasks, setTasks] = useState([])
  const [contacts, setContacts] = useState([])
const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedTask, setSelectedTask] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isViewModalOpen, setViewModalOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterPriority, setFilterPriority] = useState("all")
  const [sortBy, setSortBy] = useState("dueDate")
  useEffect(() => {
    loadTasks()
    loadContacts()
  }, [])

  const loadTasks = async () => {
    try {
      setLoading(true)
      setError("")
      const data = await taskService.getAll()
      setTasks(data)
    } catch (err) {
      setError("Failed to load tasks")
    } finally {
      setLoading(false)
    }
  }

  const loadContacts = async () => {
    try {
      const data = await contactService.getAll()
      setContacts(data)
    } catch (error) {
      console.error("Failed to load contacts:", error)
    }
  }

  const handleTaskSave = (savedTask) => {
    if (selectedTask) {
      setTasks(tasks.map(t => t.Id === savedTask.Id ? savedTask : t))
    } else {
      setTasks([savedTask, ...tasks])
    }
  }

  const handleToggleComplete = async (taskId) => {
    try {
      const task = tasks.find(t => t.Id === taskId)
      const newStatus = task.status === "completed" ? "pending" : "completed"
      const updatedTask = await taskService.update(taskId, { ...task, status: newStatus })
      setTasks(tasks.map(t => t.Id === taskId ? updatedTask : t))
      toast.success(`Task ${newStatus === "completed" ? "completed" : "reopened"}`)
    } catch (error) {
      toast.error("Failed to update task")
    }
  }

  const handleDelete = async (taskId) => {
    if (confirm("Are you sure you want to delete this task?")) {
      try {
        await taskService.delete(taskId)
        setTasks(tasks.filter(t => t.Id !== taskId))
        toast.success("Task deleted successfully")
      } catch (error) {
        toast.error("Failed to delete task")
      }
    }
}

  // Bulk assignment toolbar component
  const BulkAssignmentToolbar = () => {
    if (selectedTasks.length === 0) return null

    return (
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-primary-900">
            {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center space-x-3">
            <AssigneeSelector
              value={bulkAssigneeId}
              onChange={handleBulkAssign}
              placeholder="Assign to..."
              bulkMode={true}
              className="w-64"
            />
            <Button
              onClick={() => setSelectedTasks([])}
              variant="secondary"
              size="sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent": return "danger"
      case "high": return "warning"
      case "medium": return "info"
      case "low": return "default"
      default: return "default"
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "success"
      case "in-progress": return "info"
      case "cancelled": return "danger"
      default: return "default"
    }
  }

  const getContactName = (contactId) => {
    if (!contactId) return null
    const contact = contacts.find(c => c.Id === contactId)
    return contact ? contact.name : "Unknown Contact"
  }

  const getDateLabel = (dueDate) => {
    if (!dueDate) return null
    const date = new Date(dueDate)
    if (isToday(date)) return "Today"
    if (isTomorrow(date)) return "Tomorrow"
    if (isPast(date)) return "Overdue"
    return format(date, "MMM d")
  }

  const getDateColor = (dueDate) => {
    if (!dueDate) return "text-slate-500"
    const date = new Date(dueDate)
    if (isPast(date) && !isToday(date)) return "text-red-600"
    if (isToday(date)) return "text-amber-600"
    return "text-slate-600"
  }

  const filteredTasks = tasks.filter(task => {
    const statusMatch = filterStatus === "all" || task.status === filterStatus
    const priorityMatch = filterPriority === "all" || task.priority === filterPriority
    return statusMatch && priorityMatch
  })

const tasksByStatus = {
    "not-started": tasks.filter(t => t.status === "not-started").length,
    "in-progress": tasks.filter(t => t.status === "in-progress").length,
    completed: tasks.filter(t => t.status === "completed").length,
    cancelled: tasks.filter(t => t.status === "cancelled").length
  }

  const overdueTasks = tasks.filter(t => t.dueDate && isPast(new Date(t.dueDate)) && !isToday(new Date(t.dueDate)) && t.status !== "completed").length

  // Sort tasks
  const sortedFilteredTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case "dueDate":
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return new Date(a.dueDate) - new Date(b.dueDate)
      case "priority":
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
        return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0)
      case "title":
        return a.title.localeCompare(b.title)
      case "status":
        return a.status.localeCompare(b.status)
      default:
        return 0
    }
  })
  if (loading) return <Loading type="skeleton" />
  if (error) return <ErrorView message={error} onRetry={loadTasks} />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Tasks</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage your to-do list and track task progress.
          </p>
          {overdueTasks > 0 && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              You have {overdueTasks} overdue task{overdueTasks !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <Button 
          onClick={() => {
            setSelectedTask(null)
            setIsModalOpen(true)
          }}
          className="flex items-center space-x-2"
        >
          <ApperIcon name="Plus" className="h-4 w-4" />
          <span>Add Task</span>
        </Button>
</div>
      
      <BulkAssignmentToolbar />

      {/* Filters */}
{/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{tasksByStatus["not-started"]}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Not Started</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <ApperIcon name="Clock" className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{tasksByStatus["in-progress"]}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">In Progress</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
              <ApperIcon name="Play" className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{tasksByStatus.completed}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Completed</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <ApperIcon name="CheckCircle" className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{overdueTasks}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Overdue</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900 flex items-center justify-center">
              <ApperIcon name="AlertTriangle" className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Status:</label>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field w-auto"
          >
            <option value="all">All ({tasks.length})</option>
            <option value="not-started">Not Started ({tasksByStatus["not-started"]})</option>
            <option value="in-progress">In Progress ({tasksByStatus["in-progress"]})</option>
            <option value="completed">Completed ({tasksByStatus.completed})</option>
            <option value="cancelled">Cancelled ({tasksByStatus.cancelled})</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Priority:</label>
          <select 
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="input-field w-auto"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
{/* Bulk Assignment Progress Indicator */}
        {isBulkAssigning && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
              <div className="flex items-center space-x-3">
                <div className="animate-spin h-6 w-6 border-2 border-primary-500 border-t-transparent rounded-full"></div>
                <div>
                  <h3 className="font-medium">Assigning Tasks</h3>
                  <p className="text-sm text-gray-500">Please wait while we assign {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''}...</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Sort by:</label>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field w-auto"
          >
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
            <option value="title">Title</option>
            <option value="status">Status</option>
          </select>
        </div>
      </div>

      {/* Tasks Display */}
      {filteredTasks.length === 0 ? (
        <Empty 
          icon="CheckSquare"
          title="No tasks found"
          message={filterStatus === "all" && filterPriority === "all" ? "Create your first task to get started." : "No tasks match your current filters."}
          actionLabel="Add Task"
          onAction={() => {
            setSelectedTask(null)
            setIsModalOpen(true)
          }}
        />
      ) : (
<div className="space-y-4">
          {/* Selection Controls */}
          <div className="flex items-center space-x-2 py-2">
            <input
              type="checkbox"
              checked={selectedTasks.length > 0}
              onChange={(e) => handleSelectAllTasks(e.target.checked)}
              className="rounded border-gray-300 focus:ring-primary-500"
            />
            <label className="text-sm text-gray-600">
              Select all tasks
            </label>
          </div>
          {filteredTasks.map((task) => (
<div key={task.Id} className="card hover:shadow-md transition-all duration-200 group">
              <div className="flex items-start space-x-4">
                {/* Checkbox */}
                <button
                  onClick={() => handleToggleComplete(task.Id)}
                  className={`mt-1 h-5 w-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                    task.status === "completed"
                      ? "bg-green-500 border-green-500 text-white"
                      : "border-slate-300 hover:border-primary-500"
                  }`}
                >
                  {task.status === "completed" && (
                    <ApperIcon name="Check" className="h-3 w-3" />
                  )}
                </button>

                {/* Task Content - Clickable Area */}
                <div 
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => {
                    setSelectedTask(task);
                    setViewModalOpen(true);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className={`font-semibold ${
                        task.status === "completed" 
                          ? "text-slate-500 line-through" 
                          : "text-slate-900 dark:text-slate-100"
                      }`}>
                        {task.name || task.title}
                      </h3>

                      {task.tags && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {task.tags.split(',').map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            >
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                      {task.description && (
                        <p className={`text-sm mt-1 ${
                          task.status === "completed"
                            ? "text-slate-400"
                            : "text-slate-600 dark:text-slate-400"
                        }`}>
                          {task.description}
                        </p>
                      )}
                    </div>

                    {/* Actions - Not clickable for task details */}
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTask(task)
                          setIsModalOpen(true)
                        }}
                        className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200"
                      >
                        <ApperIcon name="Edit" className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(task.Id);
                        }}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      >
                        <ApperIcon name="Trash2" className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Task Meta */}
                  <div className="flex items-center flex-wrap gap-3 mt-3">
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

                    {task.dueDate && (
                      <div className={`flex items-center space-x-1 text-sm ${getDateColor(task.dueDate)}`}>
                        <ApperIcon name="Calendar" className="h-4 w-4" />
                        <span>{getDateLabel(task.dueDate)}</span>
                        {task.dueDate && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate)) && task.status !== "completed" && (
                          <ApperIcon name="AlertTriangle" className="h-4 w-4 text-red-500 ml-1" />
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {task.relatedTo && (
                          <div className="flex items-center space-x-1 text-sm text-slate-500">
                            <ApperIcon name="User" className="h-4 w-4" />
                            <span>{getContactName(task.relatedTo)}</span>
                          </div>
                        )}
                      </div>
                      {task.assignedTo && (
                        <AssigneeDisplay 
                          assigneeId={task.assignedTo} 
                          size="sm"
                          showName={false}
                        />
                      )}
                    </div>
                    
                    {/* System Information */}
                    <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-600">
                      <div className="grid grid-cols-2 gap-4 text-xs text-slate-500 dark:text-slate-400">
                        <div className="space-y-1">
                          {task.owner && (
                            <div className="flex items-center space-x-1">
                              <ApperIcon name="Crown" className="h-3 w-3" />
                              <span>Owner: {task.owner}</span>
                            </div>
                          )}
                          {task.createdBy && (
                            <div className="flex items-center space-x-1">
                              <ApperIcon name="UserPlus" className="h-3 w-3" />
                              <span>Created by: {task.createdBy}</span>
                            </div>
                          )}
                          {task.createdOn && (
                            <div className="flex items-center space-x-1">
                              <ApperIcon name="Calendar" className="h-3 w-3" />
                              <span>Created: {format(new Date(task.createdOn || task.createdAt), "MMM d, yyyy")}</span>
                            </div>
                          )}
                        </div>
                        <div className="space-y-1">
                          {task.modifiedBy && (
                            <div className="flex items-center space-x-1">
                              <ApperIcon name="Edit" className="h-3 w-3" />
                              <span>Modified by: {task.modifiedBy}</span>
                            </div>
                          )}
                          {task.modifiedOn && (
                            <div className="flex items-center space-x-1">
                              <ApperIcon name="Clock" className="h-3 w-3" />
                              <span>Modified: {format(new Date(task.modifiedOn || task.updatedAt), "MMM d, yyyy")}</span>
                            </div>
                          )}
                          {task.completedAt && (
                            <div className="flex items-center space-x-1 text-green-600">
                              <ApperIcon name="CheckCircle" className="h-3 w-3" />
                              <span>Completed: {format(new Date(task.completedAt), "MMM d, yyyy")}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Task Selection Checkbox */}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedTasks.includes(task.Id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleTaskSelection(task.Id, e.target.checked);
                        }}
                        className="rounded border-gray-300 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        task={selectedTask}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedTask(null)
        }}
        onSave={handleTaskSave}
      />
    </div>
  )
}

export default Tasks