import React, { useState } from "react";
import { toast } from "react-toastify";
import { format, formatDistanceToNow } from "date-fns";
import commentsService from "@/services/api/commentsService";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import RichTextEditor from "@/components/molecules/RichTextEditor";
import EmojiPicker from "@/components/molecules/EmojiPicker";

const CommentItem = ({
  comment,
  currentUserId,
  teamMembers,
  onUpdate,
  onDelete,
  onReply,
  onQuote,
depth = 0,
  showTopic = true,
  isPinned = false
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)
  const [saving, setSaving] = useState(false)

  const isAuthor = comment.authorId === currentUserId
  const hasReplies = comment.replies && comment.replies.length > 0

  const handleEdit = async () => {
    if (!editContent.trim()) return

    setSaving(true)
    try {
      const updatedComment = await commentsService.update(comment.Id, {
        content: editContent,
        authorId: currentUserId
      })
      onUpdate(updatedComment)
      setIsEditing(false)
      toast.success("Comment updated successfully")
    } catch (error) {
      toast.error("Failed to update comment")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this comment?")) return

    try {
      await commentsService.delete(comment.Id)
      onDelete(comment.Id)
    } catch (error) {
      toast.error("Failed to delete comment")
    }
  }

  const handleReaction = async (emoji) => {
    try {
      const hasReacted = comment.reactions?.[emoji]?.includes(currentUserId)
      
      if (hasReacted) {
        const updated = await commentsService.removeReaction(comment.Id, emoji, currentUserId)
        onUpdate(updated)
      } else {
        const updated = await commentsService.addReaction(comment.Id, emoji, currentUserId)
        onUpdate(updated)
      }
      setShowEmojiPicker(false)
    } catch (error) {
      toast.error("Failed to update reaction")
    }
  }

  const handleLike = async () => {
    try {
      const updated = await commentsService.toggleLike(comment.Id, currentUserId)
      onUpdate(updated)
    } catch (error) {
      toast.error("Failed to update like")
    }
  }

  const handlePin = async () => {
    try {
      const updated = await commentsService.togglePin(comment.Id, currentUserId)
      onUpdate(updated)
      toast.success(updated.isPinned ? "Comment pinned" : "Comment unpinned")
    } catch (error) {
      toast.error("Failed to update pin status")
    }
  }

  const handleResolve = async () => {
    try {
      const updated = await commentsService.toggleResolve(comment.Id, currentUserId)
      onUpdate(updated)
      toast.success(updated.isResolved ? "Comment resolved" : "Comment reopened")
    } catch (error) {
      toast.error("Failed to update resolve status")
    }
  }

  const formatContent = (content) => {
    // Simple markdown-like formatting
    let formatted = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-slate-100 dark:bg-slate-800 px-1 rounded">$1</code>')
      .replace(/@(\w+)/g, '<span class="text-blue-600 font-medium">@$1</span>')

    return { __html: formatted }
  }

  const reactionEmojis = ['👍', '❤️', '😂', '😮', '😢', '😡']
  const topReactions = Object.entries(comment.reactionCounts || {})
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)

  return (
<div className={`comment-thread-item ${depth > 0 ? `ml-${Math.min(depth * 4, 16)} thread-depth-${Math.min(depth, 4)}` : ''}`}>
      {depth > 0 && (
        <div className={`thread-connector depth-${Math.min(depth, 4)}`}></div>
      )}
      <div className={`group relative rounded-lg p-4 transition-all duration-200 ${
        comment.isResolved 
          ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700' 
          : isPinned || comment.isPinned
            ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700'
            : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800'
      }`}>
        {/* Pin indicator */}
        {(isPinned || comment.isPinned) && (
          <div className="absolute top-2 right-2">
            <ApperIcon name="Pin" className="h-4 w-4 text-amber-500" />
          </div>
        )}

        {/* Unread indicator */}
        {comment.isUnread && comment.authorId !== currentUserId && (
          <div className="absolute left-2 top-4 w-2 h-2 bg-blue-500 rounded-full"></div>
        )}

        {/* Comment header */}
        <div className="flex items-start space-x-3">
          <img
            src={comment.authorAvatar}
            alt={comment.authorName}
            className="w-8 h-8 rounded-full"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {comment.authorName}
              </span>
              <span className="text-xs text-slate-500">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
              {comment.isEdited && (
                <span className="text-xs text-slate-400">(edited)</span>
              )}
              {comment.isResolved && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  Resolved
                </span>
              )}
            </div>

            {/* Comment content */}
            <div className="mt-2">
              {isEditing ? (
                <div className="space-y-3">
                  <RichTextEditor
                    value={editContent}
                    onChange={setEditContent}
                    teamMembers={teamMembers}
                    minHeight="60px"
                  />
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={handleEdit} disabled={saving}>
                      {saving ? "Saving..." : "Save"}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      onClick={() => {
                        setIsEditing(false)
                        setEditContent(comment.content)
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div 
                  className="prose prose-sm max-w-none text-slate-700 dark:text-slate-300"
                  dangerouslySetInnerHTML={formatContent(comment.content)}
                />
              )}
            </div>

            {/* Attachments */}
            {comment.attachments && comment.attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {comment.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm text-slate-600">
                    <ApperIcon name="Paperclip" className="h-4 w-4" />
                    <a 
                      href={attachment.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 underline"
                    >
                      {attachment.name}
                    </a>
                    <span className="text-xs text-slate-400">({attachment.size})</span>
                  </div>
                ))}
              </div>
            )}

            {/* Reactions */}
            {topReactions.length > 0 && (
              <div className="flex items-center space-x-2 mt-3">
                {topReactions.map(([emoji, count]) => (
                  <button
                    key={emoji}
                    onClick={() => handleReaction(emoji)}
                    className={`flex items-center space-x-1 px-2 py-1 rounded-full text-sm transition-colors ${
                      comment.reactions?.[emoji]?.includes(currentUserId)
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{emoji}</span>
                    <span>{count}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Comment actions */}
            <div className="flex items-center space-x-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleLike}
                className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 ${
                  comment.likedBy?.includes(currentUserId) ? 'text-red-500' : 'text-slate-500'
                }`}
                title="Like"
              >
                <ApperIcon name="Heart" className="h-4 w-4" />
                {comment.likes > 0 && (
                  <span className="text-xs ml-1">{comment.likes}</span>
                )}
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
                  title="Add reaction"
                >
                  <ApperIcon name="Smile" className="h-4 w-4" />
                </button>
                {showEmojiPicker && (
                  <EmojiPicker
                    onEmojiSelect={handleReaction}
                    onClose={() => setShowEmojiPicker(false)}
                    className="absolute bottom-full left-0 mb-2 z-10"
                  />
                )}
              </div>

              <button
                onClick={() => onReply(comment)}
                className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
                title="Reply"
              >
                <ApperIcon name="Reply" className="h-4 w-4" />
              </button>

              <button
                onClick={() => onQuote(comment)}
                className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
                title="Quote"
              >
                <ApperIcon name="Quote" className="h-4 w-4" />
              </button>

              <button
                onClick={handlePin}
                className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 ${
                  comment.isPinned ? 'text-amber-500' : 'text-slate-500'
                }`}
                title={comment.isPinned ? "Unpin" : "Pin"}
              >
                <ApperIcon name="Pin" className="h-4 w-4" />
              </button>

              <button
                onClick={handleResolve}
                className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 ${
                  comment.isResolved ? 'text-green-500' : 'text-slate-500'
                }`}
                title={comment.isResolved ? "Reopen" : "Resolve"}
              >
                <ApperIcon name="CheckCircle" className="h-4 w-4" />
              </button>

              {isAuthor && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
                    title="Edit"
                  >
                    <ApperIcon name="Edit" className="h-4 w-4" />
                  </button>

                  <button
                    onClick={handleDelete}
                    className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-red-500"
                    title="Delete"
                  >
                    <ApperIcon name="Trash2" className="h-4 w-4" />
                  </button>
                </>
              )}

              {hasReplies && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
                  title={isExpanded ? "Collapse replies" : "Expand replies"}
                >
                  <ApperIcon 
                    name={isExpanded ? "ChevronDown" : "ChevronRight"} 
                    className="h-4 w-4" 
                  />
                  <span className="text-xs ml-1">{comment.replies.length}</span>
                </button>
              )}
            </div>

            {/* Edit history */}
            {comment.editHistory && comment.editHistory.length > 0 && (
              <div className="mt-2 text-xs text-slate-400">
                <details>
                  <summary className="cursor-pointer hover:text-slate-600">
                    View edit history ({comment.editHistory.length})
                  </summary>
                  <div className="mt-2 space-y-1 pl-4 border-l-2 border-slate-200 dark:border-slate-700">
                    {comment.editHistory.map((edit, index) => (
                      <div key={index} className="text-slate-500">
                        <div className="font-medium">
                          Edited {formatDistanceToNow(new Date(edit.editedAt), { addSuffix: true })}
                        </div>
                        <div className="text-xs bg-slate-100 dark:bg-slate-800 p-2 rounded mt-1">
                          {edit.content}
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            )}
          </div>
        </div>
      </div>

{/* Replies */}
      {hasReplies && isExpanded && (
        <div className="mt-4 space-y-4">
          {comment.replies.map(reply => (
            <CommentItem
              key={reply.Id}
              comment={reply}
              currentUserId={currentUserId}
              teamMembers={teamMembers}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onReply={onReply}
              onQuote={onQuote}
              depth={depth + 1}
              showTopic={depth === 0}
            />
          ))}
        </div>
      )}
      
      {showTopic && (comment.topic || depth === 0) && (
        <div className="mt-2">
          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full topic-badge topic-${comment.topic || 'general'}`}>
            <div className={`w-1.5 h-1.5 rounded-full mr-1 topic-dot topic-${comment.topic || 'general'}`}></div>
            {(comment.topic || 'general').charAt(0).toUpperCase() + (comment.topic || 'general').slice(1)}
          </span>
        </div>
      )}
    </div>
  )
}

export default CommentItem