import activitiesData from "@/services/mockData/activities.json"

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

let activities = [...activitiesData]

export const activityService = {
async getAll() {
    await delay(300)
    return [...activities]
  },

async getByAssignee(assigneeId) {
    await delay(300)
    const id = parseInt(assigneeId)
    if (!id || isNaN(id)) return []
    return activities.filter(a => a.assignedTo === id)
  },

  async getRecent(limit = 10) {
    await delay(250)
    return activities
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit)
  },

async create(activityData) {
    await delay(200)
    const now = new Date().toISOString()
const newActivity = {
...activityData,
      Id: Math.max(...activities.map(a => a.Id)) + 1,
      assignedTo: activityData.assignedTo || null,
      assignedAt: activityData.assignedTo ? now : null,
      assignmentHistory: activityData.assignedTo ? [{
        assignedTo: activityData.assignedTo,
        assignedAt: now,
        assignedBy: 1, // Current user
        status: 'active'
      }] : [],
      createdAt: now,
      updatedAt: now,
      // Type-specific field defaults
      duration: activityData.type === 'call' ? (activityData.duration || 0) : undefined,
      recordingLink: activityData.type === 'call' ? (activityData.recordingLink || '') : undefined,
      participants: activityData.type === 'meeting' ? (activityData.participants || []) : undefined,
      location: activityData.type === 'meeting' ? (activityData.location || '') : undefined,
      subject: activityData.type === 'email' ? (activityData.subject || '') : undefined,
      priority: activityData.priority || 'medium'
    }
    activities = [newActivity, ...activities]
    return { ...newActivity }
  },

  async update(id, activityData) {
    await delay(250)
    const index = activities.findIndex(a => a.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Activity not found")
    }
    
const now = new Date().toISOString()
    const previousAssignee = activities[index].assignedTo
    const newAssignee = activityData.assignedTo
    const assignmentChanged = newAssignee !== previousAssignee
    
    // Prepare assignment history entry if assignment changed
    const currentHistory = activities[index].assignmentHistory || []
    const newHistoryEntry = assignmentChanged ? {
      assignedTo: newAssignee,
      assignedAt: now,
      assignedBy: 1, // Current user
      previousAssignee: previousAssignee,
      status: newAssignee ? 'active' : 'unassigned'
    } : null
    
    const updatedActivity = {
      ...activities[index],
      ...activityData,
      Id: parseInt(id),
      assignedTo: newAssignee || null,
      assignedAt: assignmentChanged && newAssignee ? now : activities[index].assignedAt,
      assignmentHistory: newHistoryEntry ? [...currentHistory, newHistoryEntry] : currentHistory,
      updatedAt: now
    }
    activities[index] = updatedActivity
    return { ...updatedActivity }
  },

  async delete(id) {
    await delay(200)
    const index = activities.findIndex(a => a.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Activity not found")
    }
    
    activities = activities.filter(a => a.Id !== parseInt(id))
    return true
  },

  async getById(id) {
    await delay(150)
    const activity = activities.find(a => a.Id === parseInt(id))
    if (!activity) {
      throw new Error("Activity not found")
    }
    return { ...activity }
  },

  async getByContactId(contactId, limit = 50) {
    await delay(200)
    return activities
      .filter(a => a.contactId === parseInt(contactId))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit)
  },

  async getByDealId(dealId, limit = 50) {
    await delay(200)
    return activities
      .filter(a => a.dealId === parseInt(dealId))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit)
  },

  async getByType(type, limit = 100) {
    await delay(200)
    return activities
      .filter(a => a.type === type)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit)
  },

async search(query, filters = {}) {
    await delay(300)
    let filtered = [...activities]
    
    // Text search
    if (query && query.trim()) {
      const searchTerm = query.toLowerCase()
      filtered = filtered.filter(activity => 
        activity.description?.toLowerCase().includes(searchTerm) ||
        activity.notes?.toLowerCase().includes(searchTerm) ||
        activity.subject?.toLowerCase().includes(searchTerm) ||
        activity.userName?.toLowerCase().includes(searchTerm)
      )
    }
    
    // Type filter
    if (filters.type && filters.type !== 'all') {
      filtered = filtered.filter(a => a.type === filters.type)
    }
    
    // Contact filter
    if (filters.contactId) {
      filtered = filtered.filter(a => a.contactId === parseInt(filters.contactId))
    }
    
    // Deal filter  
    if (filters.dealId) {
      filtered = filtered.filter(a => a.dealId === parseInt(filters.dealId))
    }
    
    // Priority filter
    if (filters.priority && filters.priority !== 'all') {
      filtered = filtered.filter(a => a.priority === filters.priority)
    }
    
    // Date range filter
    if (filters.startDate) {
      filtered = filtered.filter(a => new Date(a.createdAt) >= new Date(filters.startDate))
    }
    if (filters.endDate) {
      filtered = filtered.filter(a => new Date(a.createdAt) <= new Date(filters.endDate))
    }
    
    return filtered
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, filters.limit || 100)
  },

  async getTodaysActivities() {
    await delay(200)
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)
    
    return activities.filter(activity => {
      const activityDate = new Date(activity.createdAt)
      return activityDate >= startOfDay && activityDate <= endOfDay
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }
}