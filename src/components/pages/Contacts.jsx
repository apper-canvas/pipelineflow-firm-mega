import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { contactService } from "@/services/api/contactService";
import { format } from "date-fns";
import { activityService } from "@/services/api/activityService";
import { teamMemberService } from "@/services/api/teamMemberService";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Badge from "@/components/atoms/Badge";
import SearchBar from "@/components/molecules/SearchBar";
import AssigneeDisplay from "@/components/molecules/AssigneeDisplay";
import AssigneeSelector from "@/components/molecules/AssigneeSelector";
const ContactModal = ({ isOpen, contact, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    position: "",
tags: [],
assignedTo: null,
    assignmentHistory: []
  });
const [saving, setSaving] = useState(false);

useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name || "",
        email: contact.email || "",
        phone: contact.phone || "",
        company: contact.company || "",
        position: contact.position || "",
        tags: contact.tags || [],
        assignedTo: contact.assignedTo || null,
        assignmentHistory: contact.assignmentHistory || []
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        position: "",
        assignedTo: null,
        assignmentHistory: [],
        tags: []
      });
    }
  }, [contact]);

const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    setSaving(true);
    try {
      const savedContact = contact
        ? await contactService.update(contact.Id, formData)
        : await contactService.create(formData);
      
      onSave(savedContact);
      toast.success(contact ? "Contact updated successfully" : "Contact created successfully");
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to save contact");
    } finally {
      setSaving(false);
    }
  };

if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md animate-scale-in">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
{contact ? "Edit Contact" : "New Contact"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
            <ApperIcon name="X" className="h-4 w-4" />
          </button>
        </div>

<form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name *"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="John Doe"
              required
            />
            
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
            
            <Input
              label="Company"
              value={formData.company}
              onChange={(e) => setFormData({...formData, company: e.target.value})}
              placeholder="Acme Inc."
            />
            
<Input
              label="Job Title"
              value={formData.position}
              onChange={(e) => setFormData({...formData, position: e.target.value})}
              placeholder="Sales Manager"
            />
          </div>
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Assigned To
            </label>
            <AssigneeSelector
value={formData.assignedTo}
              onChange={(value) => setFormData({...formData, assignedTo: value})}
              placeholder="Assign to team member..."
              className="flex-1"
            />
          </div>
          
          <div className="text-xs text-slate-500 mt-2">
            * Required field
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? "Saving..." : contact ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
);
};

const DeleteConfirmModal = ({ isOpen, contactName, onClose, onConfirm, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-scale-in">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
              <ApperIcon name="AlertTriangle" className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Delete Contact</h3>
          </div>
          
          <p className="text-slate-600 mb-6">
            Are you sure you want to delete <span className="font-semibold">{contactName}</span>? 
            This action cannot be undone.
          </p>
          
          <div className="flex space-x-3">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </div>
</div>
  );
};

const Contacts = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, contact: null });
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedContact, setExpandedContact] = useState(null);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [contactActivities, setContactActivities] = useState({});
  const [showTimeline, setShowTimeline] = useState({ isOpen: false, contact: null });
  const [showAvatarUpload, setShowAvatarUpload] = useState({ isOpen: false, contact: null });
  const [isExporting, setIsExporting] = useState(false);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  const [detailModal, setDetailModal] = useState({ isOpen: false, contact: null });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [assigneeFilter, setAssigneeFilter] = useState("");
useEffect(() => {
    loadContacts();
  }, []);
const applyFilters = () => {
    let filtered = [...contacts];

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(contact => 
        contact.name?.toLowerCase().includes(term) ||
        contact.email?.toLowerCase().includes(term) ||
        contact.company?.toLowerCase().includes(term) ||
        contact.phone?.toLowerCase().includes(term) ||
        contact.position?.toLowerCase().includes(term)
      );
    }

    // Assignee filter
if (assigneeFilter === "current-user") {
      const currentUser = teamMemberService.getCurrentUser();
      filtered = filtered.filter(contact => contact.assignedTo === currentUser.Id);
    } else if (assigneeFilter === "unassigned") {
      filtered = filtered.filter(contact => !contact.assignedTo);
    }

    setFilteredContacts(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [contacts, searchTerm, assigneeFilter]);


  // Load activities for all contacts
// Load activities for all contacts
  useEffect(() => {
    const loadActivities = async () => {
      try {
        const activities = await activityService.getAll();
        const activitiesByContact = activities.reduce((acc, activity) => {
          if (activity.contactId) {
            if (!acc[activity.contactId]) {
              acc[activity.contactId] = [];
            }
            acc[activity.contactId].push(activity);
          }
          return acc;
        }, {});
        setContactActivities(activitiesByContact);
      } catch (error) {
        console.error('Failed to load activities:', error);
      }
    };
    loadActivities();
  }, []);

const loadContacts = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await contactService.getAll();
      setContacts(data);
    } catch (err) {
      setError("Failed to load contacts");
    } finally {
      setLoading(false);
    }
  };


const handleContactSave = (savedContact) => {
    if (selectedContact) {
      setContacts(contacts.map(c => c.Id === savedContact.Id ? savedContact : c));
    } else {
      setContacts([savedContact, ...contacts]);
    }
  };

const handleDelete = (contact) => {
    setDeleteModal({ isOpen: true, contact });
  };
const confirmDelete = async () => {
    if (!deleteModal.contact) return;
    
    setIsDeleting(true);
    try {
      await contactService.delete(deleteModal.contact.Id);
      setContacts(contacts.filter(c => c.Id !== deleteModal.contact.Id));
      toast.success("Contact deleted successfully");
      setDeleteModal({ isOpen: false, contact: null });
    } catch (error) {
      toast.error(error.message || "Failed to delete contact");
    } finally {
      setIsDeleting(false);
    }
  };

const handleBulkDelete = async () => {
    if (selectedContacts.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedContacts.length} contact(s)?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await contactService.bulkDelete(selectedContacts);
      setContacts(contacts.filter(c => !selectedContacts.includes(c.Id)));
      toast.success(`${selectedContacts.length} contact(s) deleted successfully`);
      setSelectedContacts([]);
    } catch (error) {
      toast.error(error.message || "Failed to delete contacts");
    } finally {
      setIsDeleting(false);
    }
  };
// Bulk assignment handlers
  const [bulkAssigneeId, setBulkAssigneeId] = useState(null)
  const [isBulkAssigning, setIsBulkAssigning] = useState(false)

  const handleBulkAssign = async (assigneeId) => {
    if (selectedContacts.length === 0) {
      toast.error("No contacts selected for assignment")
      return
    }
    
    setIsBulkAssigning(true)
    try {
      const result = await contactService.bulkAssign(selectedContacts, assigneeId)
      
      // Refresh data
      await loadContacts()
      
      // Clear selection
      setSelectedContacts([])
      setBulkAssigneeId(null)
      
let assigneeName = 'Unassigned';
      if (assigneeId) {
        try {
          const teamMembers = await teamMemberService.getAll();
          const assignee = teamMembers.find(m => m.Id === assigneeId);
          assigneeName = assignee?.name || 'Selected assignee';
        } catch (error) {
          console.error('Failed to get assignee name:', error);
          assigneeName = 'Selected assignee';
        }
      }
      
      toast.success(`Successfully assigned ${result.updated} contact${result.updated !== 1 ? 's' : ''} to ${assigneeName}`)
    } catch (error) {
      console.error("Bulk assignment error:", error)
      toast.error(error.message || "Failed to assign contacts")
    } finally {
      setIsBulkAssigning(false)
    }
  }

const handleSelectContact = (contactId) => {
    setSelectedContacts(prev => 
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

const handleSelectAll = () => {
    if (selectedContacts.length === filteredContacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(filteredContacts.map(c => c.Id));
    }
  };
const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      const csvData = await contactService.exportToCsv();
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `contacts-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Contacts exported successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to export contacts');
    } finally {
      setIsExporting(false);
    }
  };

const handleAvatarUpload = async (contactId, file) => {
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          await contactService.updateAvatar(contactId, e.target.result);
          const updatedContacts = await contactService.getAll();
          setContacts(updatedContacts);
          toast.success('Profile picture updated successfully');
          setShowAvatarUpload({ isOpen: false, contact: null });
        } catch (error) {
          toast.error(error.message || 'Failed to update profile picture');
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Failed to process image file');
    }
  };


const getInitials = (name) => {
    if (!name) return "??";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
const sortedContacts = React.useMemo(() => {
    let sortableContacts = [...filteredContacts];
    if (sortConfig.key) {
      sortableContacts.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableContacts;
  }, [filteredContacts, sortConfig]);


if (loading) return <Loading type="skeleton" />;
  if (error) return <ErrorView message={error} onRetry={loadContacts} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Contacts</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage your customer relationships and contact information.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                viewMode === 'cards' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ApperIcon name="Grid3X3" className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                viewMode === 'table' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ApperIcon name="List" className="h-4 w-4" />
            </button>
          </div>
          
          <Button 
            onClick={handleExportCsv}
            disabled={isExporting}
            variant="secondary"
            className="flex items-center space-x-2"
          >
            <ApperIcon name={isExporting ? "Loader2" : "Download"} className={`h-4 w-4 ${isExporting ? 'animate-spin' : ''}`} />
            <span>Export CSV</span>
          </Button>
          <Button 
            onClick={() => {
              setSelectedContact(null)
              setIsModalOpen(true)
            }}
            className="flex items-center space-x-2"
          >
            <ApperIcon name="Plus" className="h-4 w-4" />
            <span>Add Contact</span>
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex-1">
          <SearchBar
            placeholder="Search contacts by name, company, email, or phone..."
            onSearch={setSearchTerm}
          />
        </div>
        <select
          className="input-field w-full sm:w-auto"
          value={assigneeFilter}
          onChange={(e) => setAssigneeFilter(e.target.value)}
        >
          <option value="">All Contacts</option>
          <option value="current-user">My Contacts</option>
          <option value="unassigned">Unassigned</option>
        </select>
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedContacts.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-blue-700">
              {selectedContacts.length} contact(s) selected
</span>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <AssigneeSelector
                  value={bulkAssigneeId}
                  onChange={handleBulkAssign}
                  placeholder="Assign to..."
                  bulkMode={true}
                  className="w-64"
                />
              </div>
              <Button
                onClick={handleBulkDelete}
                disabled={isDeleting || isBulkAssigning}
                variant="secondary"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                <ApperIcon name="Trash2" className="h-4 w-4 mr-1" />
                Delete Selected
              </Button>
            </div>
          </div>
          <Button
            onClick={() => setSelectedContacts([])}
            variant="ghost"
            size="sm"
          >
            <ApperIcon name="X" className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Select All Checkbox */}
      {filteredContacts.length > 0 && (
        <div className="flex items-center space-x-2 py-2">
          <input
            type="checkbox"
            checked={selectedContacts.length === filteredContacts.length}
            onChange={handleSelectAll}
            className="rounded border-gray-300 focus:ring-primary-500"
          />
          <label className="text-sm text-gray-600">
            Select all ({filteredContacts.length})
          </label>
        </div>
      )}

      {sortedContacts.length === 0 ? (
        <Empty 
          icon="Users"
          title={searchTerm ? "No contacts found" : "No contacts yet"}
message={searchTerm ? "Try adjusting your search terms." : "Start building your customer database by adding your first contact."}
          actionLabel="Add Contact"
          onAction={() => {
            setSelectedContact(null)
            setIsModalOpen(true)
          }}
        />
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
<thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedContacts.length === sortedContacts.length}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 focus:ring-primary-500"
                    />
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Contact</span>
                      <ApperIcon 
                        name={sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? 'ChevronUp' : 'ChevronDown') : 'ChevronsUpDown'} 
                        className="h-4 w-4" 
                      />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('company')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Company</span>
                      <ApperIcon 
                        name={sortConfig.key === 'company' ? (sortConfig.direction === 'asc' ? 'ChevronUp' : 'ChevronDown') : 'ChevronsUpDown'} 
                        className="h-4 w-4" 
                      />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Info
                  </th>
<th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('Owner')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Owner</span>
                      <ApperIcon 
                        name={sortConfig.key === 'Owner' ? (sortConfig.direction === 'asc' ? 'ChevronUp' : 'ChevronDown') : 'ChevronsUpDown'} 
                        className="h-4 w-4" 
                      />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('CreatedBy')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Created By</span>
                      <ApperIcon 
                        name={sortConfig.key === 'CreatedBy' ? (sortConfig.direction === 'asc' ? 'ChevronUp' : 'ChevronDown') : 'ChevronsUpDown'} 
                        className="h-4 w-4" 
                      />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('CreatedOn')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Created On</span>
                      <ApperIcon 
                        name={sortConfig.key === 'CreatedOn' ? (sortConfig.direction === 'asc' ? 'ChevronUp' : 'ChevronDown') : 'ChevronsUpDown'} 
                        className="h-4 w-4" 
                      />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('ModifiedOn')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Modified On</span>
                      <ApperIcon 
                        name={sortConfig.key === 'ModifiedOn' ? (sortConfig.direction === 'asc' ? 'ChevronUp' : 'ChevronDown') : 'ChevronsUpDown'} 
                        className="h-4 w-4" 
                      />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('ModifiedBy')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Modified By</span>
                      <ApperIcon 
                        name={sortConfig.key === 'ModifiedBy' ? (sortConfig.direction === 'asc' ? 'ChevronUp' : 'ChevronDown') : 'ChevronsUpDown'} 
                        className="h-4 w-4" 
                      />
                    </div>
                  </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedContacts.map((contact) => (
                  <tr key={contact.Id} className={`hover:bg-gray-50 ${selectedContacts.includes(contact.Id) ? 'bg-primary-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedContacts.includes(contact.Id)}
                        onChange={() => handleSelectContact(contact.Id)}
                        className="rounded border-gray-300 focus:ring-primary-500"
                      />
                    </td>
<td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {contact.avatar ? (
                            <img 
                              src={contact.avatar} 
                              alt={contact.name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                              <span className="text-sm font-semibold text-white">
                                {getInitials(contact.name)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4 flex-1">
<div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                              {contact.position && (
                                <div className="text-sm text-gray-500">{contact.position}</div>
                              )}
                              {contact.tags && contact.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {contact.tags.slice(0, 2).map((tag, index) => (
                                    <Badge key={index} variant="default" size="sm">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {contact.tags.length > 2 && (
                                    <span className="text-xs text-gray-400">+{contact.tags.length - 2}</span>
                                  )}
                                </div>
                              )}
                            </div>
                            {contact.assignedTo && (
                              <AssigneeDisplay 
                                assigneeId={contact.assignedTo} 
                                size="sm"
                                showName={false}
                              />
                            )}
</div>
                        </div>
                      </div>
                    </td>
<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {contact.company || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="space-y-1">
                        {contact.email && (
                          <div className="flex items-center">
                            <ApperIcon name="Mail" className="h-3 w-3 mr-2" />
                            <a href={`mailto:${contact.email}`} className="text-primary-600 hover:text-primary-900">
                              {contact.email}
                            </a>
                          </div>
                        )}
                        {contact.phone && (
                          <div className="flex items-center">
                            <ApperIcon name="Phone" className="h-3 w-3 mr-2" />
                            <a href={`tel:${contact.phone}`} className="text-primary-600 hover:text-primary-900">
                              {contact.phone}
                            </a>
                          </div>
                        )}
                      </div>
                    </td>
<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {contact.Owner?.Name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {contact.CreatedBy?.Name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {contact.CreatedOn ? format(new Date(contact.CreatedOn), "MMM d, yyyy") : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {contact.ModifiedOn ? format(new Date(contact.ModifiedOn), "MMM d, yyyy") : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {contact.ModifiedBy?.Name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setDetailModal({ isOpen: true, contact })}
                          className="text-primary-600 hover:text-primary-900 p-1 rounded"
                          title="View Details"
                        >
                          <ApperIcon name="Eye" className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedContact(contact)
                            setIsModalOpen(true)
                          }}
                          className="text-primary-600 hover:text-primary-900 p-1 rounded"
                          title="Edit"
                        >
                          <ApperIcon name="Edit" className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(contact)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          title="Delete"
                        >
                          <ApperIcon name="Trash2" className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
) : (
        /* Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedContacts.map((contact) => (
            <div 
              key={contact.Id} 
              className={`card hover:shadow-lg transition-all duration-200 group relative ${selectedContacts.includes(contact.Id) ? 'ring-2 ring-primary-500 bg-primary-50' : ''}`}
            >
              {/* Selection Checkbox */}
              <div className="absolute top-4 left-4 z-10">
                <input
                  type="checkbox"
                  checked={selectedContacts.includes(contact.Id)}
                  onChange={() => handleSelectContact(contact.Id)}
                  onClick={(e) => e.stopPropagation()}
                  className="rounded border-gray-300 focus:ring-primary-500"
                />
              </div>
<div 
                className="cursor-pointer pl-8"
                onClick={() => setExpandedContact(expandedContact === contact.Id ? null : contact.Id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="relative">
                      {contact.avatar ? (
                        <img 
                          src={contact.avatar} 
                          alt={contact.name}
                          className="h-12 w-12 rounded-full object-cover"
/>
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                          <span className="text-sm font-semibold text-white">
                            {getInitials(contact.name)}
                          </span>
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowAvatarUpload({ isOpen: true, contact })
                        }}
                        className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        <ApperIcon name="Camera" className="h-3 w-3 text-gray-600" />
                      </button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {contact.name}
                        </h3>
{contact.assignedTo && (
                          <AssigneeDisplay 
                            assigneeId={contact.assignedTo} 
                            size="sm"
                            showName={false}
                          />
                        )}
                      </div>
                      {contact.position && contact.company && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                          {contact.position} at {contact.company}
                        </p>
                      )}
                      {!expandedContact || expandedContact !== contact.Id ? (
                        contact.email && (
                          <p className="text-sm text-slate-500 dark:text-slate-500 truncate">
                            {contact.email}
                          </p>
                        )
                      ) : null}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setDetailModal({ isOpen: true, contact })
                    }}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <ApperIcon name="Eye" className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowTimeline({ isOpen: true, contact })
                    }}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View Activity Timeline"
                  >
                    <ApperIcon name="Clock" className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedContact(contact)
                      setIsModalOpen(true)
                    }}
                    className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200"
                    title="Edit contact"
                  >
                    <ApperIcon name="Edit" className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(contact)
                    }}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    title="Delete contact"
                  >
                    <ApperIcon name="Trash2" className="h-4 w-4" />
</button>
                  </div>
                </div>

                {/* Expanded Details */}
              {expandedContact === contact.Id && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3 animate-slide-up">
                  {contact.email && (
                    <div className="flex items-center space-x-2 text-sm">
                      <ApperIcon name="Mail" className="h-4 w-4 text-slate-400" />
                      <a 
                        href={`mailto:${contact.email}`}
                        className="text-primary-600 hover:text-primary-700 break-all"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {contact.email}
                      </a>
                    </div>
                  )}
                  
                  {contact.phone && (
                    <div className="flex items-center space-x-2 text-sm">
                      <ApperIcon name="Phone" className="h-4 w-4 text-slate-400" />
                      <a 
                        href={`tel:${contact.phone}`}
                        className="text-primary-600 hover:text-primary-700"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {contact.phone}
                      </a>
                    </div>
                  )}
                  
                  {contact.company && (
                    <div className="flex items-center space-x-2 text-sm">
                      <ApperIcon name="Building2" className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600 dark:text-slate-400">{contact.company}</span>
                    </div>
                  )}
                  
                  {contact.position && (
                    <div className="flex items-center space-x-2 text-sm">
                      <ApperIcon name="Briefcase" className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600 dark:text-slate-400">{contact.position}</span>
                    </div>
                  )}
{contact.CreatedOn && (
                    <div className="flex items-center space-x-2 text-sm">
                      <ApperIcon name="Calendar" className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-500 dark:text-slate-500">
                        Created {format(new Date(contact.CreatedOn), "MMM d, yyyy")}
                      </span>
                    </div>
                  )}

                  {contact.ModifiedOn && (
                    <div className="flex items-center space-x-2 text-sm">
                      <ApperIcon name="Clock" className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-500 dark:text-slate-500">
                        Last Modified {format(new Date(contact.ModifiedOn), "MMM d, yyyy")}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
                  {contact.phone && (
                    <a 
                      href={`tel:${contact.phone}`}
                      className="flex items-center space-x-1 hover:text-primary-600 transition-colors duration-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ApperIcon name="Phone" className="h-4 w-4" />
                      <span>Call</span>
                    </a>
                  )}
                  {contact.email && (
                    <a 
                      href={`mailto:${contact.email}`}
                      className="flex items-center space-x-1 hover:text-primary-600 transition-colors duration-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ApperIcon name="Mail" className="h-4 w-4" />
                      <span>Email</span>
                    </a>
                  )}
                  
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center space-x-1 hover:text-primary-600 transition-colors duration-200"
                  >
                    <ApperIcon name={expandedContact === contact.Id ? "ChevronUp" : "ChevronDown"} className="h-4 w-4" />
                    <span>{expandedContact === contact.Id ? "Less" : "More"}</span>
                  </button>
                </div>
                
                {contact.lastContactedAt && (
                  <div className="text-xs text-slate-400">
                    Last contact: {format(new Date(contact.lastContactedAt), "MMM d")}
                  </div>
                )}
              </div>

              {contact.tags && contact.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {contact.tags.slice(0, 2).map((tag, index) => (
                    <Badge key={index} variant="default" size="sm">
                      {tag}
                    </Badge>
                  ))}
                  {contact.tags.length > 2 && (
                    <Badge variant="default" size="sm">
                      +{contact.tags.length - 2}
                    </Badge>
                  )}
                </div>
              )}

              {/* Recent Activity Preview */}
              {contactActivities[contact.Id] && contactActivities[contact.Id].length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Recent Activity:</p>
                  <p className="text-sm text-gray-700 truncate">
                    {contactActivities[contact.Id][0].description}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(contactActivities[contact.Id][0].createdAt).toLocaleDateString()}
                  </p>
                </div>
              )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ContactModal
        isOpen={isModalOpen}
        contact={selectedContact}
onClose={() => {
          setIsModalOpen(false)
          setSelectedContact(null)
        }}
        onSave={handleContactSave}
      />

      {/* Contact Detail Modal */}
      {detailModal.isOpen && detailModal.contact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">Contact Details</h2>
              <button
                onClick={() => setDetailModal({ isOpen: false, contact: null })}
                className="text-gray-400 hover:text-gray-600"
              >
                <ApperIcon name="X" className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="flex items-start space-x-6 mb-6">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {detailModal.contact.avatar ? (
                    <img 
                      src={detailModal.contact.avatar} 
                      alt={detailModal.contact.name}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                      <span className="text-xl font-semibold text-white">
                        {getInitials(detailModal.contact.name)}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Basic Info */}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {detailModal.contact.name}
                  </h3>
                  {detailModal.contact.position && detailModal.contact.company && (
                    <p className="text-lg text-gray-600 mb-2">
                      {detailModal.contact.position} at {detailModal.contact.company}
                    </p>
                  )}
                  
                  {/* Quick Actions */}
                  <div className="flex items-center space-x-3 mt-4">
                    {detailModal.contact.email && (
                      <a
                        href={`mailto:${detailModal.contact.email}`}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <ApperIcon name="Mail" className="h-4 w-4 mr-2" />
                        Email
                      </a>
                    )}
                    {detailModal.contact.phone && (
                      <a
                        href={`tel:${detailModal.contact.phone}`}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <ApperIcon name="Phone" className="h-4 w-4 mr-2" />
                        Call
                      </a>
                    )}
                    <button
                      onClick={() => {
                        setSelectedContact(detailModal.contact)
                        setIsModalOpen(true)
                        setDetailModal({ isOpen: false, contact: null })
                      }}
                      className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                    >
                      <ApperIcon name="Edit" className="h-4 w-4 mr-2" />
                      Edit
                    </button>
                  </div>
                </div>
              </div>

              {/* Contact Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Details */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-3">
                    Contact Information
                  </h4>
                  <div className="space-y-3">
                    {detailModal.contact.email && (
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <ApperIcon name="Mail" className="h-5 w-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-900">{detailModal.contact.email}</p>
                          <p className="text-xs text-gray-500">Email</p>
                        </div>
                      </div>
                    )}
                    
                    {detailModal.contact.phone && (
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <ApperIcon name="Phone" className="h-5 w-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-900">{detailModal.contact.phone}</p>
                          <p className="text-xs text-gray-500">Phone</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Organization Details */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-3">
                    Organization
                  </h4>
                  <div className="space-y-3">
                    {detailModal.contact.company && (
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <ApperIcon name="Building2" className="h-5 w-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-900">{detailModal.contact.company}</p>
                          <p className="text-xs text-gray-500">Company</p>
                        </div>
                      </div>
                    )}
                    
                    {detailModal.contact.position && (
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <ApperIcon name="Briefcase" className="h-5 w-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-900">{detailModal.contact.position}</p>
                          <p className="text-xs text-gray-500">Position</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

{/* System Information */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-3">
                    System Information
                  </h4>
                  <div className="space-y-3">
                    {(detailModal.contact.Owner || detailModal.contact.Owner !== null) && (
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <ApperIcon name="User" className="h-5 w-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-900">
                            {detailModal.contact.Owner?.Name || 
                             (typeof detailModal.contact.Owner === 'string' ? detailModal.contact.Owner : 'System')}
                          </p>
                          <p className="text-xs text-gray-500">Owner</p>
                        </div>
                      </div>
                    )}
                    
                    {(detailModal.contact.CreatedBy || detailModal.contact.CreatedBy !== null) && (
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <ApperIcon name="UserPlus" className="h-5 w-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-900">
                            {detailModal.contact.CreatedBy?.Name || 
                             (typeof detailModal.contact.CreatedBy === 'string' ? detailModal.contact.CreatedBy : 'System')}
                          </p>
                          <p className="text-xs text-gray-500">Created By</p>
                        </div>
                      </div>
                    )}
                    
                    {(detailModal.contact.ModifiedBy || detailModal.contact.ModifiedBy !== null) && (
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <ApperIcon name="Edit" className="h-5 w-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-900">
                            {detailModal.contact.ModifiedBy?.Name || 
                             (typeof detailModal.contact.ModifiedBy === 'string' ? detailModal.contact.ModifiedBy : 'System')}
                          </p>
                          <p className="text-xs text-gray-500">Last Modified By</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-3">
                    Timeline
                  </h4>
                  <div className="space-y-3">
                    {detailModal.contact.CreatedOn && (
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <ApperIcon name="Calendar" className="h-5 w-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-900">
                            {format(new Date(detailModal.contact.CreatedOn), "MMM d, yyyy 'at' h:mm a")}
                          </p>
                          <p className="text-xs text-gray-500">Created On</p>
                        </div>
                      </div>
                    )}

                    {detailModal.contact.ModifiedOn && (
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <ApperIcon name="Clock" className="h-5 w-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-900">
                            {format(new Date(detailModal.contact.ModifiedOn), "MMM d, yyyy 'at' h:mm a")}
                          </p>
                          <p className="text-xs text-gray-500">Modified On</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                </div>
              </div>

              {/* Tags */}
                {detailModal.contact.tags && detailModal.contact.tags.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-3">
                      Tags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {detailModal.contact.tags.map((tag, index) => (
                        <Badge key={index} variant="default" size="sm">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Recent Activity */}
              {contactActivities[detailModal.contact.Id] && contactActivities[detailModal.contact.Id].length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-3">
                    Recent Activity
                  </h4>
                  <div className="space-y-3">
                    {contactActivities[detailModal.contact.Id].slice(0, 3).map((activity) => (
                      <div key={activity.Id} className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center">
                            <ApperIcon 
                              name={activity.type === 'deal' ? 'DollarSign' : activity.type === 'task' ? 'CheckSquare' : 'User'} 
                              className="h-3 w-3 text-primary-600" 
                            />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">{activity.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(activity.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {contactActivities[detailModal.contact.Id].length > 3 && (
                      <button
                        onClick={() => {
                          setShowTimeline({ isOpen: true, contact: detailModal.contact })
                          setDetailModal({ isOpen: false, contact: null })
                        }}
                        className="text-sm text-primary-600 hover:text-primary-900"
                      >
                        View all activities ({contactActivities[detailModal.contact.Id].length})
                      </button>
                    )}
                  </div>
</div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Activity Timeline Modal */}
      {/* Activity Timeline Modal */}
      {showTimeline.isOpen && showTimeline.contact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">
                Activity Timeline - {showTimeline.contact.name}
              </h2>
              <button
                onClick={() => setShowTimeline({ isOpen: false, contact: null })}
                className="text-gray-400 hover:text-gray-600"
              >
                <ApperIcon name="X" className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 max-h-96 overflow-y-auto">
              {contactActivities[showTimeline.contact.Id] && contactActivities[showTimeline.contact.Id].length > 0 ? (
                <div className="space-y-4">
                  {contactActivities[showTimeline.contact.Id].map((activity, index) => (
                    <div key={activity.Id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <ApperIcon 
                            name={activity.type === 'deal' ? 'DollarSign' : activity.type === 'task' ? 'CheckSquare' : 'User'} 
                            className="h-4 w-4 text-primary-600" 
                          />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">{activity.userName}</span> {activity.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(activity.createdAt).toLocaleString()}
                        </p>
                        {activity.priority && (
                          <Badge 
                            variant={activity.priority === 'high' ? 'destructive' : activity.priority === 'medium' ? 'default' : 'secondary'} 
                            size="sm"
                            className="mt-1"
                          >
                            {activity.priority}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ApperIcon name="Clock" className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No activities found for this contact</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Avatar Upload Modal */}
      {showAvatarUpload.isOpen && showAvatarUpload.contact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">
                Update Profile Picture
              </h2>
              <button
                onClick={() => setShowAvatarUpload({ isOpen: false, contact: null })}
                className="text-gray-400 hover:text-gray-600"
              >
                <ApperIcon name="X" className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="text-center">
                {showAvatarUpload.contact.avatar ? (
                  <img 
                    src={showAvatarUpload.contact.avatar} 
                    alt={showAvatarUpload.contact.name}
                    className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-semibold text-white">
                      {getInitials(showAvatarUpload.contact.name)}
                    </span>
                  </div>
                )}
                
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleAvatarUpload(showAvatarUpload.contact.Id, e.target.files[0])}
                  className="hidden"
                  id="avatar-upload"
                />
                <label
                  htmlFor="avatar-upload"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  <ApperIcon name="Upload" className="h-4 w-4 mr-2" />
                  Choose New Photo
                </label>
                
                <p className="text-xs text-gray-500 mt-2">
                  Supported formats: JPG, PNG, GIF (max 5MB)
                </p>
              </div>
            </div>
          </div>
        </div>
)}

      {/* Bulk Assignment Progress Indicator */}
      {isBulkAssigning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="flex items-center space-x-3">
              <div className="animate-spin h-6 w-6 border-2 border-primary-500 border-t-transparent rounded-full"></div>
              <div>
                <h3 className="font-medium">Assigning Contacts</h3>
                <p className="text-sm text-gray-500">Please wait while we assign {selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''}...</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        contactName={deleteModal.contact?.name}
        onClose={() => setDeleteModal({ isOpen: false, contact: null })}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default Contacts;