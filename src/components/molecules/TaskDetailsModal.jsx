import React, { useState } from 'react';
import { format, isPast, isToday } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import AssigneeDisplay from '@/components/molecules/AssigneeDisplay';
import CommentsPanel from '@/components/molecules/CommentsPanel';
import { cn } from '@/utils/cn';

const TaskDetailsModal = ({ task, isOpen, onClose, onEdit }) => {
  const [activeTab, setActiveTab] = useState('details');

  if (!isOpen || !task) return null;

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'success';
      case 'in-progress': return 'warning';
      case 'pending': return 'secondary';
      case 'blocked': return 'destructive';
      default: return 'outline';
    }
  };

  const getDateColor = (dueDate) => {
    if (!dueDate) return 'text-slate-500';
    const date = new Date(dueDate);
    if (isPast(date) && !isToday(date) && task.status !== "completed") {
      return 'text-red-600';
    }
    if (isToday(date)) {
      return 'text-orange-600';
    }
    return 'text-slate-600';
  };

  const getDateLabel = (dueDate) => {
    if (!dueDate) return '';
    const date = new Date(dueDate);
    if (isToday(date)) return 'Due Today';
    if (isPast(date) && task.status !== "completed") return 'Overdue';
    return format(date, 'MMM d, yyyy');
  };

  const getContactName = (contactId) => {
    // This would typically fetch from contacts service
    return `Contact #${contactId}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-600">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 truncate">
              {task.name || task.title}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={getPriorityColor(task.priority)} size="sm">
                {task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1)}
              </Badge>
              <Badge variant={getStatusColor(task.status)} size="sm">
                {task.status?.replace("-", " ").charAt(0).toUpperCase() + task.status?.replace("-", " ").slice(1)}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            <Button
              onClick={() => onEdit(task)}
              variant="outline"
              size="sm"
            >
              <ApperIcon name="Edit" className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
            >
              <ApperIcon name="X" className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-600">
          <button
            onClick={() => setActiveTab('details')}
            className={cn(
              "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
              activeTab === 'details'
                ? "border-primary-500 text-primary-600 dark:text-primary-400"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            )}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={cn(
              "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
              activeTab === 'comments'
                ? "border-primary-500 text-primary-600 dark:text-primary-400"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            )}
          >
            Comments
          </button>
        </div>

        {/* Modal Content */}
        <div className="overflow-y-auto max-h-[60vh]">
          {activeTab === 'details' && (
            <div className="p-6 space-y-6">
              {/* Description */}
              {task.description && (
                <div>
                  <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
                    Description
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    {task.description}
                  </p>
                </div>
              )}

              {/* Tags */}
              {task.tags && (
                <div>
                  <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    {task.tags.split(',').map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-600 pb-1">
                    Task Information
                  </h3>
                  
                  {task.category && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Category:</span>
                      <Badge variant="outline" size="sm">
                        {task.category.charAt(0).toUpperCase() + task.category.slice(1)}
                      </Badge>
                    </div>
                  )}

                  {task.dueDate && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Due Date:</span>
                      <div className={`flex items-center space-x-1 text-sm ${getDateColor(task.dueDate)}`}>
                        <ApperIcon name="Calendar" className="h-4 w-4" />
                        <span>{getDateLabel(task.dueDate)}</span>
                        {task.dueDate && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate)) && task.status !== "completed" && (
                          <ApperIcon name="AlertTriangle" className="h-4 w-4 text-red-500 ml-1" />
                        )}
                      </div>
                    </div>
                  )}

                  {task.assignedTo && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Assigned To:</span>
                      <AssigneeDisplay 
                        assigneeId={task.assignedTo} 
                        size="sm"
                        showName={true}
                      />
                    </div>
                  )}

                  {task.relatedTo && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Related To:</span>
                      <div className="flex items-center space-x-1 text-sm text-slate-600 dark:text-slate-400">
                        <ApperIcon name="User" className="h-4 w-4" />
                        <span>{getContactName(task.relatedTo)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-600 pb-1">
                    System Information
                  </h3>

                  {task.owner && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Owner:</span>
                      <div className="flex items-center space-x-1 text-sm text-slate-600 dark:text-slate-400">
                        <ApperIcon name="Crown" className="h-4 w-4" />
                        <span>{task.owner}</span>
                      </div>
                    </div>
                  )}

                  {task.createdBy && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Created By:</span>
                      <div className="flex items-center space-x-1 text-sm text-slate-600 dark:text-slate-400">
                        <ApperIcon name="UserPlus" className="h-4 w-4" />
                        <span>{task.createdBy}</span>
                      </div>
                    </div>
                  )}

                  {task.createdOn && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Created:</span>
                      <div className="flex items-center space-x-1 text-sm text-slate-600 dark:text-slate-400">
                        <ApperIcon name="Calendar" className="h-4 w-4" />
                        <span>{format(new Date(task.createdOn || task.createdAt), "MMM d, yyyy")}</span>
                      </div>
                    </div>
                  )}

                  {task.modifiedBy && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Modified By:</span>
                      <div className="flex items-center space-x-1 text-sm text-slate-600 dark:text-slate-400">
                        <ApperIcon name="Edit" className="h-4 w-4" />
                        <span>{task.modifiedBy}</span>
                      </div>
                    </div>
                  )}

                  {task.modifiedOn && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Modified:</span>
                      <div className="flex items-center space-x-1 text-sm text-slate-600 dark:text-slate-400">
                        <ApperIcon name="Clock" className="h-4 w-4" />
                        <span>{format(new Date(task.modifiedOn || task.updatedAt), "MMM d, yyyy")}</span>
                      </div>
                    </div>
                  )}

                  {task.completedAt && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Completed:</span>
                      <div className="flex items-center space-x-1 text-sm text-green-600">
                        <ApperIcon name="CheckCircle" className="h-4 w-4" />
                        <span>{format(new Date(task.completedAt), "MMM d, yyyy")}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="h-[60vh]">
              <CommentsPanel taskId={task.Id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsModal;