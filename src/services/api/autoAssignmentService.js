import { teamMemberService } from './teamMemberService';
import { getApperClient } from '@/services/apperClient'
import { toast } from 'react-toastify'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const autoAssignmentService = {
  // Rule Management
  async getAllRules() {
    await delay(200);
    
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.fetchRecords('assignment_rule_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "entity_c"}},
          {"field": {"Name": "isActive_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "criteria_c"}},
          {"field": {"Name": "fallbackStrategy_c"}},
          {"field": {"Name": "assignTo_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      return (response.data || []).map(rule => ({
        Id: rule.Id,
        name: rule.Name,
        entity: rule.entity_c,
        isActive: rule.isActive_c,
        priority: rule.priority_c || 1,
        criteria: rule.criteria_c ? JSON.parse(rule.criteria_c) : { conditions: [] },
        fallbackStrategy: rule.fallbackStrategy_c || 'round_robin',
        assignTo: rule.assignTo_c,
        createdAt: rule.CreatedOn,
        updatedAt: rule.ModifiedOn
      }));
      
    } catch (error) {
      console.error("Error fetching assignment rules:", error);
      return [];
    }
  },

  async getRulesByEntity(entity) {
    await delay(150);
    
    try {
      const apperClient = getApperClient();
      if (!apperClient) return [];

      const response = await apperClient.fetchRecords('assignment_rule_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "entity_c"}},
          {"field": {"Name": "isActive_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "criteria_c"}},
          {"field": {"Name": "fallbackStrategy_c"}}
        ],
        where: [
          {
            "FieldName": "entity_c",
            "Operator": "EqualTo",
            "Values": [entity]
          },
          {
            "FieldName": "isActive_c",
            "Operator": "EqualTo",
            "Values": [true]
          }
        ],
        orderBy: [{
          "fieldName": "priority_c",
          "sorttype": "ASC"
        }]
      });

      if (!response.success) return [];

      return (response.data || []).map(rule => ({
        Id: rule.Id,
        name: rule.Name,
        entity: rule.entity_c,
        isActive: rule.isActive_c,
        priority: rule.priority_c || 1,
        criteria: rule.criteria_c ? JSON.parse(rule.criteria_c) : { conditions: [] },
        fallbackStrategy: rule.fallbackStrategy_c || 'round_robin'
      }));
      
    } catch (error) {
      console.error("Error fetching rules by entity:", error);
      return [];
    }
  },

  async getRuleById(id) {
    await delay(100);
    
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.getRecordById('assignment_rule_c', parseInt(id), {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "entity_c"}},
          {"field": {"Name": "isActive_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "criteria_c"}},
          {"field": {"Name": "fallbackStrategy_c"}},
          {"field": {"Name": "assignTo_c"}}
        ]
      });

      if (!response.success || !response.data) {
        throw new Error("Assignment rule not found");
      }

      const rule = response.data;
      return {
        Id: rule.Id,
        name: rule.Name,
        entity: rule.entity_c,
        isActive: rule.isActive_c,
        priority: rule.priority_c || 1,
        criteria: rule.criteria_c ? JSON.parse(rule.criteria_c) : { conditions: [] },
        fallbackStrategy: rule.fallbackStrategy_c || 'round_robin',
        assignTo: rule.assignTo_c
      };
      
    } catch (error) {
      console.error("Error fetching rule by ID:", error);
      throw error;
    }
  },

  async createRule(ruleData) {
    await delay(300);
    
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        records: [{
          Name: ruleData.name,
          entity_c: ruleData.entity,
          isActive_c: ruleData.isActive !== false,
          priority_c: ruleData.priority || 1,
          criteria_c: JSON.stringify(ruleData.criteria || { conditions: [] }),
          fallbackStrategy_c: ruleData.fallbackStrategy || 'round_robin',
          assignTo_c: ruleData.assignTo || null
        }]
      };

      const response = await apperClient.createRecord('assignment_rule_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results && response.results[0].success) {
        const createdRule = response.results[0].data;
        return {
          Id: createdRule.Id,
          name: createdRule.Name,
          entity: createdRule.entity_c,
          isActive: createdRule.isActive_c,
          priority: createdRule.priority_c,
          criteria: JSON.parse(createdRule.criteria_c),
          fallbackStrategy: createdRule.fallbackStrategy_c,
          assignTo: createdRule.assignTo_c
        };
      }

      throw new Error("Failed to create assignment rule");
      
    } catch (error) {
      console.error("Error creating rule:", error);
      throw error;
    }
  },

  async updateRule(id, updateData) {
    await delay(250);
    
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        records: [{
          Id: parseInt(id),
          Name: updateData.name,
          entity_c: updateData.entity,
          isActive_c: updateData.isActive !== false,
          priority_c: updateData.priority || 1,
          criteria_c: JSON.stringify(updateData.criteria || { conditions: [] }),
          fallbackStrategy_c: updateData.fallbackStrategy || 'round_robin',
          assignTo_c: updateData.assignTo || null
        }]
      };

      const response = await apperClient.updateRecord('assignment_rule_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results && response.results[0].success) {
        const updatedRule = response.results[0].data;
        return {
          Id: updatedRule.Id,
          name: updatedRule.Name,
          entity: updatedRule.entity_c,
          isActive: updatedRule.isActive_c,
          priority: updatedRule.priority_c,
          criteria: JSON.parse(updatedRule.criteria_c),
          fallbackStrategy: updatedRule.fallbackStrategy_c,
          assignTo: updatedRule.assignTo_c
        };
      }

      throw new Error("Failed to update assignment rule");
      
    } catch (error) {
      console.error("Error updating rule:", error);
      throw error;
    }
  },

  async deleteRule(id) {
    await delay(200);
    
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.deleteRecord('assignment_rule_c', {
        RecordIds: [parseInt(id)]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      return { success: true };
      
    } catch (error) {
      console.error("Error deleting rule:", error);
      throw error;
    }
  },

  async toggleRuleStatus(id) {
    await delay(150);
    
    try {
      const rule = await this.getRuleById(id);
      const updatedRule = await this.updateRule(id, {
        ...rule,
        isActive: !rule.isActive
      });
      
      return updatedRule;
      
    } catch (error) {
      console.error("Error toggling rule status:", error);
      throw error;
    }
  },

  // Auto-Assignment Core Logic
  async autoAssign(entity, entityData) {
    await delay(100);
    
    try {
      const rules = await this.getRulesByEntity(entity);
      const teamMembers = await teamMemberService.getAll();
      
      // Try to find a matching rule
      for (const rule of rules) {
        const assignedTo = await this.evaluateRule(rule, entityData, teamMembers);
        if (assignedTo) {
          return {
            assignedTo: assignedTo,
            assignmentReason: `Auto-assigned via rule: ${rule.name}`,
            ruleUsed: rule.Id
          };
        }
      }
      
      // No rules matched, use fallback strategy
      return await this.fallbackAssignment(entity, entityData, teamMembers);
      
    } catch (error) {
      console.error('Auto-assignment error:', error);
      // Return null to indicate manual assignment needed
      return null;
    }
  },

  async evaluateRule(rule, entityData, teamMembers) {
    const { criteria } = rule;
    
    for (const condition of criteria.conditions) {
      if (this.matchesCondition(condition, entityData)) {
        // Check if assigned team member is available
        const assignedMember = teamMembers.find(m => m.Id === condition.assignTo);
        if (assignedMember && assignedMember.availability === 'available') {
          return condition.assignTo;
        }
      }
    }
    
    return null;
  },

  matchesCondition(condition, data) {
    const fieldValue = data[condition.field];
    
    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;
      case 'not_equals':
        return fieldValue !== condition.value;
      case 'contains':
        return fieldValue && fieldValue.toString().toLowerCase().includes(condition.value.toLowerCase());
      case 'greater_than':
        return parseFloat(fieldValue) > parseFloat(condition.value);
      case 'less_than':
        return parseFloat(fieldValue) < parseFloat(condition.value);
      case 'between':
        const numValue = parseFloat(fieldValue);
        return numValue >= condition.value[0] && numValue <= condition.value[1];
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(fieldValue);
      default:
        return false;
    }
  },

  async fallbackAssignment(entity, entityData, teamMembers) {
    // Default fallback: round-robin assignment to available members
    const availableMembers = teamMembers.filter(m => m.availability === 'available');
    
    if (availableMembers.length === 0) {
      return null; // No available members
    }
    
    // Simple round-robin based on current assignment count
    const memberWorkloads = await Promise.all(
      availableMembers.map(async (member) => ({
        ...member,
        workload: await teamMemberService.getWorkload(member.Id)
      }))
    );
    
    // Sort by workload (least first)
    memberWorkloads.sort((a, b) => a.workload.totalActive - b.workload.totalActive);
    
    return {
      assignedTo: memberWorkloads[0].Id,
      assignmentReason: "Auto-assigned via fallback strategy (least workload)",
      ruleUsed: null
    };
  },

  // Assignment History - Mock implementation since no history table exists
  async getAssignmentHistory(entityType, entityId) {
    await delay(100);
    return []; // Return empty array for now
  },

  async getAllAssignmentHistory() {
    await delay(150);
    return []; // Return empty array for now
  },

  // Statistics and Analytics - Mock implementation
  async getAssignmentStats() {
    await delay(200);
    return {
      totalAssignments: 0,
      ruleBasedAssignments: 0,
      fallbackAssignments: 0,
      assignmentsByEntity: {},
      assignmentsByMember: {},
      recentActivity: []
    };
  },

  // Validation helpers
  validateRuleData(ruleData) {
    const errors = [];
    
    if (!ruleData.name || ruleData.name.trim().length === 0) {
      errors.push("Rule name is required");
    }
    
    if (!ruleData.entity || !['contacts', 'leads', 'deals', 'tasks'].includes(ruleData.entity)) {
      errors.push("Valid entity type is required");
    }
    
    if (!ruleData.criteria || !ruleData.criteria.conditions || ruleData.criteria.conditions.length === 0) {
      errors.push("At least one criteria condition is required");
    }
    
    if (ruleData.criteria && ruleData.criteria.conditions) {
      ruleData.criteria.conditions.forEach((condition, index) => {
        if (!condition.field) {
          errors.push(`Condition ${index + 1}: Field is required`);
        }
        if (!condition.operator) {
          errors.push(`Condition ${index + 1}: Operator is required`);
        }
        if (condition.value === undefined || condition.value === null || condition.value === '') {
          errors.push(`Condition ${index + 1}: Value is required`);
        }
        if (!condition.assignTo) {
          errors.push(`Condition ${index + 1}: Assignment target is required`);
        }
      });
    }
    
    return errors;
  }
};