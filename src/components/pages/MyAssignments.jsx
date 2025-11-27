import React, { useState, useEffect } from 'react'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'
import Badge from '@/components/atoms/Badge'
import Loading from '@/components/ui/Loading'
import Empty from '@/components/ui/Empty'
import { contactService } from '@/services/api/contactService'
import { leadService } from '@/services/api/leadService'
import { dealService } from '@/services/api/dealService'
import { taskService } from '@/services/api/taskService'
import { activityService } from '@/services/api/activityService'
import { teamMemberService } from '@/services/api/teamMemberService'
import { formatDistanceToNow } from 'date-fns'

export default function MyAssignments() {
  const [assignments, setAssignments] = useState({
    contacts: [],
    leads: [],
    deals: [],
    tasks: [],
    activities: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentUser, setCurrentUser] = useState(null)
  const [activeTab, setActiveTab] = useState('all')
  const [stats, setStats] = useState({
    total: 0,
    contacts: 0,
    leads: 0,
    deals: 0,
    tasks: 0,
    activities: 0
  })

  useEffect(() => {
    loadAssignments()
  }, [])

  const loadAssignments = async () => {
    try {
      setLoading(true)
      setError("")
      
      const user = teamMemberService.getCurrentUser()
      setCurrentUser(user)

      const [contacts, leads, deals, tasks, activities] = await Promise.all([
        contactService.getByAssignee(user.Id),
        leadService.getByAssignee(user.Id),
        dealService.getByAssignee(user.Id),
        taskService.getByAssignee(user.Id),
        activityService.getByAssignee(user.Id)
      ])

      setAssignments({ contacts, leads, deals, tasks, activities })
      setStats({
        total: contacts.length + leads.length + deals.length + tasks.length + activities.length,
        contacts: contacts.length,
        leads: leads.length,
        deals: deals.length,
        tasks: tasks.length,
        activities: activities.length
      })

    } catch (err) {
      setError('Failed to load assignments')
      console.error('Error loading assignments:', err)
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const getStatusBadge = (type, item) => {
    switch (type) {
      case 'leads':
        const stageColors = {
          new: 'bg-blue-100 text-blue-800',
          contacted: 'bg-yellow-100 text-yellow-800',
          qualified: 'bg-green-100 text-green-800',
          proposal: 'bg-purple-100 text-purple-800',
          negotiation: 'bg-orange-100 text-orange-800',
          closed: 'bg-emerald-100 text-emerald-800'
        }
        return <Badge className={stageColors[item.stage] || 'bg-gray-100 text-gray-800'}>{item.stage}</Badge>

      case 'deals':
        const dealStageColors = {
          new: 'bg-blue-100 text-blue-800',
          discovery: 'bg-yellow-100 text-yellow-800',
          proposal: 'bg-purple-100 text-purple-800',
          negotiation: 'bg-orange-100 text-orange-800',
          closed: 'bg-green-100 text-green-800',
          lost: 'bg-red-100 text-red-800'
        }
        return <Badge className={dealStageColors[item.stage] || 'bg-gray-100 text-gray-800'}>{item.stage}</Badge>

      case 'tasks':
        const taskColors = {
          'not-started': 'bg-slate-100 text-slate-800',
          'in-progress': 'bg-blue-100 text-blue-800',
          'completed': 'bg-green-100 text-green-800',
          'cancelled': 'bg-red-100 text-red-800'
        }
        return <Badge className={taskColors[item.status] || 'bg-gray-100 text-gray-800'}>{item.status}</Badge>

      case 'activities':
        const priorityColors = {
          low: 'bg-green-100 text-green-800',
          medium: 'bg-yellow-100 text-yellow-800',
          high: 'bg-red-100 text-red-800'
        }
        return <Badge className={priorityColors[item.priority] || 'bg-gray-100 text-gray-800'}>{item.priority}</Badge>

      default:
        return <Badge>Active</Badge>
    }
  }

  const renderAssignmentCard = (type, item) => (
    <div key={`${type}-${item.Id}`} className="card hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {type === 'contacts' && (
              <>
                {item.avatar ? (
                  <img src={item.avatar} alt={item.name} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                    <span className="text-sm font-semibold text-white">{getInitials(item.name)}</span>
                  </div>
                )}
              </>
            )}
            {type === 'leads' && (
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <ApperIcon name="UserPlus" className="w-5 h-5 text-blue-600" />
              </div>
            )}
            {type === 'deals' && (
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <ApperIcon name="Target" className="w-5 h-5 text-green-600" />
              </div>
            )}
            {type === 'tasks' && (
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <ApperIcon name="CheckSquare" className="w-5 h-5 text-orange-600" />
              </div>
            )}
            {type === 'activities' && (
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <ApperIcon name="Calendar" className="w-5 h-5 text-purple-600" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900">{item.name || item.title || item.description}</h3>
            {item.company && <p className="text-sm text-slate-600">{item.company}</p>}
            {item.amount && <p className="text-sm font-medium text-green-600">${item.amount.toLocaleString()}</p>}
          </div>
        </div>
        {getStatusBadge(type, item)}
      </div>
      
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span className="capitalize">{type.slice(0, -1)}</span>
        {item.assignedAt && (
          <span>Assigned {formatDistanceToNow(new Date(item.assignedAt), { addSuffix: true })}</span>
        )}
      </div>
    </div>
  )

  const getFilteredAssignments = () => {
    if (activeTab === 'all') {
      return [
        ...assignments.contacts.map(item => ({ type: 'contacts', ...item })),
        ...assignments.leads.map(item => ({ type: 'leads', ...item })),
        ...assignments.deals.map(item => ({ type: 'deals', ...item })),
        ...assignments.tasks.map(item => ({ type: 'tasks', ...item })),
        ...assignments.activities.map(item => ({ type: 'activities', ...item }))
      ].sort((a, b) => new Date(b.assignedAt || b.createdAt) - new Date(a.assignedAt || a.createdAt))
    }
    return assignments[activeTab].map(item => ({ type: activeTab, ...item }))
  }

  if (loading) {
    return <Loading />
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <Button onClick={loadAssignments} className="mt-4">Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">My Assignments</h1>
        <p className="text-slate-600">All records assigned to you across the CRM</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <div className="card text-center">
          <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
          <div className="text-sm text-slate-600">Total</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-primary-600">{stats.contacts}</div>
          <div className="text-sm text-slate-600">Contacts</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.leads}</div>
          <div className="text-sm text-slate-600">Leads</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">{stats.deals}</div>
          <div className="text-sm text-slate-600">Deals</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.tasks}</div>
          <div className="text-sm text-slate-600">Tasks</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.activities}</div>
          <div className="text-sm text-slate-600">Activities</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card mb-6">
        <div className="flex space-x-1 p-1 bg-slate-100 rounded-lg">
          {[
            { key: 'all', label: 'All', count: stats.total },
            { key: 'contacts', label: 'Contacts', count: stats.contacts },
            { key: 'leads', label: 'Leads', count: stats.leads },
            { key: 'deals', label: 'Deals', count: stats.deals },
            { key: 'tasks', label: 'Tasks', count: stats.tasks },
            { key: 'activities', label: 'Activities', count: stats.activities }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.key
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Assignments List */}
      {stats.total === 0 ? (
        <Empty 
          icon="UserCheck"
          title="No Assignments"
          description="You don't have any assigned records yet."
        />
      ) : (
        <div className="grid gap-4">
          {getFilteredAssignments().map(assignment => 
            renderAssignmentCard(assignment.type, assignment)
          )}
        </div>
      )}
    </div>
  )
}