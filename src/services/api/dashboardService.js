import { getApperClient } from '@/services/apperClient'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const dashboardService = {
  async getStats() {
    await delay(300)
    
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      // Fetch data from multiple tables for dashboard stats
      const [contactsResponse, leadsResponse, dealsResponse, tasksResponse] = await Promise.all([
        apperClient.fetchRecords('contact_c', {
          fields: [{"field": {"Name": "Name"}}, {"field": {"Name": "CreatedOn"}}]
        }),
        apperClient.fetchRecords('lead_c', {
          fields: [{"field": {"Name": "Name"}}, {"field": {"Name": "stage_c"}}, {"field": {"Name": "CreatedOn"}}]
        }),
        apperClient.fetchRecords('deal_c', {
          fields: [{"field": {"Name": "Name"}}, {"field": {"Name": "amount_c"}}, {"field": {"Name": "stage_c"}}, {"field": {"Name": "CreatedOn"}}]
        }),
        apperClient.fetchRecords('task_c', {
          fields: [{"field": {"Name": "Name"}}, {"field": {"Name": "status_c"}}, {"field": {"Name": "CreatedOn"}}]
        })
      ]);

      const contacts = contactsResponse.success ? contactsResponse.data : [];
      const leads = leadsResponse.success ? leadsResponse.data : [];
      const deals = dealsResponse.success ? dealsResponse.data : [];
      const tasks = tasksResponse.success ? tasksResponse.data : [];

      // Calculate stats
      const totalRevenue = deals.reduce((sum, deal) => sum + (parseFloat(deal.amount_c) || 0), 0);
      const activeDeals = deals.filter(deal => !['closed-won', 'closed-lost'].includes(deal.stage_c)).length;
      const completedTasks = tasks.filter(task => task.status_c === 'completed').length;
      const qualifiedLeads = leads.filter(lead => ['qualified', 'converted'].includes(lead.stage_c)).length;

      return [
        {
          id: 'contacts',
          title: 'Total Contacts',
          value: contacts.length.toString(),
          change: '+12%',
          changeType: 'positive',
          icon: 'Users'
        },
        {
          id: 'revenue',
          title: 'Revenue',
          value: `$${totalRevenue.toLocaleString()}`,
          change: '+8%',
          changeType: 'positive',
          icon: 'DollarSign'
        },
        {
          id: 'deals',
          title: 'Active Deals',
          value: activeDeals.toString(),
          change: '+5%',
          changeType: 'positive',
          icon: 'Target'
        },
        {
          id: 'tasks',
          title: 'Completed Tasks',
          value: completedTasks.toString(),
          change: '+15%',
          changeType: 'positive',
          icon: 'CheckSquare'
        },
        {
          id: 'leads',
          title: 'Qualified Leads',
          value: qualifiedLeads.toString(),
          change: '+3%',
          changeType: 'positive',
          icon: 'TrendingUp'
        },
        {
          id: 'conversion',
          title: 'Conversion Rate',
          value: leads.length > 0 ? `${((qualifiedLeads / leads.length) * 100).toFixed(1)}%` : '0%',
          change: '+2%',
          changeType: 'positive',
          icon: 'BarChart3'
        }
      ];
      
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      
      // Return fallback stats
      return [
        { id: 'contacts', title: 'Total Contacts', value: '0', change: '0%', changeType: 'neutral', icon: 'Users' },
        { id: 'revenue', title: 'Revenue', value: '$0', change: '0%', changeType: 'neutral', icon: 'DollarSign' },
        { id: 'deals', title: 'Active Deals', value: '0', change: '0%', changeType: 'neutral', icon: 'Target' },
        { id: 'tasks', title: 'Completed Tasks', value: '0', change: '0%', changeType: 'neutral', icon: 'CheckSquare' }
      ];
    }
  }
}