import analyticsData from "@/services/mockData/analytics.json"

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const analyticsService = {
  async getAnalytics(period = "30d") {
    await delay(500)
    
    // Simulate different data based on period
    const baseData = { ...analyticsData }
    
    // Generate win/loss data based on period
    let winLossData = {}
    if (period === "7d") {
      baseData.chartData.categories = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      baseData.stats = baseData.stats.map(stat => ({
        ...stat,
        change: stat.change ? `+${Math.floor(Math.random() * 20 + 5)}%` : stat.change
      }))
      winLossData = {
        totalDeals: 28,
        wonDeals: 18,
        lostDeals: 10,
        winRate: 64.3,
        conversionRate: 82.1,
        winLossChart: {
          series: [18, 10],
          labels: ['Won Deals', 'Lost Deals']
        }
      }
    } else if (period === "30d") {
      winLossData = {
        totalDeals: 124,
        wonDeals: 78,
        lostDeals: 46,
        winRate: 62.9,
        conversionRate: 78.4,
        winLossChart: {
          series: [78, 46],
          labels: ['Won Deals', 'Lost Deals']
        }
      }
    } else if (period === "90d") {
      baseData.chartData.categories = ["Jan", "Feb", "Mar"]
      baseData.stats = baseData.stats.map(stat => ({
        ...stat,
        value: stat.value.includes("$") ? 
          `$${(parseInt(stat.value.replace(/[^0-9]/g, "")) * 3).toLocaleString()}` :
          `${parseInt(stat.value.replace(/[^0-9]/g, "")) * 2.5}`
      }))
      winLossData = {
        totalDeals: 342,
        wonDeals: 201,
        lostDeals: 141,
        winRate: 58.8,
        conversionRate: 74.2,
        winLossChart: {
          series: [201, 141],
          labels: ['Won Deals', 'Lost Deals']
        }
      }
    } else if (period === "1y") {
      winLossData = {
        totalDeals: 1456,
        wonDeals: 891,
        lostDeals: 565,
        winRate: 61.2,
        conversionRate: 76.8,
        winLossChart: {
          series: [891, 565],
          labels: ['Won Deals', 'Lost Deals']
        }
      }
    }
    
    // Add win/loss data to base data
    baseData.winLossData = winLossData
    
    return baseData
  }
}