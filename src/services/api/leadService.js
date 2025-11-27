import leadsData from "@/services/mockData/leads.json";
import React from "react";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

let leads = [...leadsData]

// Lead scoring configuration
const SCORING_RULES = {
  value: {
    weight: 0.3,
    ranges: [
      { min: 0, max: 10000, score: 20 },
      { min: 10001, max: 25000, score: 40 },
      { min: 25001, max: 50000, score: 60 },
      { min: 50001, max: 100000, score: 80 },
      { min: 100001, max: Infinity, score: 100 }
    ]
  },
  engagement: {
    weight: 0.25,
    stages: {
      'new': 20,
      'contacted': 40,
      'qualified': 70,
      'proposal': 85,
      'negotiation': 90,
      'closed-won': 100,
      'unqualified': 10,
      'closed-lost': 5
    }
  },
  completeness: {
    weight: 0.15,
    fields: ['title', 'company', 'contactName', 'email', 'phone', 'value', 'budget', 'timeline', 'notes']
  },
  recency: {
    weight: 0.1,
    maxDays: 30
  },
  qualification: {
    weight: 0.2,
    criteria: {
      budget: 15,
      authority: 15,
      need: 20,
      timeline: 15,
      decisionProcess: 10,
      competition: 10,
      fit: 15
    }
  }
}

function calculateLeadScore(lead) {
  let totalScore = 0;
  
  // Value score
  const value = parseFloat(lead.value || 0);
  const valueRule = SCORING_RULES.value.ranges.find(range => value >= range.min && value <= range.max);
  const valueScore = valueRule ? valueRule.score : 0;
  totalScore += valueScore * SCORING_RULES.value.weight;
  
  // Engagement score  
  const engagementScore = SCORING_RULES.engagement.stages[lead.stage] || 0;
  totalScore += engagementScore * SCORING_RULES.engagement.weight;
  
  // Completeness score
  const filledFields = SCORING_RULES.completeness.fields.filter(field => 
    lead[field] && String(lead[field]).trim().length > 0
  ).length;
  const completenessScore = (filledFields / SCORING_RULES.completeness.fields.length) * 100;
  totalScore += completenessScore * SCORING_RULES.completeness.weight;
  
  // Recency score
  const updatedAt = new Date(lead.updatedAt || lead.createdAt);
  const daysSinceUpdate = (Date.now() - updatedAt.getTime()) / (1000 * 60 * 60 * 24);
  const recencyScore = Math.max(0, 100 - (daysSinceUpdate / SCORING_RULES.recency.maxDays) * 100);
  totalScore += recencyScore * SCORING_RULES.recency.weight;
  
  // Qualification score
  if (lead.qualification) {
    let qualificationScore = 0;
    Object.entries(SCORING_RULES.qualification.criteria).forEach(([criterion, points]) => {
      if (lead.qualification[criterion]) {
        qualificationScore += points;
      }
    });
    totalScore += qualificationScore * SCORING_RULES.qualification.weight;
  }
  
  return Math.round(Math.max(1, Math.min(100, totalScore)));
}

function addScoreHistory(lead, newScore, reason = 'Score updated') {
  const scoreHistory = lead.scoreHistory || [];
  const lastEntry = scoreHistory[scoreHistory.length - 1];
  
  // Only add history entry if score changed
  if (!lastEntry || lastEntry.score !== newScore) {
    scoreHistory.push({
      score: newScore,
      previousScore: lastEntry ? lastEntry.score : null,
      timestamp: new Date().toISOString(),
      reason
    });
    
    // Keep only last 50 entries
    if (scoreHistory.length > 50) {
      scoreHistory.splice(0, scoreHistory.length - 50);
    }
  }
  
  return scoreHistory;
}
export const leadService = {
async getAll() {
    await delay(350)
    return [...leads]
  },

  async getByAssignee(assigneeId) {
await delay(350)
    const id = parseInt(assigneeId)
    if (!id || isNaN(id)) return []
    return leads.filter(l => l.assignedTo === id)
  },
  async getById(id) {
    await delay(200)
    const lead = leads.find(l => l.Id === parseInt(id))
    if (!lead) {
      throw new Error("Lead not found")
    }
    return { ...lead }
  },

async create(leadData) {
    await delay(300)
    
    // Validate required fields
    if (!leadData.title?.trim() || !leadData.company?.trim()) {
      throw new Error("Title and company are required")
    }
    
    if (leadData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(leadData.email)) {
      throw new Error("Please enter a valid email address")
    }
    
    const now = new Date().toISOString();
const newLead = {
      ...leadData,
      Id: Math.max(...leads.map(l => l.Id), 0) + 1,
      stage: leadData.stage || 'new',
      source: leadData.source || 'website',
      value: leadData.value ? parseFloat(leadData.value) : null,
      budget: leadData.budget ? parseFloat(leadData.budget) : null,
      timeline: leadData.timeline || null,
      assignedTo: leadData.assignedTo || null,
      assignedAt: leadData.assignedTo ? now : null,
      assignmentHistory: leadData.assignedTo ? [{
        assignedTo: leadData.assignedTo,
        assignedAt: now,
        assignedBy: 1, // Current user
        status: 'active'
      }] : [],
      createdAt: now,
      updatedAt: now,
      qualification: leadData.qualification || {
        budget: false,
        authority: false,
        need: false,
        timeline: false,
        decisionProcess: false,
        competition: false,
        fit: false
      }
    }
    
    // Calculate initial score
    newLead.score = calculateLeadScore(newLead);
    newLead.scoreHistory = addScoreHistory(newLead, newLead.score, 'Lead created');
    
    leads = [newLead, ...leads]
    return { ...newLead }
  },

async update(id, leadData) {
    await delay(300)
    const index = leads.findIndex(l => l.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Lead not found")
    }
    
    // Validate email if provided
    if (leadData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(leadData.email)) {
      throw new Error("Please enter a valid email address")
    }
    
    const previousLead = leads[index];
const previousAssignee = previousLead.assignedTo
    const newAssignee = leadData.assignedTo
    const now = new Date().toISOString()
    const assignmentChanged = newAssignee !== previousAssignee
    
    // Prepare assignment history entry if assignment changed
    const currentHistory = previousLead.assignmentHistory || []
    const newHistoryEntry = assignmentChanged ? {
      assignedTo: newAssignee,
      assignedAt: now,
      assignedBy: 1, // Current user
      previousAssignee: previousAssignee,
      status: newAssignee ? 'active' : 'unassigned'
    } : null
    
    const updatedLead = {
      ...previousLead,
      ...leadData,
      Id: parseInt(id),
      value: leadData.value ? parseFloat(leadData.value) : previousLead.value,
      budget: leadData.budget ? parseFloat(leadData.budget) : previousLead.budget,
      timeline: leadData.timeline || previousLead.timeline,
      assignedTo: newAssignee || null,
      assignedAt: assignmentChanged && newAssignee ? now : previousLead.assignedAt,
      assignmentHistory: newHistoryEntry ? [...currentHistory, newHistoryEntry] : currentHistory,
      qualification: leadData.qualification || previousLead.qualification || {
        budget: false,
        authority: false,
        need: false,
        timeline: false,
        decisionProcess: false,
        competition: false,
        fit: false
      },
      updatedAt: now
    }
    
    // Recalculate score
    const previousScore = previousLead.score || 0;
    updatedLead.score = calculateLeadScore(updatedLead);
    updatedLead.scoreHistory = addScoreHistory(updatedLead, updatedLead.score, 
      previousScore !== updatedLead.score ? 'Lead updated' : 'No score change');
    
    leads[index] = updatedLead
    return { ...updatedLead }
  },

async delete(id) {
    await delay(200)
    leads = leads.filter(l => l.Id !== parseInt(id))
    return true
  },

  // Get leads sorted by score (highest first)
  async getLeadsByScore() {
    await delay(200)
    return leads
      .slice()
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .map(lead => ({ ...lead }))
  },
  
  // Get scoring rules configuration
  getScoringRules() {
    return { ...SCORING_RULES }
  },
  
  // Recalculate all lead scores (useful for rule updates)
  async recalculateAllScores() {
    await delay(500)
    leads = leads.map(lead => {
      const previousScore = lead.score || 0;
      const newScore = calculateLeadScore(lead);
      return {
        ...lead,
        score: newScore,
        scoreHistory: addScoreHistory(lead, newScore, 'Bulk recalculation'),
        updatedAt: new Date().toISOString()
      }
    });
    return leads.map(lead => ({ ...lead }))
},

  async bulkAssign(leadIds, assigneeId) {
    await delay(400)
    const now = new Date().toISOString()
    const idsToUpdate = leadIds.map(id => parseInt(id))
    
    // Validate assignee exists (basic validation)
    if (assigneeId !== null && (typeof assigneeId !== 'number' || assigneeId <= 0)) {
      throw new Error("Invalid assignee selected")
    }
    
    let updatedCount = 0
    leads = leads.map(lead => {
      if (idsToUpdate.includes(lead.Id)) {
        const previousAssignee = lead.assignedTo
        const assignmentChanged = assigneeId !== previousAssignee
        
        if (assignmentChanged) {
          const currentHistory = lead.assignmentHistory || []
          const newHistoryEntry = {
            assignedTo: assigneeId,
            assignedAt: now,
            assignedBy: 1, // Current user
            previousAssignee: previousAssignee,
            status: assigneeId ? 'active' : 'unassigned',
            bulkAssignment: true
          }
          
          updatedCount++
          const updatedLead = {
            ...lead,
            assignedTo: assigneeId,
            assignedAt: assigneeId ? now : null,
            assignmentHistory: [...currentHistory, newHistoryEntry],
            updatedAt: now
          }
          
          // Recalculate score for assignment change
          const previousScore = lead.score || 0
          updatedLead.score = calculateLeadScore(updatedLead)
          updatedLead.scoreHistory = addScoreHistory(updatedLead, updatedLead.score, 'Bulk assignment')
          
          return updatedLead
        }
      }
      return lead
    })
    
    return { updated: updatedCount, total: idsToUpdate.length }
  }
}