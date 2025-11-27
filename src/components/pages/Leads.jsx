import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { leadService } from "@/services/api/leadService";
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

const LeadModal = ({ isOpen, lead, onClose, onSave }) => {
const [formData, setFormData] = useState({
title: "",
    company: "",
    contactName: "",
    email: "",
    phone: "",
    value: "",
    budget: "",
    timeline: "",
    source: "website",
    stage: "new",
    notes: "",
assignedTo: null,
    assignmentHistory: [],
    qualification: {
      budget: false,
      authority: false,
      need: false,
      timeline: false,
      decisionProcess: false,
      competition: false,
      fit: false
    }
  })
  const [saving, setSaving] = useState(false)

useEffect(() => {
    if (lead) {
      setFormData({
        title: lead.title || "",
        company: lead.company || "",
        contactName: lead.contactName || "",
        email: lead.email || "",
        phone: lead.phone || "",
        value: lead.value || "",
        budget: lead.budget || "",
        timeline: lead.timeline || "",
        source: lead.source || "website",
        stage: lead.stage || "new",
        notes: lead.notes || "",
        assignedTo: lead.assignedTo || null,
        assignmentHistory: lead.assignmentHistory || [],
        qualification: lead.qualification || {
          budget: false,
          authority: false,
          need: false,
          timeline: false,
          decisionProcess: false,
          competition: false,
          fit: false
        }
      })
    } else {
      setFormData({
        title: "",
        company: "",
        contactName: "",
        email: "",
        phone: "",
        value: "",
        budget: "",
        timeline: "",
        source: "website",
        stage: "new",
        notes: "",
        assignedTo: null,
        assignmentHistory: [],
        qualification: {
          budget: false,
          authority: false,
          need: false,
          timeline: false,
          decisionProcess: false,
          competition: false,
          fit: false
        }
      })
    }
  }, [lead])

const [showQualificationModal, setShowQualificationModal] = useState(false)
  const [qualifyingLead, setQualifyingLead] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
if (!formData.title.trim() || !formData.company.trim()) {
      toast.error("Title and company are required")
      return
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Please enter a valid email address")
      return
    }

    setSaving(true)
    try {
      const savedLead = lead
        ? await leadService.update(lead.Id, formData)
        : await leadService.create(formData)
      
      onSave(savedLead)
      toast.success(lead ? "Lead updated successfully" : "Lead created successfully")
      onClose()
    } catch (error) {
      toast.error("Failed to save lead")
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
            {lead ? "Edit Lead" : "New Lead"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
            <ApperIcon name="X" className="h-4 w-4" />
          </button>
        </div>

<form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <Input
            label="Lead Title"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            placeholder="New Business Opportunity"
            required
          />

          <Input
            label="Company"
            value={formData.company}
            onChange={(e) => setFormData({...formData, company: e.target.value})}
            placeholder="Company Name"
            required
          />

          <Input
            label="Contact Name"
            value={formData.contactName}
            onChange={(e) => setFormData({...formData, contactName: e.target.value})}
            placeholder="John Doe"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="john@company.com"
            />

            <Input
              label="Phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Deal Value"
              type="number"
              value={formData.value}
              onChange={(e) => setFormData({...formData, value: e.target.value})}
              placeholder="25000"
              min="0"
            />

            <Input
              label="Budget"
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData({...formData, budget: e.target.value})}
              placeholder="30000"
              min="0"
            />
          </div>

          <Input
            label="Timeline"
            value={formData.timeline}
            onChange={(e) => setFormData({...formData, timeline: e.target.value})}
            placeholder="Q2 2024"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Source
              </label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({...formData, source: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-slate-800 dark:border-slate-600"
              >
                <option value="website">Website</option>
                <option value="referral">Referral</option>
                <option value="cold-call">Cold Call</option>
                <option value="email">Email</option>
                <option value="trade-show">Trade Show</option>
                <option value="social-media">Social Media</option>
                <option value="partner">Partner</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Stage
              </label>
<select
                value={formData.stage}
                onChange={(e) => setFormData({...formData, stage: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-slate-800 dark:border-slate-600"
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="nurturing">Nurturing</option>
                <option value="converted">Converted</option>
                <option value="lost">Lost</option>
</select>
            </div>
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Assigned To
              </label>
<AssigneeSelector
                value={formData.assignedTo}
                onChange={(value) => setFormData({...formData, assignedTo: value})}
                placeholder="Assign to sales rep..."
                className="flex-1"
              />
            </div>
          </div>

<div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Additional notes about this lead..."
              rows="3"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none bg-white dark:bg-slate-800 dark:border-slate-600"
            />
          </div>

          {/* Qualification Checklist */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Qualification Criteria
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries({
                budget: "Budget Confirmed",
                authority: "Decision Maker Identified",
                need: "Clear Business Need",
                timeline: "Timeline Established",
                decisionProcess: "Decision Process Known",
                competition: "Competition Assessed",
                fit: "Good Product Fit"
              }).map(([key, label]) => (
                <label key={key} className="flex items-center space-x-2 p-2 rounded border border-slate-200 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.qualification[key]}
                    onChange={(e) => setFormData({
                      ...formData,
                      qualification: {
                        ...formData.qualification,
                        [key]: e.target.checked
                      }
                    })}
                    className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
                </label>
              ))}
            </div>
            <div className="mt-2 text-xs text-slate-500">
              Qualification score: {Object.values(formData.qualification).filter(Boolean).length}/7 criteria met
</div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="btn-primary"
            >
              {saving ? 'Saving...' : (lead ? 'Update Lead' : 'Create Lead')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

const Leads = () => {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
const [selectedLead, setSelectedLead] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Bulk assignment state
  const [selectedLeads, setSelectedLeads] = useState([])
  const [bulkAssigneeId, setBulkAssigneeId] = useState(null)
  const [isBulkAssigning, setIsBulkAssigning] = useState(false)

  // Handle bulk assignment
  const handleBulkAssign = async (assigneeId) => {
    if (selectedLeads.length === 0) {
      toast.error("No leads selected for assignment")
      return
    }
    
    setIsBulkAssigning(true)
    try {
      const result = await leadService.bulkAssign(selectedLeads, assigneeId)
      
      // Refresh data
      await loadLeads()
      
      // Clear selection
      setSelectedLeads([])
      setBulkAssigneeId(null)
      
      const assigneeName = assigneeId ? 'Selected assignee' : 'Unassigned'
      toast.success(`Successfully assigned ${result.updated} lead${result.updated !== 1 ? 's' : ''} to ${assigneeName}`)
    } catch (error) {
      console.error("Bulk assignment error:", error)
      toast.error(error.message || "Failed to assign leads")
    } finally {
      setIsBulkAssigning(false)
    }
  }

  // Handle lead selection
  const handleLeadSelection = (leadId, checked) => {
    setSelectedLeads(prev => 
      checked 
        ? [...prev, leadId]
        : prev.filter(id => id !== leadId)
    )
  }
  const [filterStage, setFilterStage] = useState("all")

const stages = [
    { id: "new", label: "New", color: "bg-blue-500" },
    { id: "contacted", label: "Contacted", color: "bg-amber-500" },
    { id: "qualified", label: "Qualified", color: "bg-green-500" },
    { id: "nurturing", label: "Nurturing", color: "bg-purple-500" },
    { id: "converted", label: "Converted", color: "bg-emerald-600" },
    { id: "lost", label: "Lost", color: "bg-red-500" }
  ]

  useEffect(() => {
    loadLeads()
  }, [])

  const loadLeads = async () => {
    try {
      setLoading(true)
      setError("")
      const data = await leadService.getAll()
      setLeads(data)
    } catch (err) {
      setError("Failed to load leads")
    } finally {
      setLoading(false)
    }
  }

  const handleLeadSave = (savedLead) => {
    if (selectedLead) {
      setLeads(leads.map(l => l.Id === savedLead.Id ? savedLead : l))
    } else {
      setLeads([savedLead, ...leads])
    }
  }
// Bulk assignment toolbar
  const BulkAssignmentToolbar = () => {
    if (selectedLeads.length === 0) return null

    return (
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-primary-900">
            {selectedLeads.length} lead{selectedLeads.length !== 1 ? 's' : ''} selected
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
              onClick={() => setSelectedLeads([])}
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
const handleStageChange = async (leadId, newStage) => {
    try {
      const lead = leads.find(l => l.Id === leadId)
      if (!lead) return
      
      const updatedLead = await leadService.update(leadId, { stage: newStage })
      setLeads(leads.map(l => l.Id === leadId ? updatedLead : l))
      
      const stageLabel = getStageLabel(newStage)
      toast.success(`Lead moved to ${stageLabel}`)
      
      // Handle conversion logic
      if (newStage === 'converted') {
        toast.info("Lead converted! Create customer record for full conversion.")
      }
    } catch (error) {
      toast.error("Failed to update lead stage")
    }
  }

  const handleDelete = async (leadId) => {
    if (confirm("Are you sure you want to delete this lead?")) {
      try {
        await leadService.delete(leadId)
        setLeads(leads.filter(l => l.Id !== leadId))
        toast.success("Lead deleted successfully")
      } catch (error) {
        toast.error("Failed to delete lead")
      }
    }
  }

  const getStageColor = (stage) => {
    const stageData = stages.find(s => s.id === stage)
return stageData ? stageData.color : "bg-slate-500"
  }

  const getStageLabel = (stage) => {
    const stageData = stages.find(s => s.id === stage)
    return stageData ? stageData.label : stage
  }

  const getSourceLabel = (source) => {
    const sourceMap = {
      'website': 'Website',
      'linkedin': 'LinkedIn',
      'referral': 'Referral',
      'cold-call': 'Cold Call',
      'event': 'Event',
      'social-media': 'Social Media',
      'email-campaign': 'Email Campaign',
      'trade-show': 'Trade Show',
      'partner': 'Partner',
      'advertising': 'Advertising',
      'other': 'Other'
    }
    return sourceMap[source] || source
  }

const filteredLeads = filterStage === "all" ? leads : leads.filter(lead => lead.stage === filterStage)
  const leadsByStage = stages.reduce((acc, stage) => {
    acc[stage.id] = leads.filter(lead => lead.stage === stage.id)
    return acc
  }, {})

  if (loading) return <Loading type="skeleton" />
  if (error) return <ErrorView message={error} onRetry={loadLeads} />
return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Lead Management</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Track and nurture leads through your sales pipeline from initial contact to conversion.
          </p>
        </div>
        <Button 
          onClick={() => {
            setSelectedLead(null)
            setIsModalOpen(true)
          }}
          className="flex items-center space-x-2"
        >
          <ApperIcon name="Plus" className="h-4 w-4" />
          <span>Add Lead</span>
</Button>
        
        <BulkAssignmentToolbar />
      </div>

{/* Pipeline Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {stages.map(stage => (
          <div key={stage.id} className="card text-center">
            <div className={`w-4 h-4 rounded-full ${stage.color} mx-auto mb-2`}></div>
            <div className="font-medium text-sm text-slate-900 dark:text-slate-100">
              {stage.label}
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              {leadsByStage[stage.id]?.length || 0}
            </div>
          </div>
        ))}
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
          All Leads ({leads.length})
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
            <span>{stage.label} ({leadsByStage[stage.id]?.length || 0})</span>
          </button>
        ))}
      </div>

      {/* Leads Display */}
      {filteredLeads.length === 0 ? (
        <Empty 
          icon="UserPlus"
          title="No leads found"
          message={filterStage === "all" ? "Start capturing leads to grow your sales pipeline." : `No leads in ${getStageLabel(filterStage)} stage.`}
          actionLabel="Add Lead"
          onAction={() => {
            setSelectedLead(null)
            setIsModalOpen(true)
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLeads.map((lead) => {
            const getScoreColor = (score) => {
              if (score >= 71) return 'bg-green-100 text-green-800 border-green-200'
              if (score >= 41) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
              return 'bg-red-100 text-red-800 border-red-200'
            }

            const getScoreLabel = (score) => {
              if (score >= 71) return 'Hot'
              if (score >= 41) return 'Warm'
              return 'Cold'
            }

return (
              <div key={lead.Id} className="relative">
                {/* Selection Checkbox */}
                <div className="absolute top-4 left-4 z-10">
                  <input
                    type="checkbox"
                    checked={selectedLeads.includes(lead.Id)}
                    onChange={(e) => handleLeadSelection(lead.Id, e.target.checked)}
                    className="rounded border-gray-300 focus:ring-primary-500"
                  />
                </div>
                <div className="card hover:shadow-lg transition-all duration-200 group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${getStageColor(lead.stage)}`}></div>
                          <Badge variant="default" size="sm">
                            {getStageLabel(lead.stage)}
                          </Badge>
                          {lead.source && (
                            <Badge variant="outline" size="sm" className="text-xs">
                              {getSourceLabel(lead.source)}
                            </Badge>
                          )}
                        </div>
                        {lead.assignedTo && (
                          <AssigneeDisplay 
                            assigneeId={lead.assignedTo} 
                            size="sm"
                            showName={false}
                          />
                        )}
                      </div>
                      {/* Lead Score Badge */}
                      <div className="flex items-center space-x-2 mb-3">
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getScoreColor(lead.score || 0)}`}>
                          <div className="flex items-center space-x-1">
                            <ApperIcon name="TrendingUp" className="h-3 w-3" />
                            <span>{lead.score || 0}/100</span>
                            <span className="text-xs opacity-75">({getScoreLabel(lead.score || 0)})</span>
                          </div>
                        </div>
                      </div>

                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                        {lead.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">
                        {lead.company}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => {
                          setSelectedLead(lead)
                          setIsModalOpen(true)
                        }}
                        className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200"
                        title="Edit lead"
                      >
                        <ApperIcon name="Edit" className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(lead.Id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        title="Delete lead"
                      >
                        <ApperIcon name="Trash2" className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {lead.contactName && (
                    <div className="flex items-center space-x-2 mb-3 text-sm text-slate-600 dark:text-slate-400">
                      <ApperIcon name="User" className="h-4 w-4" />
                      <span>{lead.contactName}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    {lead.value && (
                      <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                        <ApperIcon name="DollarSign" className="h-4 w-4" />
                        <div>
                          <div className="text-xs opacity-75">Value</div>
                          <div className="font-medium">${parseFloat(lead.value).toLocaleString()}</div>
                        </div>
                      </div>
                    )}

                    {lead.budget && (
                      <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                        <ApperIcon name="Wallet" className="h-4 w-4" />
                        <div>
                          <div className="text-xs opacity-75">Budget</div>
                          <div className="font-medium">${parseFloat(lead.budget).toLocaleString()}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {lead.timeline && (
                    <div className="flex items-center space-x-2 mb-3 text-sm text-slate-600 dark:text-slate-400">
                      <ApperIcon name="Calendar" className="h-4 w-4" />
                      <div>
                        <span className="text-xs opacity-75">Timeline: </span>
                        <span className="font-medium">{lead.timeline}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
                      {lead.email && (
                        <a 
                          href={`mailto:${lead.email}`}
                          className="flex items-center space-x-1 hover:text-primary-600 transition-colors duration-200"
                          title={`Email ${lead.email}`}
                        >
                          <ApperIcon name="Mail" className="h-4 w-4" />
                          <span>Email</span>
                        </a>
                      )}
                      {lead.phone && (
                        <a 
                          href={`tel:${lead.phone}`}
                          className="flex items-center space-x-1 hover:text-primary-600 transition-colors duration-200"
                          title={`Call ${lead.phone}`}
                        >
                          <ApperIcon name="Phone" className="h-4 w-4" />
                          <span>Call</span>
                        </a>
                      )}
                    </div>

                    <select
                      value={lead.stage}
                      onChange={(e) => handleStageChange(lead.Id, e.target.value)}
                      className="text-sm border border-slate-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-800 dark:border-slate-600"
                      onClick={(e) => e.stopPropagation()}
                      title="Change stage"
                    >
                      {stages.map(stage => (
                        <option key={stage.id} value={stage.id}>
                          {stage.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {lead.notes && (
                    <div className="mt-3 p-2 bg-slate-50 dark:bg-slate-700 rounded text-sm text-slate-600 dark:text-slate-400">
                      {lead.notes.length > 100 ? `${lead.notes.substring(0, 100)}...` : lead.notes}
                    </div>
                  )}

                  <div className="mt-3 text-xs text-slate-400">
                    Created {format(new Date(lead.createdAt), "MMM d, yyyy")}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Lead Modal */}
      {/* Bulk Assignment Progress Indicator */}
        {isBulkAssigning && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
              <div className="flex items-center space-x-3">
                <div className="animate-spin h-6 w-6 border-2 border-primary-500 border-t-transparent rounded-full"></div>
                <div>
                  <h3 className="font-medium">Assigning Leads</h3>
                  <p className="text-sm text-gray-500">Please wait while we assign {selectedLeads.length} lead{selectedLeads.length !== 1 ? 's' : ''}...</p>
                </div>
              </div>
            </div>
          </div>
)}

      <LeadModal
        isOpen={isModalOpen}
        lead={selectedLead}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedLead(null)
        }}
        onSave={handleLeadSave}
      />
    </div>
  )
}

export default Leads