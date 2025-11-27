import contactsData from "@/services/mockData/contacts.json";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

let contacts = [...contactsData]

export const contactService = {
async getAll() {
    await delay(400)
    return [...contacts]
  },

async getByAssignee(assigneeId) {
    await delay(400)
    const id = parseInt(assigneeId)
    if (!id || isNaN(id)) return []
    return contacts.filter(c => c.assignedTo === id)
  },

  async getById(id) {
    await delay(200)
    const contact = contacts.find(c => c.Id === parseInt(id))
    if (!contact) {
      throw new Error("Contact not found")
    }
    return { ...contact }
  },

async create(contactData) {
    await delay(300)
    
    // Validate required fields
    if (!contactData.name?.trim()) {
      throw new Error("Name is required")
    }
    
    // Validate email format if provided
    if (contactData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactData.email)) {
      throw new Error("Please enter a valid email address")
    }
    
// Validate phone format if provided (basic validation)
    if (contactData.phone && !/^[+]?[\d\s\-()]+$/.test(contactData.phone)) {
      throw new Error("Please enter a valid phone number")
    }
    
const now = new Date().toISOString()
const newContact = {
      ...contactData,
      Id: Math.max(...contacts.map(c => c.Id)) + 1,
      avatar: contactData.avatar || "",
      tags: contactData.tags || [],
      assignedTo: contactData.assignedTo || null,
      assignedAt: contactData.assignedTo ? now : null,
      assignmentHistory: contactData.assignedTo ? [{
        assignedTo: contactData.assignedTo,
        assignedAt: now,
        assignedBy: 1, // Current user - could be passed as parameter
        status: 'active'
      }] : [],
      createdAt: now,
      lastContactedAt: now
    }
    contacts = [newContact, ...contacts]
    return { ...newContact }
  },

async update(id, contactData) {
    await delay(300)
    const index = contacts.findIndex(c => c.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Contact not found")
    }
    
    // Validate required fields
    if (!contactData.name?.trim()) {
      throw new Error("Name is required")
    }
    
    // Validate email format if provided
    if (contactData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactData.email)) {
      throw new Error("Please enter a valid email address")
    }
    
// Validate phone format if provided (basic validation)
    if (contactData.phone && !/^[+]?[\d\s\-()]+$/.test(contactData.phone)) {
      throw new Error("Please enter a valid phone number")
    }
    
const now = new Date().toISOString()
const previousAssignee = contacts[index].assignedTo
    const newAssignee = contactData.assignedTo
    const assignmentChanged = newAssignee !== previousAssignee
    
    // Prepare assignment history entry if assignment changed
    const currentHistory = contacts[index].assignmentHistory || []
    const newHistoryEntry = assignmentChanged ? {
      assignedTo: newAssignee,
      assignedAt: now,
      assignedBy: 1, // Current user - could be passed as parameter
      previousAssignee: previousAssignee,
      status: newAssignee ? 'active' : 'unassigned'
    } : null
    
    const updatedContact = {
      ...contacts[index],
      ...contactData,
      Id: parseInt(id),
      assignedTo: newAssignee || null,
      assignedAt: assignmentChanged && newAssignee ? now : contacts[index].assignedAt,
      assignmentHistory: newHistoryEntry ? [...currentHistory, newHistoryEntry] : currentHistory,
      updatedAt: now,
      lastContactedAt: now
    }
    
    contacts[index] = updatedContact
    return { ...updatedContact }
  },
async delete(id) {
    await delay(200)
    contacts = contacts.filter(c => c.Id !== parseInt(id))
    return true
  },

  async bulkDelete(ids) {
    await delay(300)
    const idsToDelete = ids.map(id => parseInt(id))
    contacts = contacts.filter(c => !idsToDelete.includes(c.Id))
    return { deleted: idsToDelete.length }
  },
async updateAvatar(id, avatarData) {
    await delay(200)
    const contactIndex = contacts.findIndex(c => c.Id === parseInt(id))
    if (contactIndex === -1) {
      throw new Error('Contact not found')
    }
    contacts[contactIndex] = {
      ...contacts[contactIndex],
      avatar: avatarData
    }
    return contacts[contactIndex]
  },
async exportToCsv() {
    await delay(100)
    const headers = ['Id', 'Name', 'Email', 'Phone', 'Company', 'Position', 'Created At', 'Last Contacted']
    const csvData = [
      headers.join(','),
      ...contacts.map(contact => [
        contact.Id,
        `"${(contact.name || '').replace(/"/g, '""')}"`,
        `"${(contact.email || '').replace(/"/g, '""')}"`,
        `"${(contact.phone || '').replace(/"/g, '""')}"`,
        `"${(contact.company || '').replace(/"/g, '""')}"`,
        `"${(contact.position || '').replace(/"/g, '""')}"`,
        contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : '',
        contact.lastContactedAt ? new Date(contact.lastContactedAt).toLocaleDateString() : ''
      ].join(','))
    ].join('\n')
    
    return csvData
},

  async bulkAssign(contactIds, assigneeId) {
    await delay(400)
    const now = new Date().toISOString()
    const idsToUpdate = contactIds.map(id => parseInt(id))
    
    // Validate assignee exists (basic validation)
    if (assigneeId !== null && (typeof assigneeId !== 'number' || assigneeId <= 0)) {
      throw new Error("Invalid assignee selected")
    }
    
    let updatedCount = 0
    contacts = contacts.map(contact => {
      if (idsToUpdate.includes(contact.Id)) {
        const previousAssignee = contact.assignedTo
        const assignmentChanged = assigneeId !== previousAssignee
        
        if (assignmentChanged) {
          const currentHistory = contact.assignmentHistory || []
          const newHistoryEntry = {
            assignedTo: assigneeId,
            assignedAt: now,
            assignedBy: 1, // Current user
            previousAssignee: previousAssignee,
            status: assigneeId ? 'active' : 'unassigned',
            bulkAssignment: true
          }
          
          updatedCount++
          return {
            ...contact,
            assignedTo: assigneeId,
            assignedAt: assigneeId ? now : null,
            assignmentHistory: [...currentHistory, newHistoryEntry],
            updatedAt: now,
            lastContactedAt: now
          }
        }
      }
      return contact
    })
    
    return { updated: updatedCount, total: idsToUpdate.length }
  }
}