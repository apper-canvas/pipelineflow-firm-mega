import React, { useState, useEffect, useRef } from 'react'
import { toast } from 'react-toastify'
import { format } from 'date-fns'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import { commentsService } from '@/services/api/commentsService'
import { teamMemberService } from '@/services/api/teamMemberService'
import CommentItem from '@/components/molecules/CommentItem'
import RichTextEditor from '@/components/molecules/RichTextEditor'

const CommentsPanel = ({ taskId }) => {
  const [comments, setComments] = useState([])
const [loading, setLoading] = useState(true)
  const [selectedTopic, setSelectedTopic] = useState("all")
  const [error, setError] = useState("")
  const [newComment, setNewComment] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterResolved, setFilterResolved] = useState("all")
  const [sortOrder, setSortOrder] = useState("asc")
  const [teamMembers, setTeamMembers] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [replyingTo, setReplyingTo] = useState(null)
  const commentsEndRef = useRef(null)
  const currentUserId = 1 // This would come from auth context

  useEffect(() => {
    if (taskId) {
      loadComments()
      loadTeamMembers()
    }
  }, [taskId])

  useEffect(() => {
    scrollToBottom()
  }, [comments])

  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const loadComments = async () => {
    try {
      setLoading(true)
      setError("")
      const data = await commentsService.getByTaskId(taskId)
      setComments(data)
      
      // Mark unread comments as read
      const unreadComments = data.filter(c => c.isUnread && c.authorId !== currentUserId)
      if (unreadComments.length > 0) {
        await commentsService.markAsRead(unreadComments.map(c => c.Id), currentUserId)
      }
    } catch (err) {
      setError("Failed to load comments")
    } finally {
      setLoading(false)
    }
  }

  const loadTeamMembers = async () => {
    try {
      const members = await teamMemberService.getAll()
      setTeamMembers(members)
    } catch (error) {
      console.error("Failed to load team members:", error)
    }
  }

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setSubmitting(true)
    try {
const commentData = {
        taskId: parseInt(taskId),
        authorId: currentUserId,
        authorName: "Current User", // This would come from auth context
        authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face&faceindex=1",
        content: newComment,
        parentCommentId: replyingTo?.Id || null,
        topic: extractTopicFromContent(newComment) || (replyingTo ? replyingTo.topic : null),
        mentions: extractMentions(newComment),
        attachments: []
      }

      const savedComment = await commentsService.create(commentData)
      setComments(prev => [...prev, savedComment])
      setNewComment("")
      setReplyingTo(null)
      toast.success("Comment added successfully")
    } catch (error) {
      toast.error("Failed to add comment")
    } finally {
      setSubmitting(false)
    }
  }

  const extractMentions = (content) => {
    const mentionRegex = /@(\w+)/g
    const mentions = []
    let match
    while ((match = mentionRegex.exec(content)) !== null) {
      const memberName = match[1]
      const member = teamMembers.find(m => 
        m.name.toLowerCase().includes(memberName.toLowerCase())
      )
      if (member) {
        mentions.push(member.Id)
      }
    }
    return mentions
  }

  const handleCommentUpdate = (updatedComment) => {
    setComments(prev => prev.map(c => 
      c.Id === updatedComment.Id ? updatedComment : c
    ))
  }

  const handleCommentDelete = (deletedCommentId) => {
    setComments(prev => prev.filter(c => 
      c.Id !== deletedCommentId && c.parentCommentId !== deletedCommentId
    ))
    toast.success("Comment deleted successfully")
  }

  const handleReply = (comment) => {
    setReplyingTo(comment)
    setNewComment(`@${comment.authorName} `)
  }

  const handleQuote = (comment) => {
    setNewComment(prev => prev + `> ${comment.content}\n\n`)
  }

const extractTopicFromContent = (content) => {
    // Extract hashtags or keywords that might indicate topics
    const hashtagMatch = content.match(/#(\w+)/g)
    if (hashtagMatch) return hashtagMatch[0].slice(1)
    
    // Look for common topic indicators
    const topicKeywords = {
      'technical': ['technical', 'implementation', 'code', 'api', 'bug', 'error'],
      'design': ['design', 'ui', 'ux', 'mockup', 'prototype', 'visual'],
      'planning': ['planning', 'roadmap', 'timeline', 'schedule', 'deadline'],
      'review': ['review', 'feedback', 'approve', 'changes', 'revision'],
      'question': ['question', 'help', 'how', 'what', 'why', 'when', '?'],
      'urgent': ['urgent', 'asap', 'priority', 'critical', 'blocking']
    }
    
    const lowerContent = content.toLowerCase()
    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some(keyword => lowerContent.includes(keyword))) {
        return topic
      }
    }
    
    return 'general'
  }

  // Get unique topics from comments
  const getAvailableTopics = (comments) => {
    const topics = new Set()
    comments.forEach(comment => {
      const topic = comment.topic || extractTopicFromContent(comment.content)
      topics.add(topic)
    })
    return Array.from(topics).sort()
  }

  const availableTopics = getAvailableTopics(comments)

  const filteredAndSortedComments = comments
    .filter(comment => {
      const matchesSearch = !searchQuery || 
        comment.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comment.authorName.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesFilter = filterResolved === "all" || 
        (filterResolved === "resolved" && comment.isResolved) ||
        (filterResolved === "unresolved" && !comment.isResolved)
      
      const commentTopic = comment.topic || extractTopicFromContent(comment.content)
      const matchesTopic = selectedTopic === "all" || commentTopic === selectedTopic
      
      return matchesSearch && matchesFilter && matchesTopic
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt)
      const dateB = new Date(b.createdAt)
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA
    })

const organizeComments = (comments) => {
    const commentMap = new Map()
    const rootComments = []
    const topicGroups = new Map()

    // First pass: create comment map, assign topics, and identify root comments
    comments.forEach(comment => {
      const topic = comment.topic || extractTopicFromContent(comment.content)
      const enrichedComment = { ...comment, topic, replies: [] }
      commentMap.set(comment.Id, enrichedComment)
      
      if (!comment.parentCommentId) {
        rootComments.push(comment.Id)
        
        // Group by topic
        if (!topicGroups.has(topic)) {
          topicGroups.set(topic, [])
        }
        topicGroups.get(topic).push(comment.Id)
      }
    })

    // Second pass: organize replies under their parents
    comments.forEach(comment => {
      if (comment.parentCommentId && commentMap.has(comment.parentCommentId)) {
        const parentComment = commentMap.get(comment.parentCommentId)
        const childComment = commentMap.get(comment.Id)
        
        // Inherit topic from parent if not explicitly set
        if (!childComment.topic || childComment.topic === 'general') {
          childComment.topic = parentComment.topic
        }
        
        parentComment.replies.push(childComment)
      }
    })

    // Sort root comments by topic, then by creation time
    const sortedRootComments = rootComments
      .map(id => commentMap.get(id))
      .filter(Boolean)
      .sort((a, b) => {
        // First sort by topic
        if (a.topic !== b.topic) {
          return a.topic.localeCompare(b.topic)
        }
        // Then by creation time
        return new Date(a.createdAt) - new Date(b.createdAt)
      })

    return sortedRootComments
  }

const organizedComments = organizeComments(filteredAndSortedComments)
  const pinnedComments = organizedComments.filter(c => c.isPinned)
  const regularComments = organizedComments.filter(c => !c.isPinned)

  // Group regular comments by topic for better organization
  const commentsByTopic = regularComments.reduce((acc, comment) => {
    const topic = comment.topic || 'general'
    if (!acc[topic]) acc[topic] = []
    acc[topic].push(comment)
    return acc
  }, {})
  const commentCount = comments.length
  const unreadCount = comments.filter(c => c.isUnread && c.authorId !== currentUserId).length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin h-6 w-6 border-2 border-primary-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-32 text-red-500">
        <div className="text-center">
          <ApperIcon name="AlertCircle" className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm">{error}</p>
          <Button onClick={loadComments} size="sm" className="mt-2">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with search and filters */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ApperIcon name="MessageCircle" className="h-5 w-5 text-slate-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {commentCount} comment{commentCount !== 1 ? 's' : ''}
            </span>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
              title={`Sort ${sortOrder === "asc" ? "newest first" : "oldest first"}`}
            >
              <ApperIcon 
                name={sortOrder === "asc" ? "ArrowUp" : "ArrowDown"} 
                className="h-4 w-4" 
              />
            </button>
          </div>
        </div>

        <div className="flex space-x-2">
          <Input
            placeholder="Search comments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 text-sm"
          />
          <select
            value={filterResolved}
            onChange={(e) => setFilterResolved(e.target.value)}
            className="px-3 py-1 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All</option>
            <option value="unresolved">Unresolved</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Comments list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
{/* Topic Filter */}
        <div className="mb-4">
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Topics</option>
            {availableTopics.map(topic => (
              <option key={topic} value={topic}>
                {topic.charAt(0).toUpperCase() + topic.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {organizedComments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-slate-500">
            <ApperIcon name="MessageCircle" className="h-12 w-12 mb-2 opacity-50" />
            <p className="text-sm">
              {searchQuery || filterResolved !== "all" || selectedTopic !== "all"
                ? "No comments match your filters" 
                : "No comments yet. Start the discussion!"
              }
            </p>
          </div>
        ) : (
          <>
            {/* Pinned comments */}
            {pinnedComments.map(comment => (
              <CommentItem
                key={comment.Id}
                comment={comment}
                currentUserId={currentUserId}
                teamMembers={teamMembers}
                onUpdate={handleCommentUpdate}
                onDelete={handleCommentDelete}
                onReply={handleReply}
                onQuote={handleQuote}
                isPinned={true}
                showTopic={true}
              />
            ))}
            
            {/* Comments organized by topic */}
            {selectedTopic === "all" ? (
              Object.entries(commentsByTopic).map(([topic, topicComments]) => (
                <div key={topic} className="mb-6">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                    <div className={`w-3 h-3 rounded-full topic-indicator topic-${topic}`}></div>
                    <h4 className="text-sm font-medium text-slate-700 capitalize">
                      {topic} Discussion
                    </h4>
                    <span className="text-xs text-slate-500">
                      {topicComments.length} comment{topicComments.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {topicComments.map(comment => (
                    <CommentItem
                      key={comment.Id}
                      comment={comment}
                      currentUserId={currentUserId}
                      teamMembers={teamMembers}
                      onUpdate={handleCommentUpdate}
                      onDelete={handleCommentDelete}
                      onReply={handleReply}
                      onQuote={handleQuote}
                      showTopic={false}
                    />
                  ))}
                </div>
              ))
            ) : (
              regularComments.map(comment => (
                <CommentItem
                  key={comment.Id}
                  comment={comment}
                  currentUserId={currentUserId}
                  teamMembers={teamMembers}
                  onUpdate={handleCommentUpdate}
                  onDelete={handleCommentDelete}
                  onReply={handleReply}
                  onQuote={handleQuote}
                  showTopic={true}
                />
              ))
            )}
          </>
        )}
        <div ref={commentsEndRef} />
      </div>

      {/* Reply indicator */}
{replyingTo && (
        <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ApperIcon name="Reply" className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-blue-700 dark:text-blue-300">
                Replying to {replyingTo.authorName}
              </span>
            </div>
            <button
              onClick={() => {
                setReplyingTo(null)
                setNewComment("")
              }}
              className="p-1 hover:bg-blue-100 dark:hover:bg-blue-800 rounded"
            >
              <ApperIcon name="X" className="h-4 w-4 text-blue-500" />
            </button>
          </div>
        </div>
      )}

      {/* Comment input */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <form onSubmit={handleSubmitComment} className="space-y-3">
<RichTextEditor
            value={newComment}
            onChange={setNewComment}
            placeholder={replyingTo ? `Replying to ${replyingTo.authorName}...` : "Write a comment... (Use #hashtags to set topics)"}
            teamMembers={teamMembers}
            minHeight="80px"
            conversationHistory={comments}
            taskContext={{ title: `Task ${taskId}` }}
            enableAISuggestions={true}
          />
          <div className="flex justify-between items-center">
            <div className="text-xs text-slate-500">
              Use @username to mention team members
            </div>
            <Button
              type="submit"
              disabled={!newComment.trim() || submitting}
              size="sm"
            >
              {submitting ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CommentsPanel