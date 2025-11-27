import { getApperClient } from '@/services/apperClient'
import { toast } from 'react-toastify'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

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
      'nurturing': 60,
      'converted': 100,
      'lost': 5
    }
  },
  completeness: {
    weight: 0.15,
    fields: ['title_c', 'company_c', 'contactName_c', 'email_c', 'phone_c', 'value_c', 'budget_c', 'timeline_c', 'notes_c']
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
    
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.fetchRecords('lead_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "company_c"}},
          {"field": {"Name": "contactName_c"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "phone_c"}},
          {"field": {"Name": "value_c"}},
          {"field": {"Name": "budget_c"}},
          {"field": {"Name": "timeline_c"}},
          {"field": {"Name": "source_c"}},
          {"field": {"Name": "stage_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "assignedTo_c"}},
          {"field": {"Name": "assignmentHistory_c"}},
          {"field": {"Name": "qualification_c"}},
          {"field": {"Name": "score_c"}},
          {"field": {"Name": "scoreHistory_c"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      // Map database fields to frontend format
      return (response.data || []).map(lead => {
        const mappedLead = {
          Id: lead.Id,
          title: lead.title_c || lead.Name,
          company: lead.company_c,
          contactName: lead.contactName_c,
          email: lead.email_c,
          phone: lead.phone_c,
          value: parseFloat(lead.value_c) || null,
          budget: parseFloat(lead.budget_c) || null,
          timeline: lead.timeline_c,
          source: lead.source_c || 'website',
          stage: lead.stage_c || 'new',
          notes: lead.notes_c,
          assignedTo: lead.assignedTo_c,
          assignmentHistory: lead.assignmentHistory_c ? JSON.parse(lead.assignmentHistory_c) : [],
          qualification: lead.qualification_c ? JSON.parse(lead.qualification_c) : {
            budget: false,
            authority: false,
            need: false,
            timeline: false,
            decisionProcess: false,
            competition: false,
            fit: false
          },
          score: parseInt(lead.score_c) || 0,
          scoreHistory: lead.scoreHistory_c ? JSON.parse(lead.scoreHistory_c) : [],
          tags: lead.Tags ? lead.Tags.split(',') : [],
          createdAt: lead.CreatedOn,
          updatedAt: lead.ModifiedOn
        };
        
        // Recalculate score if not present
        if (!mappedLead.score) {
          mappedLead.score = calculateLeadScore(mappedLead);
        }
        
        return mappedLead;
      });
      
    } catch (error) {
      console.error("Error fetching leads:", error);
      return [];
    }
  },

  async getByAssignee(assigneeId) {
    await delay(350)
    const id = parseInt(assigneeId)
    if (!id || isNaN(id)) return []

    try {
      const apperClient = getApperClient();
      if (!apperClient) return [];

      const response = await apperClient.fetchRecords('lead_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "company_c"}},
          {"field": {"Name": "stage_c"}},
          {"field": {"Name": "value_c"}},
          {"field": {"Name": "assignedTo_c"}},
          {"field": {"Name": "score_c"}},
          {"field": {"Name": "CreatedOn"}}
        ],
        where: [{
          "FieldName": "assignedTo_c",
          "Operator": "EqualTo",
          "Values": [id]
        }]
      });

      if (!response.success) return [];

      return (response.data || []).map(lead => ({
        Id: lead.Id,
        title: lead.title_c || lead.Name,
        company: lead.company_c,
        stage: lead.stage_c || 'new',
        value: parseFloat(lead.value_c) || null,
        assignedTo: lead.assignedTo_c,
        score: parseInt(lead.score_c) || 0,
        createdAt: lead.CreatedOn
      }));
      
    } catch (error) {
      console.error("Error fetching leads by assignee:", error);
      return [];
    }
  },

  async getById(id) {
    await delay(200)
    
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.getRecordById('lead_c', parseInt(id), {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "company_c"}},
          {"field": {"Name": "contactName_c"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "phone_c"}},
          {"field": {"Name": "value_c"}},
          {"field": {"Name": "budget_c"}},
          {"field": {"Name": "timeline_c"}},
          {"field": {"Name": "source_c"}},
          {"field": {"Name": "stage_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "assignedTo_c"}},
          {"field": {"Name": "assignmentHistory_c"}},
          {"field": {"Name": "qualification_c"}},
          {"field": {"Name": "score_c"}},
          {"field": {"Name": "scoreHistory_c"}},
          {"field": {"Name": "Tags"}}
        ]
      });

      if (!response.success || !response.data) {
        throw new Error("Lead not found");
      }

      const lead = response.data;
      return {
        Id: lead.Id,
        title: lead.title_c || lead.Name,
        company: lead.company_c,
        contactName: lead.contactName_c,
        email: lead.email_c,
        phone: lead.phone_c,
        value: parseFloat(lead.value_c) || null,
        budget: parseFloat(lead.budget_c) || null,
        timeline: lead.timeline_c,
        source: lead.source_c || 'website',
        stage: lead.stage_c || 'new',
        notes: lead.notes_c,
        assignedTo: lead.assignedTo_c,
        assignmentHistory: lead.assignmentHistory_c ? JSON.parse(lead.assignmentHistory_c) : [],
        qualification: lead.qualification_c ? JSON.parse(lead.qualification_c) : {
          budget: false,
          authority: false,
          need: false,
          timeline: false,
          decisionProcess: false,
          competition: false,
          fit: false
        },
        score: parseInt(lead.score_c) || 0,
        scoreHistory: lead.scoreHistory_c ? JSON.parse(lead.scoreHistory_c) : [],
        tags: lead.Tags ? lead.Tags.split(',') : []
      };
      
    } catch (error) {
      console.error("Error fetching lead by ID:", error);
      throw error;
    }
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

    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const now = new Date().toISOString()
      const qualification = leadData.qualification || {
        budget: false,
        authority: false,
        need: false,
        timeline: false,
        decisionProcess: false,
        competition: false,
        fit: false
      };

      const assignmentHistory = leadData.assignedTo ? [{
        assignedTo: leadData.assignedTo,
        assignedAt: now,
        assignedBy: 1, // Current user
        status: 'active'
      }] : [];

      // Calculate initial score
      const leadForScore = {
        ...leadData,
        stage: leadData.stage || 'new',
        qualification,
        createdAt: now,
        updatedAt: now
      };
      const score = calculateLeadScore(leadForScore);
      const scoreHistory = addScoreHistory(leadForScore, score, 'Lead created');

      const params = {
        records: [{
          Name: leadData.title,
          title_c: leadData.title,
          company_c: leadData.company,
          contactName_c: leadData.contactName || '',
          email_c: leadData.email || '',
          phone_c: leadData.phone || '',
          value_c: leadData.value ? parseFloat(leadData.value) : null,
          budget_c: leadData.budget ? parseFloat(leadData.budget) : null,
          timeline_c: leadData.timeline || '',
          source_c: leadData.source || 'website',
          stage_c: leadData.stage || 'new',
          notes_c: leadData.notes || '',
          assignedTo_c: leadData.assignedTo || null,
          assignmentHistory_c: assignmentHistory.length > 0 ? JSON.stringify(assignmentHistory) : '',
          qualification_c: JSON.stringify(qualification),
          score_c: score,
          scoreHistory_c: JSON.stringify(scoreHistory),
          Tags: leadData.tags ? leadData.tags.join(',') : ''
        }]
      };

      const response = await apperClient.createRecord('lead_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} leads: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          const createdLead = successful[0].data;
          return {
            Id: createdLead.Id,
            title: createdLead.title_c,
            company: createdLead.company_c,
            contactName: createdLead.contactName_c,
            email: createdLead.email_c,
            phone: createdLead.phone_c,
            value: parseFloat(createdLead.value_c) || null,
            budget: parseFloat(createdLead.budget_c) || null,
            timeline: createdLead.timeline_c,
            source: createdLead.source_c,
            stage: createdLead.stage_c,
            notes: createdLead.notes_c,
            assignedTo: createdLead.assignedTo_c,
            assignmentHistory,
            qualification,
            score,
            scoreHistory,
            tags: leadData.tags || [],
            createdAt: now
          };
        }
      }

      throw new Error("Failed to create lead");
      
    } catch (error) {
      console.error("Error creating lead:", error);
      throw error;
    }
  },

  async update(id, leadData) {
    await delay(300)
    
    // Validate email if provided
    if (leadData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(leadData.email)) {
      throw new Error("Please enter a valid email address")
    }

    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      // Recalculate score
      const score = calculateLeadScore(leadData);
      const scoreHistory = addScoreHistory(leadData, score, 'Lead updated');

      const params = {
        records: [{
          Id: parseInt(id),
          Name: leadData.title,
          title_c: leadData.title,
          company_c: leadData.company,
          contactName_c: leadData.contactName || '',
          email_c: leadData.email || '',
          phone_c: leadData.phone || '',
          value_c: leadData.value ? parseFloat(leadData.value) : null,
          budget_c: leadData.budget ? parseFloat(leadData.budget) : null,
          timeline_c: leadData.timeline || '',
          source_c: leadData.source || 'website',
          stage_c: leadData.stage || 'new',
          notes_c: leadData.notes || '',
          assignedTo_c: leadData.assignedTo || null,
          assignmentHistory_c: leadData.assignmentHistory ? JSON.stringify(leadData.assignmentHistory) : '',
          qualification_c: leadData.qualification ? JSON.stringify(leadData.qualification) : '',
          score_c: score,
          scoreHistory_c: JSON.stringify(scoreHistory),
          Tags: leadData.tags ? leadData.tags.join(',') : ''
        }]
      };

      const response = await apperClient.updateRecord('lead_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} leads: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          const updatedLead = successful[0].data;
          return {
            Id: updatedLead.Id,
            title: updatedLead.title_c,
            company: updatedLead.company_c,
            contactName: updatedLead.contactName_c,
            email: updatedLead.email_c,
            phone: updatedLead.phone_c,
            value: parseFloat(updatedLead.value_c) || null,
            budget: parseFloat(updatedLead.budget_c) || null,
            timeline: updatedLead.timeline_c,
            source: updatedLead.source_c,
            stage: updatedLead.stage_c,
            notes: updatedLead.notes_c,
            assignedTo: updatedLead.assignedTo_c,
            assignmentHistory: leadData.assignmentHistory || [],
            qualification: leadData.qualification || {},
            score,
            scoreHistory,
            tags: leadData.tags || []
          };
        }
      }

      throw new Error("Failed to update lead");
      
    } catch (error) {
      console.error("Error updating lead:", error);
      throw error;
    }
  },

  async delete(id) {
    await delay(200)
    
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.deleteRecord('lead_c', {
        RecordIds: [parseInt(id)]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      return true;
      
    } catch (error) {
      console.error("Error deleting lead:", error);
      throw error;
    }
  },

  // Get leads sorted by score (highest first)
  async getLeadsByScore() {
    await delay(200)
    
    try {
      const leads = await this.getAll();
      return leads
        .slice()
        .sort((a, b) => (b.score || 0) - (a.score || 0));
      
    } catch (error) {
      console.error("Error fetching leads by score:", error);
      return [];
    }
  },
  
  // Get scoring rules configuration
  getScoringRules() {
    return { ...SCORING_RULES }
  },
  
  // Recalculate all lead scores (useful for rule updates)
  async recalculateAllScores() {
    await delay(500)
    
    try {
      const leads = await this.getAll();
      const updatePromises = leads.map(lead => {
        const newScore = calculateLeadScore(lead);
        const scoreHistory = addScoreHistory(lead, newScore, 'Bulk recalculation');
        return this.update(lead.Id, { ...lead, score: newScore, scoreHistory });
      });
      
      const results = await Promise.all(updatePromises);
      return results;
      
    } catch (error) {
      console.error("Error recalculating all lead scores:", error);
      return [];
    }
  },

  async bulkAssign(leadIds, assigneeId) {
    await delay(400)
    
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const records = leadIds.map(id => ({
        Id: parseInt(id),
        assignedTo_c: assigneeId
      }));

      const params = { records };
      const response = await apperClient.updateRecord('lead_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      const successful = response.results?.filter(r => r.success) || [];
      return { updated: successful.length, total: leadIds.length };
      
    } catch (error) {
      console.error("Error bulk assigning leads:", error);
      throw error;
    }
  }
}