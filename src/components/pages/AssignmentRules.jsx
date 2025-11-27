import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { format } from 'date-fns'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import Badge from '@/components/atoms/Badge'
import Loading from '@/components/ui/Loading'
import ErrorView from '@/components/ui/ErrorView'
import Empty from '@/components/ui/Empty'
import AssigneeSelector from '@/components/molecules/AssigneeSelector'
import { autoAssignmentService } from '@/services/api/autoAssignmentService'
import { teamMemberService } from '@/services/api/teamMemberService'

export default function AssignmentRules() {
  const [rules, setRules] = useState([])
  const [teamMembers, setTeamMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRule, setEditingRule] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [entityFilter, setEntityFilter] = useState('all')
  const [activeFilter, setActiveFilter] = useState('all')
  const [formData, setFormData] = useState({
    name: '',
    entity: 'contacts',
    isActive: true,
    priority: 1,
    criteria: {
      type: 'field_based',
      conditions: [
        {
          field: '',
          operator: 'equals',
          value: '',
          assignTo: null
        }
      ]
    },
    fallbackStrategy: 'round_robin'
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [rulesData, membersData] = await Promise.all([
        autoAssignmentService.getAllRules(),
        teamMemberService.getAll()
      ])
      setRules(rulesData)
      setTeamMembers(membersData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const validation = autoAssignmentService.validateRuleData(formData)
      if (validation.length > 0) {
        toast.error(`Validation errors: ${validation.join(', ')}`)
        return
      }

      if (editingRule) {
        await autoAssignmentService.updateRule(editingRule.Id, formData)
        toast.success('Assignment rule updated successfully')
      } else {
        await autoAssignmentService.createRule(formData)
        toast.success('Assignment rule created successfully')
      }
      
      setIsModalOpen(false)
      setEditingRule(null)
      resetForm()
      loadData()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleDelete = async (ruleId) => {
    if (!confirm('Are you sure you want to delete this assignment rule?')) return
    
    try {
      await autoAssignmentService.deleteRule(ruleId)
      toast.success('Assignment rule deleted successfully')
      loadData()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleToggleStatus = async (rule) => {
    try {
      await autoAssignmentService.toggleRuleStatus(rule.Id)
      toast.success(`Rule ${rule.isActive ? 'deactivated' : 'activated'} successfully`)
      loadData()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleEdit = (rule) => {
    setEditingRule(rule)
    setFormData({ ...rule })
    setIsModalOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      entity: 'contacts',
      isActive: true,
      priority: 1,
      criteria: {
        type: 'field_based',
        conditions: [
          {
            field: '',
            operator: 'equals',
            value: '',
            assignTo: null
          }
        ]
      },
      fallbackStrategy: 'round_robin'
    })
  }

  const addCondition = () => {
    setFormData(prev => ({
      ...prev,
      criteria: {
        ...prev.criteria,
        conditions: [
          ...prev.criteria.conditions,
          {
            field: '',
            operator: 'equals',
            value: '',
            assignTo: null
          }
        ]
      }
    }))
  }

  const removeCondition = (index) => {
    setFormData(prev => ({
      ...prev,
      criteria: {
        ...prev.criteria,
        conditions: prev.criteria.conditions.filter((_, i) => i !== index)
      }
    }))
  }

  const updateCondition = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      criteria: {
        ...prev.criteria,
        conditions: prev.criteria.conditions.map((condition, i) => 
          i === index ? { ...condition, [field]: value } : condition
        )
      }
    }))
  }

  const getTeamMemberName = (id) => {
    const member = teamMembers.find(m => m.Id === id)
    return member ? member.name : 'Unknown'
  }

  const filteredRules = rules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesEntity = entityFilter === 'all' || rule.entity === entityFilter
    const matchesActive = activeFilter === 'all' || 
      (activeFilter === 'active' && rule.isActive) ||
      (activeFilter === 'inactive' && !rule.isActive)
    
    return matchesSearch && matchesEntity && matchesActive
  })

  const entityOptions = [
    { value: 'contacts', label: 'Contacts' },
    { value: 'leads', label: 'Leads' },
    { value: 'deals', label: 'Deals' },
    { value: 'tasks', label: 'Tasks' }
  ]

  const operatorOptions = [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'greater_than', label: 'Greater Than' },
    { value: 'less_than', label: 'Less Than' },
    { value: 'between', label: 'Between' },
    { value: 'in', label: 'In List' }
  ]

  const fallbackOptions = [
    { value: 'round_robin', label: 'Round Robin' },
    { value: 'least_workload', label: 'Least Workload' },
    { value: 'availability_based', label: 'Based on Availability' },
    { value: 'expertise_based', label: 'Based on Expertise' }
  ]

  const getFieldOptions = (entity) => {
    const fieldMap = {
      contacts: [
        { value: 'name', label: 'Name' },
        { value: 'email', label: 'Email' },
        { value: 'company', label: 'Company' },
        { value: 'position', label: 'Position' }
      ],
      leads: [
        { value: 'title', label: 'Title' },
        { value: 'company', label: 'Company' },
        { value: 'source', label: 'Source' },
        { value: 'stage', label: 'Stage' },
        { value: 'value', label: 'Value' }
      ],
      deals: [
        { value: 'title', label: 'Title' },
        { value: 'amount', label: 'Amount' },
        { value: 'stage', label: 'Stage' },
        { value: 'probability', label: 'Probability' }
      ],
      tasks: [
        { value: 'title', label: 'Title' },
        { value: 'priority', label: 'Priority' },
        { value: 'status', label: 'Status' },
        { value: 'category', label: 'Category' }
      ]
    }
    return fieldMap[entity] || []
  }

  if (loading) return <Loading />
  if (error) return <ErrorView message={error} onRetry={loadData} />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Assignment Rules</h1>
          <p className="text-slate-600">Manage automatic assignment rules for your team</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
          Create Rule
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search assignment rules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className="input-field w-full sm:w-auto"
        >
          <option value="all">All Entities</option>
          {entityOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value)}
          className="input-field w-full sm:w-auto"
        >
          <option value="all">All Rules</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>
      </div>

      {/* Rules List */}
      {filteredRules.length === 0 ? (
        <Empty
          icon="Settings"
          title="No assignment rules found"
          description={searchTerm ? "Try adjusting your search criteria" : "Create your first assignment rule to get started"}
          action={
            <Button onClick={() => setIsModalOpen(true)}>
              <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
              Create Rule
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4">
          {filteredRules.map(rule => (
            <div key={rule.Id} className="card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-semibold text-slate-900">{rule.name}</h3>
                  <Badge variant={rule.isActive ? "success" : "secondary"}>
                    {rule.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <Badge variant="outline">
                    {entityOptions.find(e => e.value === rule.entity)?.label}
                  </Badge>
                  <span className="text-sm text-slate-500">Priority: {rule.priority}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleToggleStatus(rule)}
                  >
                    <ApperIcon name={rule.isActive ? "Pause" : "Play"} className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleEdit(rule)}
                  >
                    <ApperIcon name="Edit" className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(rule.Id)}
                  >
                    <ApperIcon name="Trash" className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">Conditions:</h4>
                  <div className="space-y-2">
                    {rule.criteria.conditions.map((condition, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm text-slate-600 bg-slate-50 p-2 rounded">
                        <span className="font-medium">{condition.field}</span>
                        <span>{condition.operator.replace('_', ' ')}</span>
                        <span className="font-medium">"{condition.value}"</span>
                        <span>→</span>
                        <span className="font-medium text-primary-600">
                          {getTeamMemberName(condition.assignTo)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>Fallback: {rule.fallbackStrategy.replace('_', ' ')}</span>
                  <span>Updated: {format(new Date(rule.updatedAt), 'MMM dd, yyyy')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">
                {editingRule ? 'Edit Assignment Rule' : 'Create Assignment Rule'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false)
                  setEditingRule(null)
                  resetForm()
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <ApperIcon name="X" className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Rule Name
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter rule name..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Entity Type
                    </label>
                    <select
                      value={formData.entity}
                      onChange={(e) => setFormData(prev => ({ ...prev, entity: e.target.value }))}
                      className="input-field"
                    >
                      {entityOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Priority
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 1 }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Fallback Strategy
                    </label>
                    <select
                      value={formData.fallbackStrategy}
                      onChange={(e) => setFormData(prev => ({ ...prev, fallbackStrategy: e.target.value }))}
                      className="input-field"
                    >
                      {fallbackOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Conditions */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-slate-900">Assignment Conditions</h3>
                    <Button variant="secondary" size="sm" onClick={addCondition}>
                      <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
                      Add Condition
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {formData.criteria.conditions.map((condition, index) => (
                      <div key={index} className="border border-slate-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-medium text-slate-700">
                            Condition {index + 1}
                          </h4>
                          {formData.criteria.conditions.length > 1 && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => removeCondition(index)}
                            >
                              <ApperIcon name="Trash" className="w-4 h-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Field
                            </label>
                            <select
                              value={condition.field}
                              onChange={(e) => updateCondition(index, 'field', e.target.value)}
                              className="input-field"
                            >
                              <option value="">Select field...</option>
                              {getFieldOptions(formData.entity).map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Operator
                            </label>
                            <select
                              value={condition.operator}
                              onChange={(e) => updateCondition(index, 'operator', e.target.value)}
                              className="input-field"
                            >
                              {operatorOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Value
                            </label>
                            <Input
                              value={condition.value}
                              onChange={(e) => updateCondition(index, 'value', e.target.value)}
                              placeholder="Enter value..."
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Assign To
                            </label>
                            <AssigneeSelector
                              value={condition.assignTo}
                              onChange={(value) => updateCondition(index, 'assignTo', value)}
                              placeholder="Select assignee..."
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
                    Rule is active
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t border-slate-200">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsModalOpen(false)
                  setEditingRule(null)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {editingRule ? 'Update Rule' : 'Create Rule'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}