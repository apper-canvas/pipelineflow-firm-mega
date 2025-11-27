import dashboardStats from "@/services/mockData/dashboardStats.json"

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const dashboardService = {
  async getStats() {
    await delay(300)
    return [...dashboardStats]
  }
}