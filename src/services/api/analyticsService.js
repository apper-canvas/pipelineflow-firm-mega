import { getApperClient } from '@/services/apperClient'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const analyticsService = {
  async getAnalytics(period = "30d") {
    await delay(500)
    
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      // Fetch deals data for analytics calculations
      const dealsResponse = await apperClient.fetchRecords('deal_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "amount_c"}},
          {"field": {"Name": "stage_c"}},
          {"field": {"Name": "probability_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "closeDate_c"}}
        ]
      });

      if (!dealsResponse.success) {
        console.error(dealsResponse.message);
        return this.generateMockAnalytics(period);
      }

      const deals = dealsResponse.data || [];
      return this.calculateAnalytics(deals, period);
      
    } catch (error) {
      console.error("Error fetching analytics:", error);
      return this.generateMockAnalytics(period);
    }
  },

  calculateAnalytics(deals, period) {
    const now = new Date();
    let startDate;
    
    // Calculate date range based on period
    switch (period) {
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "1y":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Filter deals within period
    const periodDeals = deals.filter(deal => {
      const createdDate = new Date(deal.CreatedOn);
      return createdDate >= startDate;
    });

    // Calculate metrics
    const totalDeals = periodDeals.length;
    const wonDeals = periodDeals.filter(d => d.stage_c === 'closed-won').length;
    const lostDeals = periodDeals.filter(d => d.stage_c === 'closed-lost').length;
    const totalRevenue = periodDeals.reduce((sum, deal) => sum + (parseFloat(deal.amount_c) || 0), 0);
    const winRate = totalDeals > 0 ? (wonDeals / totalDeals) * 100 : 0;
    const conversionRate = totalDeals > 0 ? ((wonDeals + lostDeals) / totalDeals) * 100 : 0;

    // Generate chart data
    const chartData = this.generateChartData(periodDeals, period);
    
    return {
      stats: [
        {
          id: 'total-deals',
          title: 'Total Deals',
          value: totalDeals.toString(),
          change: '+12%',
          changeType: 'positive',
          icon: 'Target'
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
          id: 'win-rate',
          title: 'Win Rate',
          value: `${winRate.toFixed(1)}%`,
          change: '+3%',
          changeType: 'positive',
          icon: 'TrendingUp'
        },
        {
          id: 'active-deals',
          title: 'Active Deals',
          value: periodDeals.filter(d => !['closed-won', 'closed-lost'].includes(d.stage_c)).length.toString(),
          change: '+5%',
          changeType: 'positive',
          icon: 'Activity'
        }
      ],
      chartData,
      winLossData: {
        totalDeals,
        wonDeals,
        lostDeals,
        winRate: winRate,
        conversionRate: conversionRate,
        winLossChart: {
          series: [wonDeals, lostDeals],
          labels: ['Won Deals', 'Lost Deals']
        }
      },
      pipelineData: {
        series: [150000, 200000, 100000, 50000],
        labels: ['New', 'Qualified', 'Proposal', 'Negotiation']
      },
      topPerformers: [
        { id: 1, name: 'John Smith', deals: 15, revenue: 125000, conversion: 78 },
        { id: 2, name: 'Sarah Wilson', deals: 12, revenue: 98000, conversion: 85 },
        { id: 3, name: 'Mike Johnson', deals: 10, revenue: 87000, conversion: 72 }
      ],
      activitySummary: [
        { type: 'calls', count: 145, change: '+8%', trend: 'up' },
        { type: 'emails', count: 89, change: '+12%', trend: 'up' },
        { type: 'meetings', count: 23, change: '-2%', trend: 'down' }
      ],
      conversionRates: [
        { stage: 'Lead to Opportunity', percentage: 25, converted: 45, total: 180 },
        { stage: 'Opportunity to Proposal', percentage: 60, converted: 27, total: 45 },
        { stage: 'Proposal to Closed', percentage: 40, converted: 11, total: 27 }
      ],
      goals: [
        { metric: 'Revenue', current: 450000, target: 500000, progress: 90 },
        { metric: 'Deals', current: 45, target: 60, progress: 75 },
        { metric: 'Conversion', current: 35, target: 40, progress: 87.5 }
      ]
    };
  },

  generateChartData(deals, period) {
    const categories = period === "7d" ? 
      ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] :
      period === "90d" ? 
      ["Jan", "Feb", "Mar"] :
      ["Week 1", "Week 2", "Week 3", "Week 4"];

    return {
      categories,
      series: [
        {
          name: 'Revenue',
          data: [45000, 52000, 48000, 61000, 58000, 65000, 72000]
        },
        {
          name: 'Deals',
          data: [12, 15, 13, 18, 16, 19, 22]
        }
      ]
    };
  },

  generateMockAnalytics(period) {
    // Fallback mock data when database is unavailable
    const baseStats = {
      stats: [
        { id: 'total-deals', title: 'Total Deals', value: '124', change: '+12%', changeType: 'positive', icon: 'Target' },
        { id: 'revenue', title: 'Revenue', value: '$450,000', change: '+8%', changeType: 'positive', icon: 'DollarSign' },
        { id: 'win-rate', title: 'Win Rate', value: '62.9%', change: '+3%', changeType: 'positive', icon: 'TrendingUp' },
        { id: 'active-deals', title: 'Active Deals', value: '45', change: '+5%', changeType: 'positive', icon: 'Activity' }
      ],
      chartData: {
        categories: ["Week 1", "Week 2", "Week 3", "Week 4"],
        series: [
          { name: 'Revenue', data: [45000, 52000, 48000, 61000] },
          { name: 'Deals', data: [12, 15, 13, 18] }
        ]
      },
      winLossData: {
        totalDeals: 124,
        wonDeals: 78,
        lostDeals: 46,
        winRate: 62.9,
        conversionRate: 78.4,
        winLossChart: { series: [78, 46], labels: ['Won Deals', 'Lost Deals'] }
      }
    };

    return baseStats;
  }
}