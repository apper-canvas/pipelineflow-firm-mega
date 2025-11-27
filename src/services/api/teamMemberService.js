// Mock team member data for assignment functionality
const teamMembers = [
  {
    Id: 1,
    name: "Current User",
    email: "current.user@company.com",
    avatar: null,
    role: "Sales Manager",
    department: "Sales",
    isCurrentUser: true
  },
  {
    Id: 2,
    name: "John Smith",
    email: "john.smith@company.com",
    avatar: null,
    role: "Sales Representative",
    department: "Sales",
    isCurrentUser: false
  },
  {
    Id: 3,
    name: "Sarah Wilson",
    email: "sarah.wilson@company.com",
    avatar: null,
    role: "Account Manager",
    department: "Sales",
    isCurrentUser: false
  },
  {
    Id: 4,
    name: "Mike Johnson",
    email: "mike.johnson@company.com",
    avatar: null,
    role: "Business Development Rep",
    department: "Sales",
    isCurrentUser: false
  }
]

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const teamMemberService = {
  async getAll() {
    await delay(200)
    return [...teamMembers]
  },

async getById(id) {
    await delay(200)
    
    // Handle null/undefined/invalid IDs gracefully
    if (id === null || id === undefined || id === '') {
      return null
    }
    
    const parsedId = parseInt(id)
    if (isNaN(parsedId)) {
      return null
    }
    
    const member = teamMembers.find(m => m.Id === parsedId)
    return member ? { ...member } : null
  },

  getCurrentUser() {
    return teamMembers.find(m => m.isCurrentUser) || teamMembers[0]
  },

  async getWorkload(memberId) {
    await delay(100);
    // Mock workload calculation - in real app this would query actual assignments
    const baseWorkload = Math.floor(Math.random() * 15) + 5; // 5-20 active items
    return {
      totalActive: baseWorkload,
      contacts: Math.floor(baseWorkload * 0.3),
      leads: Math.floor(baseWorkload * 0.25),
      deals: Math.floor(baseWorkload * 0.25),
      tasks: Math.floor(baseWorkload * 0.2)
    };
  },

  async updateAvailability(memberId, availability) {
    await delay(150);
    const member = teamMembers.find(m => m.Id === parseInt(memberId));
    if (!member) {
      throw new Error("Team member not found");
    }
    
    member.availability = availability;
    member.lastUpdated = new Date().toISOString();
    return { ...member };
  },

  async getAvailableMembers() {
    await delay(100);
    return teamMembers.filter(m => m.availability === 'available');
  }
}