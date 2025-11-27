import { getApperClient } from '@/services/apperClient'
import { toast } from 'react-toastify'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const contactService = {
  async getAll() {
    await delay(400)
    
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.fetchRecords('contact_c', {
fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "phone_c"}},
          {"field": {"Name": "company_c"}},
          {"field": {"Name": "position_c"}},
          {"field": {"Name": "avatar_c"}},
          {"field": {"Name": "assignedTo_c"}},
          {"field": {"Name": "assignmentHistory_c"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}},
          {"field": {"Name": "Owner"}},
          {"field": {"Name": "CreatedBy"}},
          {"field": {"Name": "ModifiedBy"}}
        ]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      // Map database fields to frontend format
return (response.data || []).map(contact => ({
        Id: contact.Id,
        name: contact.Name,
        email: contact.email_c,
        phone: contact.phone_c,
        company: contact.company_c,
        position: contact.position_c,
        avatar: contact.avatar_c,
        assignedTo: contact.assignedTo_c,
        assignmentHistory: contact.assignmentHistory_c ? JSON.parse(contact.assignmentHistory_c) : [],
        tags: contact.Tags ? contact.Tags.split(',') : [],
        createdAt: contact.CreatedOn,
        lastContactedAt: contact.ModifiedOn,
        owner: contact.Owner,
        createdBy: contact.CreatedBy,
        modifiedBy: contact.ModifiedBy
      }));
      
    } catch (error) {
      console.error("Error fetching contacts:", error);
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

      const response = await apperClient.fetchRecords('contact_c', {
        fields: [
{"field": {"Name": "Name"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "phone_c"}},
          {"field": {"Name": "company_c"}},
          {"field": {"Name": "position_c"}},
          {"field": {"Name": "assignedTo_c"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "Owner"}},
          {"field": {"Name": "CreatedBy"}}
        ],
        where: [{
          "FieldName": "assignedTo_c",
          "Operator": "EqualTo",
          "Values": [id]
        }]
      });

      if (!response.success) return [];

      return (response.data || []).map(contact => ({
Id: contact.Id,
        name: contact.Name,
        email: contact.email_c,
        phone: contact.phone_c,
        company: contact.company_c,
        position: contact.position_c,
        assignedTo: contact.assignedTo_c,
        tags: contact.Tags ? contact.Tags.split(',') : [],
        createdAt: contact.CreatedOn,
        owner: contact.Owner,
        createdBy: contact.CreatedBy
      }));
      
    } catch (error) {
      console.error("Error fetching contacts by assignee:", error);
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

      const response = await apperClient.getRecordById('contact_c', parseInt(id), {
fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "phone_c"}},
          {"field": {"Name": "company_c"}},
          {"field": {"Name": "position_c"}},
          {"field": {"Name": "avatar_c"}},
          {"field": {"Name": "assignedTo_c"}},
          {"field": {"Name": "assignmentHistory_c"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}},
          {"field": {"Name": "Owner"}},
          {"field": {"Name": "CreatedBy"}},
          {"field": {"Name": "ModifiedBy"}}
        ]
      });

      if (!response.success || !response.data) {
        throw new Error("Contact not found");
      }

      const contact = response.data;
return {
        Id: contact.Id,
        name: contact.Name,
        email: contact.email_c,
        phone: contact.phone_c,
        company: contact.company_c,
        position: contact.position_c,
        avatar: contact.avatar_c,
        assignedTo: contact.assignedTo_c,
        assignmentHistory: contact.assignmentHistory_c ? JSON.parse(contact.assignmentHistory_c) : [],
        tags: contact.Tags ? contact.Tags.split(',') : [],
        createdAt: contact.CreatedOn,
        lastContactedAt: contact.ModifiedOn,
        owner: contact.Owner,
        createdBy: contact.CreatedBy,
        modifiedBy: contact.ModifiedBy
      };
      
    } catch (error) {
      console.error("Error fetching contact by ID:", error);
      throw error;
    }
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

    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const now = new Date().toISOString()
      const assignmentHistory = contactData.assignedTo ? [{
        assignedTo: contactData.assignedTo,
        assignedAt: now,
        assignedBy: 1, // Current user
        status: 'active'
      }] : [];

      const params = {
        records: [{
          Name: contactData.name,
          email_c: contactData.email || '',
          phone_c: contactData.phone || '',
          company_c: contactData.company || '',
          position_c: contactData.position || '',
          avatar_c: contactData.avatar || '',
          assignedTo_c: contactData.assignedTo || null,
          assignmentHistory_c: assignmentHistory.length > 0 ? JSON.stringify(assignmentHistory) : '',
          Tags: contactData.tags ? contactData.tags.join(',') : ''
        }]
      };

      const response = await apperClient.createRecord('contact_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} contacts: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          const createdContact = successful[0].data;
          return {
            Id: createdContact.Id,
            name: createdContact.Name,
            email: createdContact.email_c,
            phone: createdContact.phone_c,
            company: createdContact.company_c,
            position: createdContact.position_c,
            avatar: createdContact.avatar_c,
            assignedTo: createdContact.assignedTo_c,
            assignmentHistory,
            tags: contactData.tags || [],
            createdAt: now
          };
        }
      }

      throw new Error("Failed to create contact");
      
    } catch (error) {
      console.error("Error creating contact:", error);
      throw error;
    }
  },

  async update(id, contactData) {
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

    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        records: [{
          Id: parseInt(id),
          Name: contactData.name,
          email_c: contactData.email || '',
          phone_c: contactData.phone || '',
          company_c: contactData.company || '',
          position_c: contactData.position || '',
          avatar_c: contactData.avatar || '',
          assignedTo_c: contactData.assignedTo || null,
          assignmentHistory_c: contactData.assignmentHistory ? JSON.stringify(contactData.assignmentHistory) : '',
          Tags: contactData.tags ? contactData.tags.join(',') : ''
        }]
      };

      const response = await apperClient.updateRecord('contact_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} contacts: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          const updatedContact = successful[0].data;
          return {
            Id: updatedContact.Id,
            name: updatedContact.Name,
            email: updatedContact.email_c,
            phone: updatedContact.phone_c,
            company: updatedContact.company_c,
            position: updatedContact.position_c,
            avatar: updatedContact.avatar_c,
            assignedTo: updatedContact.assignedTo_c,
            assignmentHistory: contactData.assignmentHistory || [],
            tags: contactData.tags || []
          };
        }
      }

      throw new Error("Failed to update contact");
      
    } catch (error) {
      console.error("Error updating contact:", error);
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

      const response = await apperClient.deleteRecord('contact_c', {
        RecordIds: [parseInt(id)]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      return true;
      
    } catch (error) {
      console.error("Error deleting contact:", error);
      throw error;
    }
  },

  async bulkDelete(ids) {
    await delay(300)
    
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const response = await apperClient.deleteRecord('contact_c', {
        RecordIds: ids.map(id => parseInt(id))
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      return { deleted: ids.length };
      
    } catch (error) {
      console.error("Error bulk deleting contacts:", error);
      throw error;
    }
  },

  async updateAvatar(id, avatarData) {
    await delay(200)
    
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        records: [{
          Id: parseInt(id),
          avatar_c: avatarData
        }]
      };

      const response = await apperClient.updateRecord('contact_c', params);

      if (!response.success) {
        throw new Error(response.message);
      }

      return response.results[0].data;
      
    } catch (error) {
      console.error("Error updating avatar:", error);
      throw error;
    }
  },

  async exportToCsv() {
    await delay(100)
    
    try {
      const contacts = await this.getAll();
const headers = ['Id', 'Name', 'Email', 'Phone', 'Company', 'Position', 'Tags', 'Owner', 'Created At', 'Created By']
      const csvData = [
        headers.join(','),
        ...contacts.map(contact => [
          contact.Id,
          `"${(contact.name || '').replace(/"/g, '""')}"`,
          `"${(contact.email || '').replace(/"/g, '""')}"`,
          `"${(contact.phone || '').replace(/"/g, '""')}"`,
          `"${(contact.company || '').replace(/"/g, '""')}"`,
          `"${(contact.position || '').replace(/"/g, '""')}"`,
          `"${(contact.tags || []).join(', ').replace(/"/g, '""')}"`,
          `"${(contact.owner?.Name || '').replace(/"/g, '""')}"`,
          contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : '',
          `"${(contact.createdBy?.Name || '').replace(/"/g, '""')}"`
        ].join(','))
      ].join('\n')
      
      return csvData;
      
    } catch (error) {
      console.error("Error exporting contacts:", error);
      throw error;
    }
  },

  async bulkAssign(contactIds, assigneeId) {
    await delay(400)
    
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const records = contactIds.map(id => ({
        Id: parseInt(id),
        assignedTo_c: assigneeId
      }));

      const params = { records };
      const response = await apperClient.updateRecord('contact_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      const successful = response.results?.filter(r => r.success) || [];
      return { updated: successful.length, total: contactIds.length };
      
    } catch (error) {
      console.error("Error bulk assigning contacts:", error);
      throw error;
    }
  }
}