import { getApperClient } from '@/services/apperClient'
import { toast } from 'react-toastify'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const dealService = {
  async getAll() {
    await delay(400)
    
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.fetchRecords('deal_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "amount_c"}},
          {"field": {"Name": "stage_c"}},
          {"field": {"Name": "probability_c"}},
          {"field": {"Name": "closeDate_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "dealOwner_c"}},
          {"field": {"Name": "assignmentHistory_c"}},
          {"field": {"Name": "stageHistory_c"}},
          {"field": {"Name": "contactId_c"}},
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
      return (response.data || []).map(deal => ({
        Id: deal.Id,
        title: deal.title_c || deal.Name,
        amount: parseFloat(deal.amount_c) || 0,
        stage: deal.stage_c || 'new',
        probability: parseInt(deal.probability_c) || 25,
        closeDate: deal.closeDate_c,
        notes: deal.notes_c,
        dealOwner: deal.dealOwner_c,
        assignmentHistory: deal.assignmentHistory_c ? JSON.parse(deal.assignmentHistory_c) : [],
        stageHistory: deal.stageHistory_c ? JSON.parse(deal.stageHistory_c) : [],
        contactId: deal.contactId_c?.Id || deal.contactId_c,
        contactName: deal.contactId_c?.Name,
        tags: deal.Tags ? deal.Tags.split(',') : [],
        createdAt: deal.CreatedOn,
        updatedAt: deal.ModifiedOn
      }));
      
    } catch (error) {
      console.error("Error fetching deals:", error);
      return [];
    }
  },

  async getByAssignee(assigneeId) {
    await delay(400)
    const id = parseInt(assigneeId)
    if (!id || isNaN(id)) return []

    try {
      const apperClient = getApperClient();
      if (!apperClient) return [];

      const response = await apperClient.fetchRecords('deal_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "amount_c"}},
          {"field": {"Name": "stage_c"}},
          {"field": {"Name": "dealOwner_c"}},
          {"field": {"Name": "CreatedOn"}}
        ],
        where: [{
          "FieldName": "dealOwner_c",
          "Operator": "EqualTo",
          "Values": [id]
        }]
      });

      if (!response.success) return [];

      return (response.data || []).map(deal => ({
        Id: deal.Id,
        title: deal.title_c || deal.Name,
        amount: parseFloat(deal.amount_c) || 0,
        stage: deal.stage_c || 'new',
        dealOwner: deal.dealOwner_c,
        createdAt: deal.CreatedOn
      }));
      
    } catch (error) {
      console.error("Error fetching deals by assignee:", error);
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

      const response = await apperClient.getRecordById('deal_c', parseInt(id), {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "amount_c"}},
          {"field": {"Name": "stage_c"}},
          {"field": {"Name": "probability_c"}},
          {"field": {"Name": "closeDate_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "dealOwner_c"}},
          {"field": {"Name": "assignmentHistory_c"}},
          {"field": {"Name": "stageHistory_c"}},
          {"field": {"Name": "contactId_c"}},
          {"field": {"Name": "Tags"}}
        ]
      });

      if (!response.success || !response.data) {
        throw new Error("Deal not found");
      }

      const deal = response.data;
      return {
        Id: deal.Id,
        title: deal.title_c || deal.Name,
        amount: parseFloat(deal.amount_c) || 0,
        stage: deal.stage_c || 'new',
        probability: parseInt(deal.probability_c) || 25,
        closeDate: deal.closeDate_c,
        notes: deal.notes_c,
        dealOwner: deal.dealOwner_c,
        assignmentHistory: deal.assignmentHistory_c ? JSON.parse(deal.assignmentHistory_c) : [],
        stageHistory: deal.stageHistory_c ? JSON.parse(deal.stageHistory_c) : [],
        contactId: deal.contactId_c?.Id || deal.contactId_c,
        contactName: deal.contactId_c?.Name,
        tags: deal.Tags ? deal.Tags.split(',') : []
      };
      
    } catch (error) {
      console.error("Error fetching deal by ID:", error);
      throw error;
    }
  },

  async create(dealData) {
    await delay(350)

    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const now = new Date().toISOString()
      const assignmentHistory = dealData.dealOwner ? [{
        assignedTo: dealData.dealOwner,
        assignedAt: now,
        assignedBy: 1, // Current user
        status: 'active'
      }] : [];

      const stageHistory = [{
        stage: dealData.stage || 'new',
        enteredAt: now,
        duration: 0
      }];

      const params = {
        records: [{
          Name: dealData.title || 'New Deal',
          title_c: dealData.title || '',
          amount_c: parseFloat(dealData.amount) || 0,
          stage_c: dealData.stage || 'new',
          probability_c: parseInt(dealData.probability) || 25,
          closeDate_c: dealData.closeDate || '',
          notes_c: dealData.notes || '',
          dealOwner_c: dealData.dealOwner || null,
          assignmentHistory_c: JSON.stringify(assignmentHistory),
          stageHistory_c: JSON.stringify(stageHistory),
          contactId_c: dealData.contactId || null,
          Tags: dealData.tags ? dealData.tags.join(',') : ''
        }]
      };

      const response = await apperClient.createRecord('deal_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} deals: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          const createdDeal = successful[0].data;
          return {
            Id: createdDeal.Id,
            title: createdDeal.title_c,
            amount: parseFloat(createdDeal.amount_c) || 0,
            stage: createdDeal.stage_c,
            probability: parseInt(createdDeal.probability_c) || 25,
            closeDate: createdDeal.closeDate_c,
            notes: createdDeal.notes_c,
            dealOwner: createdDeal.dealOwner_c,
            assignmentHistory,
            stageHistory,
            contactId: createdDeal.contactId_c,
            tags: dealData.tags || [],
            createdAt: now
          };
        }
      }

      throw new Error("Failed to create deal");
      
    } catch (error) {
      console.error("Error creating deal:", error);
      throw error;
    }
  },

  async update(id, dealData) {
    await delay(350)

    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        records: [{
          Id: parseInt(id),
          Name: dealData.title || 'Deal',
          title_c: dealData.title || '',
          amount_c: parseFloat(dealData.amount) || 0,
          stage_c: dealData.stage || 'new',
          probability_c: parseInt(dealData.probability) || 25,
          closeDate_c: dealData.closeDate || '',
          notes_c: dealData.notes || '',
          dealOwner_c: dealData.dealOwner || null,
          assignmentHistory_c: dealData.assignmentHistory ? JSON.stringify(dealData.assignmentHistory) : '',
          stageHistory_c: dealData.stageHistory ? JSON.stringify(dealData.stageHistory) : '',
          contactId_c: dealData.contactId || null,
          Tags: dealData.tags ? dealData.tags.join(',') : ''
        }]
      };

      const response = await apperClient.updateRecord('deal_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} deals: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          const updatedDeal = successful[0].data;
          return {
            Id: updatedDeal.Id,
            title: updatedDeal.title_c,
            amount: parseFloat(updatedDeal.amount_c) || 0,
            stage: updatedDeal.stage_c,
            probability: parseInt(updatedDeal.probability_c) || 25,
            closeDate: updatedDeal.closeDate_c,
            notes: updatedDeal.notes_c,
            dealOwner: updatedDeal.dealOwner_c,
            assignmentHistory: dealData.assignmentHistory || [],
            stageHistory: dealData.stageHistory || [],
            contactId: updatedDeal.contactId_c,
            tags: dealData.tags || []
          };
        }
      }

      throw new Error("Failed to update deal");
      
    } catch (error) {
      console.error("Error updating deal:", error);
      throw error;
    }
  },

  async updateStage(id, newStage) {
    await delay(350)
    
    try {
      // First get current deal to update stage history
      const currentDeal = await this.getById(id);
      const now = new Date().toISOString();
      
      // Calculate duration in current stage
      const currentStageEntry = currentDeal.stageHistory?.[currentDeal.stageHistory.length - 1];
      const currentStageDuration = currentStageEntry?.enteredAt 
        ? new Date(now) - new Date(currentStageEntry.enteredAt)
        : 0;
      
      // Update stage history
      const updatedHistory = [...(currentDeal.stageHistory || [])];
      
      // Update the last entry with exit time and duration
      if (updatedHistory.length > 0) {
        const lastEntry = updatedHistory[updatedHistory.length - 1];
        lastEntry.exitedAt = now;
        lastEntry.duration = currentStageDuration;
      }
      
      // Add new stage entry
      updatedHistory.push({
        stage: newStage,
        enteredAt: now,
        duration: 0
      });

      return await this.update(id, {
        ...currentDeal,
        stage: newStage,
        stageHistory: updatedHistory
      });
      
    } catch (error) {
      console.error("Error updating deal stage:", error);
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

      const response = await apperClient.deleteRecord('deal_c', {
        RecordIds: [parseInt(id)]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      return true;
      
    } catch (error) {
      console.error("Error deleting deal:", error);
      throw error;
    }
  },

  async bulkUpdateStage(dealIds, stage) {
    await delay(400)
    
    try {
      const updatePromises = dealIds.map(id => this.updateStage(parseInt(id), stage));
      await Promise.all(updatePromises);
      return true;
      
    } catch (error) {
      console.error("Error bulk updating deal stages:", error);
      throw error;
    }
  },

  async getByStage(stage) {
    await delay(300)
    
    try {
      const apperClient = getApperClient();
      if (!apperClient) return [];

      const response = await apperClient.fetchRecords('deal_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "amount_c"}},
          {"field": {"Name": "stage_c"}}
        ],
        where: [{
          "FieldName": "stage_c",
          "Operator": "EqualTo",
          "Values": [stage]
        }]
      });

      if (!response.success) return [];

      return (response.data || []).map(deal => ({
        Id: deal.Id,
        title: deal.title_c || deal.Name,
        amount: parseFloat(deal.amount_c) || 0,
        stage: deal.stage_c
      }));
      
    } catch (error) {
      console.error("Error fetching deals by stage:", error);
      return [];
    }
  },

  async getStageDurationAnalytics() {
    await delay(200)
    
    try {
      const deals = await this.getAll();
      const stageAnalytics = {};
      const currentStageData = {};
      
      deals.forEach(deal => {
        if (deal.stageHistory) {
          deal.stageHistory.forEach(entry => {
            if (!stageAnalytics[entry.stage]) {
              stageAnalytics[entry.stage] = {
                totalDuration: 0,
                completedTransitions: 0,
                averageDuration: 0
              };
            }
            
            if (entry.duration > 0) {
              stageAnalytics[entry.stage].totalDuration += entry.duration;
              stageAnalytics[entry.stage].completedTransitions += 1;
            }
          });
        }
        
        // Track current stage durations
        const currentStageEntry = deal.stageHistory?.[deal.stageHistory.length - 1];
        if (currentStageEntry?.enteredAt) {
          const currentDuration = new Date() - new Date(currentStageEntry.enteredAt);
          if (!currentStageData[deal.stage]) {
            currentStageData[deal.stage] = {
              totalCurrentDuration: 0,
              activeDeals: 0,
              averageCurrentDuration: 0
            };
          }
          currentStageData[deal.stage].totalCurrentDuration += currentDuration;
          currentStageData[deal.stage].activeDeals += 1;
        }
      });
      
      // Calculate averages
      Object.keys(stageAnalytics).forEach(stage => {
        const data = stageAnalytics[stage];
        if (data.completedTransitions > 0) {
          data.averageDuration = data.totalDuration / data.completedTransitions;
        }
      });
      
      Object.keys(currentStageData).forEach(stage => {
        const data = currentStageData[stage];
        if (data.activeDeals > 0) {
          data.averageCurrentDuration = data.totalCurrentDuration / data.activeDeals;
        }
      });
      
      return {
        historicalStageMetrics: stageAnalytics,
        currentStageMetrics: currentStageData
      };
      
    } catch (error) {
      console.error("Error getting stage duration analytics:", error);
      return { historicalStageMetrics: {}, currentStageMetrics: {} };
    }
  },

  async getPipelineMetrics() {
    await delay(200)
    
    try {
      const deals = await this.getAll();
      const totalValue = deals.reduce((sum, deal) => sum + (parseFloat(deal.amount) || 0), 0);
      const weightedValue = deals.reduce((sum, deal) => {
        const amount = parseFloat(deal.amount) || 0;
        const probability = parseInt(deal.probability) || 0;
        return sum + (amount * (probability / 100));
      }, 0);
      
      const stageDistribution = deals.reduce((acc, deal) => {
        acc[deal.stage] = (acc[deal.stage] || 0) + 1;
        return acc;
      }, {});

      return {
        totalValue,
        weightedValue,
        totalDeals: deals.length,
        stageDistribution
      };
      
    } catch (error) {
      console.error("Error getting pipeline metrics:", error);
      return { totalValue: 0, weightedValue: 0, totalDeals: 0, stageDistribution: {} };
    }
  },

  async getDealById(id) {
    return this.getById(id);
  },

  async getStageTransitionHistory(id) {
    await delay(200)
    
    try {
      const deal = await this.getById(id);
      return deal.stageHistory || [];
      
    } catch (error) {
      console.error("Error getting stage transition history:", error);
      return [];
    }
  },

  async bulkAssign(dealIds, assigneeId) {
    await delay(400)
    
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const records = dealIds.map(id => ({
        Id: parseInt(id),
        dealOwner_c: assigneeId
      }));

      const params = { records };
      const response = await apperClient.updateRecord('deal_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      const successful = response.results?.filter(r => r.success) || [];
      return { updated: successful.length, total: dealIds.length };
      
    } catch (error) {
      console.error("Error bulk assigning deals:", error);
      throw error;
    }
  }
}