import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { dealService } from "@/services/api/dealService";
import { contactService } from "@/services/api/contactService";
import { format } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Badge from "@/components/atoms/Badge";
import AssigneeDisplay from "@/components/molecules/AssigneeDisplay";
import AssigneeSelector from "@/components/molecules/AssigneeSelector";

const DealModal = ({ isOpen, deal, onClose, onSave }) => {
const [formData, setFormData] = useState({
    title: "",
    amount: "",
    stage: "new",
    probability: 25,
    closeDate: "",
    contactId: "",
    notes: "",
    dealOwner: null,
    assignmentHistory: [],
    stageChangedAt: new Date().toISOString(),
    tags: []
  })
  const [contacts, setContacts] = useState([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadContacts()
    }
  }, [isOpen])

  useEffect(() => {
if (deal) {
setFormData({
        ...deal,
        dealOwner: deal.dealOwner || null,
        assignmentHistory: deal.assignmentHistory || [],
        closeDate: deal.closeDate ? format(new Date(deal.closeDate), "yyyy-MM-dd") : "",
        tags: deal.tags || []
      })
    } else {
setFormData({
        title: "",
        amount: "",
        stage: "new",
        probability: 25,
        closeDate: "",
        contactId: "",
        notes: "",
        dealOwner: null,
        assignmentHistory: [],
        stageChangedAt: new Date().toISOString(),
        tags: []
      })
    }
  }, [deal])

  const loadContacts = async () => {
    try {
      const data = await contactService.getAll()
      setContacts(data)
    } catch (error) {
      console.error("Failed to load contacts:", error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.amount) {
      toast.error("Title and amount are required")
      return
    }

    setSaving(true)
    try {
      const savedDeal = deal
        ? await dealService.update(deal.Id, formData)
        : await dealService.create(formData)
      
      onSave(savedDeal)
      toast.success(deal ? "Deal updated successfully" : "Deal created successfully")
      onClose()
    } catch (error) {
      toast.error("Failed to save deal")
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-lg animate-scale-in">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {deal ? "Edit Deal" : "New Deal"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
            <ApperIcon name="X" className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
<Input
            label="Deal Title"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            placeholder="Enterprise Software License"
            required
          />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Tags
            </label>
            <Input
              value={formData.tags?.join(', ') || ''}
              onChange={(e) => setFormData({
                ...formData, 
                tags: e.target.value ? e.target.value.split(',').map(tag => tag.trim()) : []
              })}
              placeholder="Enter tags separated by commas"
            />
            <p className="text-xs text-slate-500">Separate multiple tags with commas</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Amount ($)"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              placeholder="50000"
              required
            />
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Stage
              </label>
              <select 
                value={formData.stage}
                onChange={(e) => setFormData({...formData, stage: e.target.value})}
                className="input-field"
              >
                <option value="new">New</option>
                <option value="qualified">Qualified</option>
                <option value="proposal">Proposal</option>
                <option value="negotiation">Negotiation</option>
                <option value="closed-won">Closed Won</option>
                <option value="closed-lost">Closed Lost</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Probability ({formData.probability}%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={formData.probability}
                onChange={(e) => setFormData({...formData, probability: parseInt(e.target.value)})}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
            
            <Input
              label="Expected Close Date"
              type="date"
              value={formData.closeDate}
              onChange={(e) => setFormData({...formData, closeDate: e.target.value})}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Associated Contact
            </label>
            <select 
              value={formData.contactId}
              onChange={(e) => setFormData({...formData, contactId: e.target.value})}
              className="input-field"
            >
              <option value="">Select a contact...</option>
              {contacts.map(contact => (
                <option key={contact.Id} value={contact.Id}>
                  {contact.name} - {contact.company}
                </option>
              ))}
            </select>
</div>
<div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Deal Owner
            </label>
            <AssigneeSelector
              value={formData.dealOwner}
              onChange={(value) => setFormData({...formData, dealOwner: value})}
              placeholder="Assign deal owner..."
              className="flex-1"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Additional details about this deal..."
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 resize-none"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? "Saving..." : deal ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

const Deals = () => {
  const [deals, setDeals] = useState([])
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedDeal, setSelectedDeal] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
const [filterStage, setFilterStage] = useState("all")
  
  // Bulk assignment state
  const [selectedDeals, setSelectedDeals] = useState([])
  const [bulkAssigneeId, setBulkAssigneeId] = useState(null)
  const [isBulkAssigning, setIsBulkAssigning] = useState(false)

  // Handle bulk assignment
  const handleBulkAssign = async (assigneeId) => {
    if (selectedDeals.length === 0) {
      toast.error("No deals selected for assignment")
      return
    }
    
    setIsBulkAssigning(true)
    try {
      const result = await dealService.bulkAssign(selectedDeals, assigneeId)
      
      // Refresh data
      await loadDeals()
      
      // Clear selection
      setSelectedDeals([])
      setBulkAssigneeId(null)
      
      const assigneeName = assigneeId ? 'Selected assignee' : 'Unassigned'
      toast.success(`Successfully assigned ${result.updated} deal${result.updated !== 1 ? 's' : ''} to ${assigneeName}`)
    } catch (error) {
      console.error("Bulk assignment error:", error)
      toast.error(error.message || "Failed to assign deals")
    } finally {
      setIsBulkAssigning(false)
    }
  }

  // Handle deal selection
  const handleDealSelection = (dealId, checked) => {
    setSelectedDeals(prev => 
      checked 
        ? [...prev, dealId]
        : prev.filter(id => id !== dealId)
    )
  }
  const stages = [
    { id: "new", label: "New", color: "bg-blue-500" },
    { id: "qualified", label: "Qualified", color: "bg-amber-500" },
    { id: "proposal", label: "Proposal", color: "bg-purple-500" },
    { id: "negotiation", label: "Negotiation", color: "bg-orange-500" },
    { id: "closed-won", label: "Closed Won", color: "bg-green-500" },
    { id: "closed-lost", label: "Closed Lost", color: "bg-red-500" }
  ]

  useEffect(() => {
    loadDeals()
    loadContacts()
  }, [])

  const loadDeals = async () => {
    try {
      setLoading(true)
      setError("")
      const data = await dealService.getAll()
      setDeals(data)
    } catch (err) {
      setError("Failed to load deals")
    } finally {
      setLoading(false)
    }
  }

  const loadContacts = async () => {
    try {
      const data = await contactService.getAll()
      setContacts(data)
    } catch (error) {
      console.error("Failed to load contacts:", error)
    }
  }

  const handleDealSave = (savedDeal) => {
    if (selectedDeal) {
      setDeals(deals.map(d => d.Id === savedDeal.Id ? savedDeal : d))
    } else {
      setDeals([savedDeal, ...deals])
    }
  }

const handleStageChange = async (dealId, newStage) => {
    try {
      const deal = deals.find(d => d.Id === dealId)
      const updatedDeal = await dealService.updateStage(dealId, newStage)
      setDeals(deals.map(d => d.Id === dealId ? updatedDeal : d))
      toast.success("Deal stage updated")
    } catch (error) {
      toast.error("Failed to update deal stage")
    }
  }

  const formatDuration = (milliseconds) => {
    const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24))
    const hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) {
      return `${days}d ${hours}h`
    } else if (hours > 0) {
      return `${hours}h`
    } else {
      const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))
      return `${minutes}m`
    }
  }

  const getStageDurationColor = (duration, stage) => {
    const thresholds = {
      new: 7, // 7 days
      qualified: 14, // 14 days
      proposal: 10, // 10 days
      negotiation: 21, // 21 days
      won: 0,
      lost: 0
    }
    
    const daysDuration = duration / (1000 * 60 * 60 * 24)
    const threshold = thresholds[stage] || 14
    
    if (stage === 'won' || stage === 'lost') return 'text-slate-600'
    if (daysDuration <= threshold * 0.5) return 'text-green-600'
    if (daysDuration <= threshold) return 'text-yellow-600'
    return 'text-red-600'
  }

const getCurrentStageDuration = (deal) => {
    if (!deal.stageChangedAt) return 0
    return new Date() - new Date(deal.stageChangedAt)
  }

  const getTotalDealAge = (deal) => {
    if (!deal.createdAt) return 0
    return new Date() - new Date(deal.createdAt)
  }

  const getUserDisplayName = (userField) => {
    if (typeof userField === 'object' && userField?.Name) {
      return userField.Name;
    }
    if (typeof userField === 'string') {
      return userField;
    }
    return 'Unknown User';
  }

  const handleDelete = async (dealId) => {
    if (confirm("Are you sure you want to delete this deal?")) {
      try {
        await dealService.delete(dealId)
        setDeals(deals.filter(d => d.Id !== dealId))
        toast.success("Deal deleted successfully")
      } catch (error) {
        toast.error("Failed to delete deal")
      }
    }
}

  // Bulk assignment toolbar
  const BulkAssignmentToolbar = () => {
    if (selectedDeals.length === 0) return null

    return (
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-primary-900">
            {selectedDeals.length} deal{selectedDeals.length !== 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center space-x-3">
            <AssigneeSelector
              value={bulkAssigneeId}
              onChange={handleBulkAssign}
              placeholder="Assign to..."
              bulkMode={true}
              className="w-64"
            />
            <Button
              onClick={() => setSelectedDeals([])}
              variant="secondary"
              size="sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const getStageColor = (stage) => {
    const stageData = stages.find(s => s.id === stage)
    return stageData ? stageData.color : "bg-slate-500"
  }

  const getStageLabel = (stage) => {
    const stageData = stages.find(s => s.id === stage)
    return stageData ? stageData.label : stage
  }

  const getContactName = (contactId) => {
    const contact = contacts.find(c => c.Id === contactId)
    return contact ? contact.name : "Unknown Contact"
  }

  const getProbabilityColor = (probability) => {
    if (probability >= 80) return "text-green-600"
    if (probability >= 50) return "text-amber-600"
    if (probability >= 25) return "text-orange-600"
    return "text-red-600"
  }

  const filteredDeals = filterStage === "all" ? deals : deals.filter(deal => deal.stage === filterStage)
  const dealsByStage = stages.reduce((acc, stage) => {
    acc[stage.id] = deals.filter(deal => deal.stage === stage.id)
    return acc
  }, {})

const totalPipelineValue = deals.reduce((sum, deal) => sum + ((parseFloat(deal.amount) || 0) * ((deal.probability || 0) / 100)), 0)

  if (loading) return <Loading type="skeleton" />
  if (error) return <ErrorView message={error} onRetry={loadDeals} />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Deals</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage your sales pipeline and track deal progress.
          </p>
<p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
            Weighted Pipeline Value: <span className="font-semibold text-primary-600">${totalPipelineValue.toLocaleString()}</span>
          </p>
        </div>
        <Button 
          onClick={() => {
            setSelectedDeal(null)
            setIsModalOpen(true)
          }}
          className="flex items-center space-x-2"
        >
          <ApperIcon name="Plus" className="h-4 w-4" />
          <span>Add Deal</span>
        </Button>
      </div>

      {/* Stage Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterStage("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
            filterStage === "all"
              ? "bg-primary-600 text-white"
              : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700"
          }`}
        >
          All Deals ({deals.length})
        </button>
        {stages.map(stage => (
          <button
            key={stage.id}
            onClick={() => setFilterStage(stage.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2 ${
              filterStage === stage.id
                ? "bg-primary-600 text-white"
                : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700"
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${stage.color}`}></div>
            <span>{stage.label} ({dealsByStage[stage.id]?.length || 0})</span>
          </button>
        ))}
</div>
<BulkAssignmentToolbar />

      {/* Deals Display */}
      {filteredDeals.length === 0 ? (
        <Empty 
          icon="Target"
          title="No deals found"
          message={filterStage === "all" ? "Start tracking deals to build your sales pipeline." : `No deals in ${getStageLabel(filterStage)} stage.`}
          actionLabel="Add Deal"
          onAction={() => {
            setSelectedDeal(null)
            setIsModalOpen(true)
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
{filteredDeals.map((deal) => {
            const currentStageDuration = getCurrentStageDuration(deal)
            const totalDealAge = getTotalDealAge(deal)
            return (
              <div key={deal.Id} className="card hover:shadow-lg transition-all duration-200 group relative">
                {/* Selection Checkbox */}
                <div className="absolute top-4 left-4 z-10">
                  <input
                    type="checkbox"
                    checked={selectedDeals.includes(deal.Id)}
                    onChange={(e) => handleDealSelection(deal.Id, e.target.checked)}
                    className="rounded border-gray-300 focus:ring-primary-500"
                  />
                </div>
                <div className="ml-8">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${getStageColor(deal.stage)}`}></div>
                    <Badge variant="default" size="sm">
                      {getStageLabel(deal.stage)}
                    </Badge>
                    <div className="flex items-center space-x-3 text-sm">
                      <div className="flex items-center space-x-1">
                        <ApperIcon name="Clock" size={14} className={getStageDurationColor(currentStageDuration, deal.stage)} />
                        <span className={getStageDurationColor(currentStageDuration, deal.stage)}>
                          {formatDuration(currentStageDuration)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-slate-500">
                        <ApperIcon name="Calendar" size={14} />
                        <span>{formatDuration(totalDealAge)} total</span>
                      </div>
</div>
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                    {deal.title}
                  </h3>
                  <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    ${parseInt(deal.amount).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => {
                      setSelectedDeal(deal)
                      setIsModalOpen(true)
                    }}
                    className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200"
                  >
                    <ApperIcon name="Edit" className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(deal.Id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  >
                    <ApperIcon name="Trash2" className="h-4 w-4" />
                  </button>
                </div>
              </div>

<div className="flex items-center justify-between mb-3">
                {deal.contactId && (
                  <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                    <ApperIcon name="User" className="h-4 w-4" />
                    <span>{getContactName(deal.contactId)}</span>
                  </div>
                )}
              </div>

              {deal.tags && deal.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {deal.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex items-center space-x-2 mb-3">
                <ApperIcon name="TrendingUp" className="h-4 w-4 text-slate-400" />
                <span className={`text-sm font-medium ${getProbabilityColor(deal.probability)}`}>
                  {deal.probability}% probability
                </span>
              </div>

              {deal.closeDate && (
                <div className="flex items-center space-x-2 mb-4 text-sm text-slate-600 dark:text-slate-400">
                  <ApperIcon name="Calendar" className="h-4 w-4" />
                  <span>Close by {format(new Date(deal.closeDate), "MMM d, yyyy")}</span>
                </div>
              )}

<div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
                <div className="space-y-1">
                  <div className="text-xs text-slate-400">
                    Created {format(new Date(deal.createdAt), "MMM d, yyyy")}
                    {deal.createdBy && (
                      <span className="ml-1">by {getUserDisplayName(deal.createdBy)}</span>
                    )}
                  </div>
                  {deal.updatedAt && deal.updatedAt !== deal.createdAt && (
                    <div className="text-xs text-slate-400">
                      Updated {format(new Date(deal.updatedAt), "MMM d, yyyy")}
                      {deal.modifiedBy && (
                        <span className="ml-1">by {getUserDisplayName(deal.modifiedBy)}</span>
                      )}
                    </div>
                  )}
                  {deal.owner && (
                    <div className="text-xs text-slate-400">
                      Owner: {getUserDisplayName(deal.owner)}
                    </div>
                  )}
                </div>

                <select
                  value={deal.stage}
                  onChange={(e) => handleStageChange(deal.Id, e.target.value)}
                  className="text-sm border border-slate-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  onClick={(e) => e.stopPropagation()}
                >
                  {stages.map(stage => (
                    <option key={stage.id} value={stage.id}>
                      {stage.label}
                    </option>
                  ))}
                </select>
              </div>

              {deal.notes && (
                <div className="mt-3 p-2 bg-slate-50 dark:bg-slate-700 rounded text-sm text-slate-600 dark:text-slate-400">
                  {deal.notes.length > 100 ? `${deal.notes.substring(0, 100)}...` : deal.notes}
                </div>
              )}

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>Progress</span>
                  <span>{deal.probability}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full bg-gradient-to-r from-primary-500 to-primary-600`}
                    style={{ width: `${deal.probability}%` }}
                  ></div>
                </div>
</div>

              {/* Deal Owner Assignment Display */}
              {deal.dealOwner && (
<div className="mt-3 flex items-center space-x-2">
                  <AssigneeDisplay assignee={deal.dealOwner} />
                </div>
              )}
            </div>
            </div>
          )
        })}
        </div>
      )}

{/* Bulk Assignment Progress Indicator */}
      {isBulkAssigning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="flex items-center space-x-3">
              <div className="animate-spin h-6 w-6 border-2 border-primary-500 border-t-transparent rounded-full"></div>
              <div>
                <h3 className="font-medium">Assigning Deals</h3>
                <p className="text-sm text-gray-500">Please wait while we assign {selectedDeals.length} deal{selectedDeals.length !== 1 ? 's' : ''}...</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deal Modal */}
      <DealModal
        isOpen={isModalOpen}
        deal={selectedDeal}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedDeal(null)
        }}
        onSave={handleDealSave}
      />
    </div>
  )
}

export default Deals