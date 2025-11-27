import dealsData from "@/services/mockData/deals.json"

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

let deals = [...dealsData]

export const dealService = {
async getAll() {
    await delay(400)
    return [...deals]
  },

async getByAssignee(assigneeId) {
    await delay(400)
    const id = parseInt(assigneeId)
    if (!id || isNaN(id)) return []
    return deals.filter(d => d.dealOwner === id)
  },

  async getById(id) {
    await delay(200)
    const deal = deals.find(d => d.Id === parseInt(id))
    if (!deal) {
      throw new Error("Deal not found")
    }
    return { ...deal }
  },

async create(dealData) {
    await delay(350)
    const now = new Date().toISOString()
const newDeal = {
      ...dealData,
      Id: Math.max(...deals.map(d => d.Id)) + 1,
      amount: parseFloat(dealData.amount) || 0,
      probability: parseInt(dealData.probability) || 25,
      dealOwner: dealData.dealOwner || null,
      assignedAt: dealData.dealOwner ? now : null,
      assignmentHistory: dealData.dealOwner ? [{
        assignedTo: dealData.dealOwner,
        assignedAt: now,
        assignedBy: 1, // Current user
        status: 'active'
      }] : [],
      createdAt: now,
      updatedAt: now,
      stageChangedAt: dealData.stageChangedAt || now,
      stageHistory: [{
        stage: dealData.stage || 'new',
        enteredAt: now,
        duration: 0
      }]
    }
    deals = [newDeal, ...deals]
    return { ...newDeal }
  },

async update(id, dealData) {
    await delay(350)
    const index = deals.findIndex(d => d.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Deal not found")
    }
    
    const now = new Date().toISOString()
    const currentDeal = deals[index]
    
const previousOwner = currentDeal.dealOwner
    const newOwner = dealData.dealOwner
    const assignmentChanged = newOwner !== previousOwner
    
    // Prepare assignment history entry if assignment changed
    const currentHistory = currentDeal.assignmentHistory || []
    const newHistoryEntry = assignmentChanged ? {
      assignedTo: newOwner,
      assignedAt: now,
      assignedBy: 1, // Current user
      previousAssignee: previousOwner,
      status: newOwner ? 'active' : 'unassigned'
    } : null
    
    const updatedDeal = {
      ...currentDeal,
      ...dealData,
      Id: parseInt(id),
      amount: parseFloat(dealData.amount) || currentDeal.amount,
      probability: parseInt(dealData.probability) || currentDeal.probability,
      dealOwner: newOwner || null,
      assignedAt: assignmentChanged && newOwner ? now : currentDeal.assignedAt,
      assignmentHistory: newHistoryEntry ? [...currentHistory, newHistoryEntry] : currentHistory,
      updatedAt: now
    }
    
    deals[index] = updatedDeal
    return { ...updatedDeal }
  },

async updateStage(id, newStage) {
    await delay(350)
    const index = deals.findIndex(d => d.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Deal not found")
    }
    
    const now = new Date().toISOString()
    const currentDeal = deals[index]
    
    // Calculate duration in current stage
    const currentStageDuration = currentDeal.stageChangedAt 
      ? new Date(now) - new Date(currentDeal.stageChangedAt)
      : 0
    
    // Update stage history
    const updatedHistory = [...(currentDeal.stageHistory || [])]
    
    // Update the last entry with exit time and duration
    if (updatedHistory.length > 0) {
      const lastEntry = updatedHistory[updatedHistory.length - 1]
      lastEntry.exitedAt = now
      lastEntry.duration = currentStageDuration
    }
    
    // Add new stage entry
    updatedHistory.push({
      stage: newStage,
      enteredAt: now,
      duration: 0
    })
    
    const updatedDeal = {
      ...currentDeal,
      stage: newStage,
      stageChangedAt: now,
      stageHistory: updatedHistory,
      updatedAt: now
    }
    
    deals[index] = updatedDeal
    return { ...updatedDeal }
  },

async delete(id) {
    await delay(200)
    deals = deals.filter(d => d.Id !== parseInt(id))
    return true
  },

async bulkUpdateStage(dealIds, stage) {
    await delay(400)
    const now = new Date().toISOString()
    
    dealIds.forEach(id => {
      const index = deals.findIndex(d => d.Id === parseInt(id))
      if (index !== -1) {
        const currentDeal = deals[index]
        
        // Calculate duration in current stage
        const currentStageDuration = currentDeal.stageChangedAt 
          ? new Date(now) - new Date(currentDeal.stageChangedAt)
          : 0
        
        // Update stage history
        const updatedHistory = [...(currentDeal.stageHistory || [])]
        
        if (updatedHistory.length > 0) {
          const lastEntry = updatedHistory[updatedHistory.length - 1]
          lastEntry.exitedAt = now
          lastEntry.duration = currentStageDuration
        }
        
        updatedHistory.push({
          stage: stage,
          enteredAt: now,
          duration: 0
        })
        
deals[index] = {
          ...currentDeal,
          stage,
          stageChangedAt: now,
          stageHistory: updatedHistory,
          updatedAt: now
        }
      }
    })
    return true
  },

  async getByStage(stage) {
    await delay(300)
    return deals.filter(d => d.stage === stage)
},

  async getStageDurationAnalytics() {
    await delay(200)
    
    // Calculate average duration per stage from completed transitions
    const stageAnalytics = {}
    const currentStageData = {}
    
    deals.forEach(deal => {
      if (deal.stageHistory) {
        deal.stageHistory.forEach(entry => {
          if (!stageAnalytics[entry.stage]) {
            stageAnalytics[entry.stage] = {
              totalDuration: 0,
              completedTransitions: 0,
              averageDuration: 0
            }
          }
          
          if (entry.duration > 0) {
            stageAnalytics[entry.stage].totalDuration += entry.duration
            stageAnalytics[entry.stage].completedTransitions += 1
          }
        })
      }
      
      // Track current stage durations
      if (deal.stageChangedAt) {
        const currentDuration = new Date() - new Date(deal.stageChangedAt)
        if (!currentStageData[deal.stage]) {
          currentStageData[deal.stage] = {
            totalCurrentDuration: 0,
            activeDeals: 0,
            averageCurrentDuration: 0
          }
        }
        currentStageData[deal.stage].totalCurrentDuration += currentDuration
        currentStageData[deal.stage].activeDeals += 1
      }
    })
    
    // Calculate averages
    Object.keys(stageAnalytics).forEach(stage => {
      const data = stageAnalytics[stage]
      if (data.completedTransitions > 0) {
        data.averageDuration = data.totalDuration / data.completedTransitions
      }
    })
    
    Object.keys(currentStageData).forEach(stage => {
      const data = currentStageData[stage]
      if (data.activeDeals > 0) {
        data.averageCurrentDuration = data.totalCurrentDuration / data.activeDeals
      }
    })
    
    return {
      historicalStageMetrics: stageAnalytics,
      currentStageMetrics: currentStageData
    }
  },

  async getPipelineMetrics() {
    await delay(200)
    const totalValue = deals.reduce((sum, deal) => sum + (parseFloat(deal.amount) || 0), 0)
    const weightedValue = deals.reduce((sum, deal) => {
      const amount = parseFloat(deal.amount) || 0
      const probability = parseInt(deal.probability) || 0
      return sum + (amount * (probability / 100))
    }, 0)
    
    const stageDistribution = deals.reduce((acc, deal) => {
      acc[deal.stage] = (acc[deal.stage] || 0) + 1
      return acc
    }, {})

    return {
      totalValue,
      weightedValue,
      totalDeals: deals.length,
      stageDistribution
    }
  },

  async getDealById(id) {
    await delay(150)
    const deal = deals.find(d => d.Id === parseInt(id))
    if (!deal) {
      throw new Error("Deal not found")
    }
    return { ...deal }
  },

  async getStageTransitionHistory(id) {
    await delay(200)
    const deal = deals.find(d => d.Id === parseInt(id))
    if (!deal) {
      throw new Error("Deal not found")
    }
    
    return deal.stageHistory || []
},

  async bulkAssign(dealIds, assigneeId) {
    await delay(400)
    const now = new Date().toISOString()
    const idsToUpdate = dealIds.map(id => parseInt(id))
    
    // Validate assignee exists (basic validation)
    if (assigneeId !== null && (typeof assigneeId !== 'number' || assigneeId <= 0)) {
      throw new Error("Invalid assignee selected")
    }
    
    let updatedCount = 0
    deals = deals.map(deal => {
      if (idsToUpdate.includes(deal.Id)) {
        const previousOwner = deal.dealOwner
        const assignmentChanged = assigneeId !== previousOwner
        
        if (assignmentChanged) {
          const currentHistory = deal.assignmentHistory || []
          const newHistoryEntry = {
            assignedTo: assigneeId,
            assignedAt: now,
            assignedBy: 1, // Current user
            previousAssignee: previousOwner,
            status: assigneeId ? 'active' : 'unassigned',
            bulkAssignment: true
          }
          
          updatedCount++
          return {
            ...deal,
            dealOwner: assigneeId,
            assignedAt: assigneeId ? now : null,
            assignmentHistory: [...currentHistory, newHistoryEntry],
            updatedAt: now
          }
        }
      }
      return deal
    })
    
    return { updated: updatedCount, total: idsToUpdate.length }
  }
}