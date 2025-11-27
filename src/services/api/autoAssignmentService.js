import { teamMemberService } from './teamMemberService';

const assignmentRules = [
  {
    Id: 1,
    name: "Lead Distribution by Source",
    entity: "leads",
    isActive: true,
    priority: 1,
    criteria: {
      type: "source_based",
      conditions: [
        { field: "source", operator: "equals", value: "website", assignTo: 1 },
        { field: "source", operator: "equals", value: "referral", assignTo: 2 },
        { field: "source", operator: "equals", value: "social_media", assignTo: 3 }
      ]
    },
    fallbackStrategy: "round_robin",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    Id: 2,
    name: "High Value Deal Assignment",
    entity: "deals",
    isActive: true,
    priority: 2,
    criteria: {
      type: "value_based",
      conditions: [
        { field: "amount", operator: "greater_than", value: 50000, assignTo: 1 },
        { field: "amount", operator: "between", value: [10000, 50000], assignTo: 2 }
      ]
    },
    fallbackStrategy: "least_workload",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    Id: 3,
    name: "Task Priority Assignment",
    entity: "tasks",
    isActive: true,
    priority: 3,
    criteria: {
      type: "priority_based",
      conditions: [
        { field: "priority", operator: "equals", value: "high", assignTo: 1 },
        { field: "priority", operator: "equals", value: "medium", assignTo: 2 }
      ]
    },
    fallbackStrategy: "availability_based",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    Id: 4,
    name: "Contact Company Size Rules",
    entity: "contacts",
    isActive: true,
    priority: 4,
    criteria: {
      type: "company_based",
      conditions: [
        { field: "company", operator: "contains", value: "Enterprise", assignTo: 1 },
        { field: "company", operator: "contains", value: "Corp", assignTo: 2 }
      ]
    },
    fallbackStrategy: "expertise_based",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

let nextId = 5;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Assignment history tracking
const assignmentHistory = [];

export const autoAssignmentService = {
  // Rule Management
  async getAllRules() {
    await delay(200);
    return [...assignmentRules];
  },

  async getRulesByEntity(entity) {
    await delay(150);
    return assignmentRules
      .filter(rule => rule.entity === entity && rule.isActive)
      .sort((a, b) => a.priority - b.priority);
  },

  async getRuleById(id) {
    await delay(100);
    const rule = assignmentRules.find(r => r.Id === parseInt(id));
    if (!rule) {
      throw new Error("Assignment rule not found");
    }
    return { ...rule };
  },

  async createRule(ruleData) {
    await delay(300);
    const newRule = {
      Id: nextId++,
      ...ruleData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    assignmentRules.push(newRule);
    return { ...newRule };
  },

  async updateRule(id, updateData) {
    await delay(250);
    const index = assignmentRules.findIndex(r => r.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Assignment rule not found");
    }
    
    assignmentRules[index] = {
      ...assignmentRules[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    return { ...assignmentRules[index] };
  },

  async deleteRule(id) {
    await delay(200);
    const index = assignmentRules.findIndex(r => r.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Assignment rule not found");
    }
    
    assignmentRules.splice(index, 1);
    return { success: true };
  },

  async toggleRuleStatus(id) {
    await delay(150);
    const rule = assignmentRules.find(r => r.Id === parseInt(id));
    if (!rule) {
      throw new Error("Assignment rule not found");
    }
    
    rule.isActive = !rule.isActive;
    rule.updatedAt = new Date().toISOString();
    return { ...rule };
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
          // Log assignment history
          const assignment = {
            Id: assignmentHistory.length + 1,
            entityType: entity,
            entityId: entityData.Id,
            assignedTo: assignedTo,
            assignedBy: "system",
            assignmentReason: `Auto-assigned via rule: ${rule.name}`,
            timestamp: new Date().toISOString(),
            ruleId: rule.Id
          };
          assignmentHistory.push(assignment);
          
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
    
    const assignment = {
      Id: assignmentHistory.length + 1,
      entityType: entity,
      entityId: entityData.Id,
      assignedTo: memberWorkloads[0].Id,
      assignedBy: "system",
      assignmentReason: "Auto-assigned via fallback strategy (least workload)",
      timestamp: new Date().toISOString(),
      ruleId: null
    };
    assignmentHistory.push(assignment);
    
    return {
      assignedTo: memberWorkloads[0].Id,
      assignmentReason: "Auto-assigned via fallback strategy (least workload)",
      ruleUsed: null
    };
  },

  // Assignment History
  async getAssignmentHistory(entityType, entityId) {
    await delay(100);
    return assignmentHistory
      .filter(h => h.entityType === entityType && h.entityId === parseInt(entityId))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },

  async getAllAssignmentHistory() {
    await delay(150);
    return [...assignmentHistory].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },

  // Statistics and Analytics
  async getAssignmentStats() {
    await delay(200);
    const stats = {
      totalAssignments: assignmentHistory.length,
      ruleBasedAssignments: assignmentHistory.filter(h => h.ruleId).length,
      fallbackAssignments: assignmentHistory.filter(h => !h.ruleId).length,
      assignmentsByEntity: {},
      assignmentsByMember: {},
      recentActivity: assignmentHistory.slice(-10)
    };
    
    // Group by entity type
    assignmentHistory.forEach(h => {
      stats.assignmentsByEntity[h.entityType] = (stats.assignmentsByEntity[h.entityType] || 0) + 1;
      stats.assignmentsByMember[h.assignedTo] = (stats.assignmentsByMember[h.assignedTo] || 0) + 1;
    });
    
    return stats;
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