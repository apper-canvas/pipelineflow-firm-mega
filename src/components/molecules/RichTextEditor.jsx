import React, { useEffect, useRef, useState } from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

// AI Suggestions Component
const AISuggestions = ({ suggestions, onSelect, selectedIndex, loading, error }) => {
  if (loading) {
    return (
      <div className="absolute z-30 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-w-md w-full mt-1 p-3">
        <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
          <ApperIcon name="Sparkles" className="w-4 h-4 animate-pulse" />
          <span className="text-sm">Generating AI suggestions...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="absolute z-30 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-w-md w-full mt-1 p-3">
        <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
          <ApperIcon name="AlertCircle" className="w-4 h-4" />
          <span className="text-sm">Failed to generate suggestions</span>
        </div>
      </div>
    )
  }

  if (!suggestions || suggestions.length === 0) return null

  return (
    <div className="absolute z-30 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-w-md w-full mt-1">
      <div className="p-2 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
          <ApperIcon name="Sparkles" className="w-4 h-4 text-blue-500" />
          <span className="text-xs font-medium">AI Suggestions</span>
        </div>
      </div>
      <div className="max-h-48 overflow-y-auto">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onSelect(suggestion)}
            className={`w-full p-3 text-left hover:bg-slate-100 dark:hover:bg-slate-700 flex flex-col space-y-1 ${
              index === selectedIndex ? 'bg-slate-100 dark:bg-slate-700' : ''
            } ${index === suggestions.length - 1 ? '' : 'border-b border-slate-200 dark:border-slate-700'}`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs px-2 py-1 rounded-full ${
                suggestion.type === 'supportive' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                suggestion.type === 'action' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
              }`}>
                {suggestion.type}
              </span>
            </div>
            <div className="text-sm text-slate-900 dark:text-slate-100">
              {suggestion.text}
            </div>
          </button>
        ))}
      </div>
      <div className="p-2 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
        Use ↑↓ to navigate, Enter to select, Esc to close
      </div>
    </div>
  )
}

const RichTextEditor = ({
  value,
  onChange,
  placeholder = "Write your comment...",
  teamMembers = [],
  minHeight = "120px",
  className = "",
  conversationHistory = [],
  taskContext = null,
  enableAISuggestions = true
}) => {
const [isExpanded, setIsExpanded] = useState(false)
  const [showMentions, setShowMentions] = useState(false)
  const [mentionQuery, setMentionQuery] = useState("")
  const [mentionIndex, setMentionIndex] = useState(0)
  const [cursorPosition, setCursorPosition] = useState(0)
  const [aiSuggestions, setAiSuggestions] = useState([])
  const [showAiSuggestions, setShowAiSuggestions] = useState(false)
  const [aiSuggestionsLoading, setAiSuggestionsLoading] = useState(false)
  const [aiSuggestionsError, setAiSuggestionsError] = useState(null)
  const [aiSelectedIndex, setAiSelectedIndex] = useState(0)
  const textareaRef = useRef(null)
  const aiDebounceRef = useRef(null)

const handleTextareaChange = (e) => {
    const newValue = e.target.value
    const cursorPos = e.target.selectionStart
    
    onChange(newValue)
    setCursorPosition(cursorPos)
    
    // Check for @mentions
    const textBeforeCursor = newValue.slice(0, cursorPos)
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/)
    
    if (mentionMatch) {
      setMentionQuery(mentionMatch[1])
      setShowMentions(true)
      setMentionIndex(0)
      setShowAiSuggestions(false) // Hide AI suggestions when showing mentions
    } else {
      setShowMentions(false)
      
      // Trigger AI suggestions if enabled and user has typed enough
      if (enableAISuggestions && newValue.length > 3 && conversationHistory.length > 0) {
        triggerAiSuggestions(newValue)
      } else {
        setShowAiSuggestions(false)
      }
    }
  }

  const triggerAiSuggestions = (currentInput) => {
    // Clear previous debounce
    if (aiDebounceRef.current) {
      clearTimeout(aiDebounceRef.current)
    }

    // Debounce AI requests
    aiDebounceRef.current = setTimeout(async () => {
      try {
        setAiSuggestionsLoading(true)
        setAiSuggestionsError(null)
        setShowAiSuggestions(true)
        
        // Initialize ApperClient
        const { ApperClient } = window.ApperSDK;
        const apperClient = new ApperClient({
          apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
          apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
        });

        const result = await apperClient.functions.invoke(import.meta.env.VITE_GENERATE_REPLY_SUGGESTIONS, {
          body: JSON.stringify({
            conversationHistory,
            currentInput,
            taskContext
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (result.success && result.suggestions) {
          setAiSuggestions(result.suggestions)
          setAiSelectedIndex(0)
        } else {
          console.info(`apper_info: Got an error in this function: ${import.meta.env.VITE_GENERATE_REPLY_SUGGESTIONS}. The response body is: ${JSON.stringify(result)}.`)
          setAiSuggestionsError('Failed to generate suggestions')
          setShowAiSuggestions(false)
        }
      } catch (error) {
        console.info(`apper_info: Got this error an this function: ${import.meta.env.VITE_GENERATE_REPLY_SUGGESTIONS}. The error is: ${error.message}`)
        setAiSuggestionsError('Failed to generate suggestions')
      } finally {
        setAiSuggestionsLoading(false)
      }
    }, 1000) // 1 second debounce
  }

const handleKeyDown = (e) => {
    if (showMentions) {
      const filteredMembers = teamMembers.filter(member =>
        member.name.toLowerCase().includes(mentionQuery.toLowerCase())
      )

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setMentionIndex(Math.min(mentionIndex + 1, filteredMembers.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setMentionIndex(Math.max(mentionIndex - 1, 0))
      } else if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault()
        if (filteredMembers[mentionIndex]) {
          insertMention(filteredMembers[mentionIndex])
        }
      } else if (e.key === 'Escape') {
        setShowMentions(false)
      }
    } else if (showAiSuggestions && aiSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setAiSelectedIndex(Math.min(aiSelectedIndex + 1, aiSuggestions.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setAiSelectedIndex(Math.max(aiSelectedIndex - 1, 0))
      } else if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault()
        if (aiSuggestions[aiSelectedIndex]) {
          selectAiSuggestion(aiSuggestions[aiSelectedIndex])
        }
      } else if (e.key === 'Escape') {
        setShowAiSuggestions(false)
      }
    }
    
    // Handle shortcuts
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'b') {
        e.preventDefault()
        wrapSelection('**', '**')
      } else if (e.key === 'i') {
        e.preventDefault()
        wrapSelection('*', '*')
      } else if (e.key === 'k') {
        e.preventDefault()
        wrapSelection('[link text](', ')')
      }
    }
  }

  const selectAiSuggestion = (suggestion) => {
    onChange(suggestion.text)
    setShowAiSuggestions(false)
    setAiSuggestions([])
    
    // Focus back on textarea
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
        const length = suggestion.text.length
        textareaRef.current.setSelectionRange(length, length)
      }
    }, 0)
  }

  const insertMention = (member) => {
    const textarea = textareaRef.current
    const beforeMention = value.slice(0, cursorPosition - mentionQuery.length - 1)
    const afterMention = value.slice(cursorPosition)
    const newValue = `${beforeMention}@${member.name} ${afterMention}`
    
    onChange(newValue)
    setShowMentions(false)
    
    // Set cursor position after mention
    setTimeout(() => {
      const newCursorPos = beforeMention.length + member.name.length + 2
      textarea.setSelectionRange(newCursorPos, newCursorPos)
      textarea.focus()
    }, 0)
  }

  const wrapSelection = (prefix, suffix) => {
    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.slice(start, end)
    
    const newValue = 
      value.slice(0, start) + 
      prefix + selectedText + suffix + 
      value.slice(end)
    
    onChange(newValue)
    
    setTimeout(() => {
      const newStart = start + prefix.length
      const newEnd = newStart + selectedText.length
      textarea.setSelectionRange(newStart, newEnd)
      textarea.focus()
    }, 0)
  }

const insertAtCursor = (text) => {
    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    
    const newValue = value.slice(0, start) + text + value.slice(end)
    onChange(newValue)
    
    // Hide AI suggestions when user manually inserts content
    setShowAiSuggestions(false)
    
    setTimeout(() => {
      const newCursorPos = start + text.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
      textarea.focus()
    }, 0)
  }

  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(mentionQuery.toLowerCase())
  ).slice(0, 5)

  return (
    <div className={`relative ${className}`}>
      {/* Toolbar */}
<div className="flex items-center justify-between p-2 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => wrapSelection('**', '**')}
            title="Bold (Ctrl+B)"
          >
            <ApperIcon name="Bold" className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => wrapSelection('*', '*')}
            title="Italic (Ctrl+I)"
          >
            <ApperIcon name="Italic" className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => wrapSelection('`', '`')}
            title="Code"
          >
            <ApperIcon name="Code" className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => wrapSelection('[link text](', ')')}
            title="Link (Ctrl+K)"
          >
            <ApperIcon name="Link" className="h-4 w-4" />
          </Button>
          
          <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertAtCursor('\n- ')}
            title="Bullet List"
          >
            <ApperIcon name="List" className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertAtCursor('\n1. ')}
            title="Numbered List"
          >
            <ApperIcon name="ListOrdered" className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertAtCursor('> ')}
            title="Quote"
          >
            <ApperIcon name="Quote" className="h-4 w-4" />
          </Button>
          
          {enableAISuggestions && conversationHistory.length > 0 && (
            <>
              <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => triggerAiSuggestions(value)}
                title="Get AI Suggestions"
                className="text-blue-600 dark:text-blue-400"
              >
                <ApperIcon name="Sparkles" className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="text-xs text-slate-500">
            {value.length} characters
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "Collapse" : "Expand"}
          >
            <ApperIcon 
              name={isExpanded ? "Minimize" : "Maximize"} 
              className="h-4 w-4" 
            />
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          style={{ minHeight }}
          className={`w-full p-3 border-0 resize-none focus:outline-none bg-transparent text-slate-700 dark:text-slate-300 placeholder-slate-400 ${
            isExpanded ? 'min-h-[240px]' : ''
          }`}
        />
        
        {/* Mention dropdown */}
{showMentions && filteredMembers.length > 0 && (
          <div className="absolute z-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-w-xs w-full">
            {filteredMembers.map((member, index) => (
              <button
                key={member.Id}
                type="button"
                onClick={() => insertMention(member)}
                className={`w-full px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center space-x-2 ${
                  index === mentionIndex ? 'bg-slate-100 dark:bg-slate-700' : ''
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {member.name}
                  </div>
                  <div className="text-xs text-slate-500">
                    {member.email}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
        
        {showAiSuggestions && (
          <AISuggestions
            suggestions={aiSuggestions}
            onSelect={selectAiSuggestion}
            selectedIndex={aiSelectedIndex}
            loading={aiSuggestionsLoading}
            error={aiSuggestionsError}
          />
        )}
      </div>

{/* Help text */}
      <div className="p-2 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500">
        <div className="flex flex-wrap gap-4">
<span>**bold**</span>
          <span>*italic*</span>
          <span>`code`</span>
          <span>[link](url)</span>
          <span>@mention</span>
          <span>&gt; quote</span>
          {enableAISuggestions && <span className="text-blue-600 dark:text-blue-400">✨AI suggestions</span>}
        </div>
      </div>
    </div>
  )
}

export default RichTextEditor