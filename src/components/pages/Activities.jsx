import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { activityService } from "@/services/api/activityService";
import { contactService } from "@/services/api/contactService";
import { dealService } from "@/services/api/dealService";
import { teamMemberService } from "@/services/api/teamMemberService";
import AssigneeSelector from "@/components/molecules/AssigneeSelector";
import AssigneeDisplay from "@/components/molecules/AssigneeDisplay";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Badge from "@/components/atoms/Badge";

export default function Activities() {
  const [activities, setActivities] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all")
const [selectedPriority, setSelectedPriority] = useState("all")
  const [selectedAssignee, setSelectedAssignee] = useState("all")
  
  // Initialize form with assignment history support
  const initialFormData = {
    title: '',
    type: 'meeting',
    status: 'scheduled',
    priority: 'medium',
    description: '',
    dueDate: '',
    assignedTo: null,
    assignmentHistory: [],
    contactId: '',
    dealId: '',
    notes: ''
  }
  const [showActivityModal, setShowActivityModal] = useState(false)
  const [editingActivity, setEditingActivity] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

const activityTypes = [
    { value: 'call', label: 'Call', icon: 'Phone', color: 'blue' },
    { value: 'email', label: 'Email', icon: 'Mail', color: 'green' },
    { value: 'meeting', label: 'Meeting', icon: 'Calendar', color: 'purple' },
    { value: 'note', label: 'Note', icon: 'FileText', color: 'gray' }
  ]

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
  ]

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError("")
const [activitiesData, contactsData, dealsData] = await Promise.all([
        activityService.getAll(),
        contactService.getAll(),
        dealService.getAll()
      ])
      setActivities(activitiesData)
      setContacts(contactsData)
      setDeals(dealsData)
    } catch (err) {
      setError("Failed to load data")
      console.error("Data loading error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    try {
      setLoading(true)
const filters = {
        type: selectedType,
        priority: selectedPriority,
        assignee: selectedAssignee
      }
      const results = await activityService.search(searchTerm, filters)
      setActivities(results)
    } catch (err) {
      toast.error("Search failed")
      console.error("Search error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleClearFilters = () => {
    setSearchTerm("")
setSelectedType("all")
    setSelectedPriority("all")
    setSelectedAssignee("all")
    loadData()
  }

  const getContactName = (contactId) => {
    if (!contactId) return 'Unknown Contact'
    const contact = contacts.find(c => c.Id === contactId)
    return contact ? contact.name : 'Unknown Contact'
  }

  const getDealTitle = (dealId) => {
    if (!dealId) return null
    const deal = deals.find(d => d.Id === dealId)
    return deal ? deal.title : 'Unknown Deal'
  }

const getAssigneeName = (assigneeId) => {
    // This would normally come from a context or prop
    const teamMembers = [
      { Id: 1, name: "Current User" },
      { Id: 2, name: "John Smith" },
      { Id: 3, name: "Sarah Wilson" },
      { Id: 4, name: "Mike Johnson" }
    ]
    const assignee = teamMembers.find(m => m.Id === assigneeId)
    return assignee ? assignee.name : "Unknown"
  }

  const getActivityIcon = (type) => {
    const activityType = activityTypes.find(t => t.value === type)
    return activityType ? activityType.icon : 'Activity'
  }

  const getActivityColor = (type) => {
    const activityType = activityTypes.find(t => t.value === type)
    return activityType ? activityType.color : 'gray'
  }

  const getActivityColorClasses = (type) => {
    const color = getActivityColor(type)
    switch (color) {
      case 'blue':
        return 'bg-blue-100 text-blue-600'
      case 'green':
        return 'bg-green-100 text-green-600'
      case 'purple':
        return 'bg-purple-100 text-purple-600'
      case 'gray':
        return 'bg-gray-100 text-gray-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const getActivityBadgeColor = (type) => {
    const color = getActivityColor(type)
    switch (color) {
      case 'blue':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'green':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'purple':
        return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'gray':
        return 'bg-gray-50 text-gray-700 border-gray-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

const formatActivityTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      return "Just now"
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`
    } else {
      return format(date, "MMM d, yyyy")
    }
  }

  const formatScheduledTime = (scheduledDate, scheduledTime) => {
    if (!scheduledDate) return null
    
    const date = new Date(scheduledDate)
    if (scheduledTime) {
      const [hours, minutes] = scheduledTime.split(':')
      date.setHours(parseInt(hours), parseInt(minutes))
    }
    
    const now = new Date()
    const diffInHours = (date - now) / (1000 * 60 * 60)
    
    if (diffInHours < 24 && diffInHours > 0) {
      return `Today at ${format(date, 'h:mm a')}`
    } else if (diffInHours < 168 && diffInHours > 0) {
      return format(date, "EEE 'at' h:mm a")
    } else {
      return format(date, "MMM d 'at' h:mm a")
    }
  }

if (loading) return <Loading />
  if (error) return <ErrorView message={error} onRetry={loadData} />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Activities</h1>
          <p className="text-slate-600 mt-1">Track all your interactions and communications</p>
        </div>
        <Button
          onClick={() => {
            setEditingActivity(null)
            setShowActivityModal(true)
          }}
          className="btn-primary"
        >
          <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
          Log Activity
        </Button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="input-field sm:w-40"
            >
              <option value="all">All Types</option>
              {activityTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="input-field sm:w-40"
            >
              <option value="all">All Priorities</option>
              {priorities.map(priority => (
                <option key={priority.value} value={priority.value}>{priority.label}</option>
              ))}
            </select>

            <select
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
              className="input-field sm:w-40"
            >
              <option value="all">All Assignees</option>
              <option value="current-user">My Activities</option>
              <option value="unassigned">Unassigned</option>
            </select>

            <Button onClick={handleSearch} className="btn-primary whitespace-nowrap">
              <ApperIcon name="Search" className="h-4 w-4 mr-2" />
              Search
            </Button>

            {(searchTerm || selectedType !== 'all' || selectedPriority !== 'all' || selectedAssignee !== 'all') && (
              <Button onClick={handleClearFilters} variant="secondary" className="whitespace-nowrap">
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Activities List */}
      {activities.length === 0 ? (
        <Empty
          icon="Activity"
          title="No activities found"
          description="Start logging your interactions to see them here"
          actionLabel="Log First Activity"
          onAction={() => setShowActivityModal(true)}
        />
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.Id} className="card hover:shadow-lg transition-all duration-200 group">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full ${getActivityColorClasses(activity.type)} flex items-center justify-center`}>
                    <ApperIcon
                      name={getActivityIcon(activity.type)}
                      className="h-5 w-5 text-primary-600"
                    />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant="default" size="sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getActivityBadgeColor(activity.type)}`}>
                            {activityTypes.find(t => t.value === activity.type)?.label || activity.type}
                          </span>
                        </Badge>
                      </div>
                      {activity.priority && (
                        <Badge
                          variant="secondary"
                          className={getPriorityColor(activity.priority)}
                          size="sm"
                        >
                          {activity.priority}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingActivity(activity)
                          setShowActivityModal(true)
                        }}
                        className="p-1 text-gray-400 hover:text-primary-600 rounded"
                      >
                        <ApperIcon name="Edit" className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteActivity(activity.Id)}
                        className="p-1 text-gray-400 hover:text-red-600 rounded"
                      >
                        <ApperIcon name="Trash2" className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-medium text-gray-900 mb-1">
                    {activity.description}
                  </h3>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-xs">
                      <div className="flex items-center space-x-1">
                        <ApperIcon name="User" className="h-4 w-4" />
                        <span>{getContactName(activity.contactId)}</span>
                      </div>
                      {activity.dealId && (
                        <div className="flex items-center space-x-1">
                          <ApperIcon name="DollarSign" className="h-4 w-4" />
                          <span>{getDealTitle(activity.dealId)}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <ApperIcon name="Clock" className="h-4 w-4" />
                        <span>{formatActivityTime(activity.createdAt)}</span>
                      </div>
                    </div>
{activity.assignedTo && (
                      <AssigneeDisplay 
                        assigneeId={activity.assignedTo} 
                        size="sm"
                        showName={false}
                      />
                    )}
                  </div>

                  {/* Type-specific details */}
                  {activity.type === 'call' && activity.duration && (
                    <div className="text-sm text-gray-600 mb-1">
                      Duration: {Math.floor(activity.duration / 60)}m {activity.duration % 60}s
                    </div>
                  )}
                  
                  {activity.type === 'meeting' && activity.scheduledDate && (
                    <div className="text-sm text-purple-600 mb-1 flex items-center">
                      <ApperIcon name="Clock" className="w-4 h-4 mr-1" />
                      {formatScheduledTime(activity.scheduledDate, activity.scheduledTime)}
                    </div>
                  )}
                  {activity.type === 'meeting' && activity.participants && (
                    <div className="text-sm text-gray-600 mb-1 flex items-center">
                      <ApperIcon name="Users" className="w-4 h-4 mr-1" />
                      Participants: {activity.participants.join(', ')}
                    </div>
                  )}
                  {activity.type === 'meeting' && activity.location && (
                    <div className="text-sm text-gray-600 mb-1 flex items-center">
                      <ApperIcon name="MapPin" className="w-4 h-4 mr-1" />
                      {activity.location}
                    </div>
                  )}

                  {activity.type === 'email' && activity.subject && (
                    <div className="text-sm text-gray-600 mb-1">
                      Subject: {activity.subject}
                    </div>
                  )}

                  {activity.notes && (
                    <p className="text-sm text-gray-600 mt-2">
                      {activity.notes.length > 150 
                        ? `${activity.notes.substring(0, 150)}...` 
                        : activity.notes}
                    </p>
                  )}

                  {activity.recordingLink && (
                    <a 
                      href={activity.recordingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-800 mt-2"
                    >
                      <ApperIcon name="Play" className="h-4 w-4" />
                      <span>View Recording</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Activity Modal */}
      {showActivityModal && (
        <ActivityModal
          activity={editingActivity}
          contacts={contacts}
          deals={deals}
          onClose={() => {
            setShowActivityModal(false)
            setEditingActivity(null)
          }}
          onSave={handleSaveActivity}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  )

  async function handleSaveActivity(activityData) {
    try {
      setIsSubmitting(true)
      
      // Prepare activity data with meeting scheduling
      const processedData = { ...activityData }
      
      // For meetings, combine date and time for scheduling
      if (activityData.type === 'meeting' && activityData.scheduledDate && activityData.scheduledTime) {
        const scheduledDateTime = new Date(activityData.scheduledDate)
        const [hours, minutes] = activityData.scheduledTime.split(':')
        scheduledDateTime.setHours(parseInt(hours), parseInt(minutes))
        processedData.scheduledDateTime = scheduledDateTime.toISOString()
      }
      
      if (editingActivity) {
        await activityService.update(editingActivity.Id, processedData)
        if (activityData.type === 'meeting') {
          toast.success("Meeting updated successfully")
        } else {
          toast.success("Activity updated successfully")
        }
      } else {
        await activityService.create(processedData)
        if (activityData.type === 'meeting') {
          toast.success("Meeting scheduled successfully")
        } else {
          toast.success("Activity logged successfully")
        }
      }
      
      setShowActivityModal(false)
      setEditingActivity(null)
      await loadData()
    } catch (error) {
      const action = editingActivity ? "update" : "create"
      const activityType = activityData.type === 'meeting' ? "meeting" : "activity"
      toast.error(`Failed to ${action} ${activityType}`)
      console.error("Activity save error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDeleteActivity(activityId) {
    if (!confirm("Are you sure you want to delete this activity?")) return
    
    try {
      await activityService.delete(activityId)
      toast.success("Activity deleted successfully")
      await loadData()
    } catch (error) {
      toast.error("Failed to delete activity")
      console.error("Activity delete error:", error)
    }
  }
}

// Activity Modal Component with Meeting Scheduling
function ActivityModal({ activity, contacts, deals, onClose, onSave, isSubmitting }) {
  const [formData, setFormData] = useState({
    type: activity?.type || 'call',
    description: activity?.description || '',
    notes: activity?.notes || '',
contactId: activity?.contactId || '',
    dealId: activity?.dealId || '',
    assignedTo: activity?.assignedTo || null,
    assignmentHistory: activity?.assignmentHistory || [],
    priority: activity?.priority || 'medium',
    assignedTo: activity?.assignedTo || null,
    duration: activity?.duration || '',
    recordingLink: activity?.recordingLink || '',
    participants: activity?.participants ? activity.participants.join(', ') : '',
    location: activity?.location || '',
    subject: activity?.subject || '',
    scheduledDate: activity?.scheduledDate || '',
    scheduledTime: activity?.scheduledTime || ''
  })

const activityTypes = [
    { value: 'call', label: 'Call', icon: 'Phone', color: 'blue' },
    { value: 'email', label: 'Email', icon: 'Mail', color: 'green' },
    { value: 'meeting', label: 'Meeting', icon: 'Calendar', color: 'purple' },
    { value: 'note', label: 'Note', icon: 'FileText', color: 'gray' }
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
const activityData = {
      ...formData,
      contactId: formData.contactId ? parseInt(formData.contactId) : null,
      dealId: formData.dealId ? parseInt(formData.dealId) : null,
      duration: formData.type === 'call' && formData.duration ? parseInt(formData.duration) : undefined,
      participants: formData.type === 'meeting' && formData.participants 
        ? formData.participants.split(',').map(p => p.trim()).filter(p => p) 
        : undefined,
assignedTo: formData.assignedTo,
      userName: 'Current User' // This would come from auth context in real app
    }

    onSave(activityData)
  }

  const renderTypeSpecificFields = () => {
    switch (formData.type) {
      case 'call':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (seconds)
              </label>
              <Input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                placeholder="Enter call duration in seconds"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recording Link
              </label>
              <Input
                type="url"
                value={formData.recordingLink}
                onChange={(e) => setFormData(prev => ({ ...prev, recordingLink: e.target.value }))}
                placeholder="https://..."
              />
            </div>
          </>
        )
      case 'email':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <Input
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Email subject"
            />
          </div>
        )
      case 'meeting':
return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <ApperIcon name="Calendar" className="w-4 h-4 inline mr-1" />
                  Meeting Date
                </label>
                <Input
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <ApperIcon name="Clock" className="w-4 h-4 inline mr-1" />
                  Meeting Time
                </label>
                <Input
                  type="time"
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                  className="w-full"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <ApperIcon name="Users" className="w-4 h-4 inline mr-1" />
                Participants (comma-separated)
              </label>
              <Input
                value={formData.participants}
                onChange={(e) => setFormData(prev => ({ ...prev, participants: e.target.value }))}
                placeholder="John Doe, Jane Smith, team@company.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <ApperIcon name="MapPin" className="w-4 h-4 inline mr-1" />
                Location / Meeting Link
              </label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Conference room, Zoom link, or address"
              />
            </div>
          </>
        )
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {activity ? 'Edit Activity' : 'Log New Activity'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <ApperIcon name="X" className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-96 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Activity Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                className="input-field"
                required
              >
                {activityTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                className="input-field"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the activity"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact
              </label>
              <select
                value={formData.contactId}
                onChange={(e) => setFormData(prev => ({ ...prev, contactId: e.target.value }))}
                className="input-field"
              >
                <option value="">Select contact</option>
                {contacts.map(contact => (
                  <option key={contact.Id} value={contact.Id}>{contact.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Related Deal
              </label>
              <select
                value={formData.dealId}
                onChange={(e) => setFormData(prev => ({ ...prev, dealId: e.target.value }))}
                className="input-field"
              >
                <option value="">Select deal</option>
                {deals.map(deal => (
                  <option key={deal.Id} value={deal.Id}>{deal.title}</option>
                ))}
              </select>
            </div>
</div>

<div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Assigned To
            </label>
            <AssigneeSelector
              value={formData.assignedTo}
              onChange={(value) => setFormData({...formData, assignedTo: value})}
              placeholder="Assign activity to..."
              className="flex-1"
              value={formData.assignedTo}
              onChange={(value) => setFormData({...formData, assignedTo: value})}
              placeholder="Assign activity to..."
            />
          </div>

          {renderTypeSpecificFields()}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes about this activity"
              rows="4"
              className="input-field resize-none"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <ApperIcon name="Loader2" className="h-4 w-4 mr-2 animate-spin" />
                  {activity ? 'Updating...' : 'Logging...'}
                </>
              ) : (
                <>
                  <ApperIcon name="Save" className="h-4 w-4 mr-2" />
                  {activity ? 'Update Activity' : 'Log Activity'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}