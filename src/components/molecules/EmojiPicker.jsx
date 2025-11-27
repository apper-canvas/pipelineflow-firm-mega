import React, { useState, useEffect, useRef } from 'react'
import ApperIcon from '@/components/ApperIcon'
import Input from '@/components/atoms/Input'

const EMOJI_CATEGORIES = {
  recent: { name: 'Recently Used', emojis: [] },
  people: { 
    name: 'Smileys & People', 
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐']
  },
  nature: { 
    name: 'Animals & Nature', 
    emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷', '🕸', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🐘', '🦏', '🦛', '🐪', '🐫', '🦒', '🦘', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐈', '🐓', '🦃', '🦚', '🦜', '🦢', '🦩', '🕊', '🐇', '🦝', '🦨', '🦡', '🦦', '🦥', '🐁', '🐀', '🐿', '🦔']
  },
  food: { 
    name: 'Food & Drink', 
    emojis: ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥒', '🥬', '🌶', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕', '🫓', '🥪', '🥙', '🧆', '🌮', '🌯', '🫔', '🥗', '🥘', '🫕', '🥫', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🍯']
  },
  activities: { 
    name: 'Activities', 
    emojis: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛷', '⛸', '🥌', '🎿', '⛷', '🏂', '🪂', '🏋️‍♀️', '🏋️', '🏋️‍♂️', '🤼‍♀️', '🤼', '🤼‍♂️', '🤸‍♀️', '🤸', '🤸‍♂️', '⛹️‍♀️', '⛹️', '⛹️‍♂️', '🤺', '🤾‍♀️', '🤾', '🤾‍♂️', '🏌️‍♀️', '🏌️', '🏌️‍♂️', '🧘‍♀️', '🧘', '🧘‍♂️', '🏄‍♀️', '🏄', '🏄‍♂️', '🏊‍♀️', '🏊', '🏊‍♂️', '🤽‍♀️', '🤽', '🤽‍♂️', '🚣‍♀️', '🚣', '🚣‍♂️', '🧗‍♀️', '🧗', '🧗‍♂️', '🚵‍♀️', '🚵', '🚵‍♂️', '🚴‍♀️', '🚴', '🚴‍♂️', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖', '🏵', '🎗', '🎫', '🎟', '🎪', '🤹‍♀️', '🤹', '🤹‍♂️', '🎭', '🩰', '🎨', '🎬', '🎤', '🎧', '🎼', '🎵', '🎶', '🥇', '🥈', '🥉', '🏆', '🏅', '🎖', '🏵', '🎗']
  },
  objects: { 
    name: 'Objects', 
    emojis: ['⌚', '📱', '📲', '💻', '⌨', '🖥', '🖨', '🖱', '🖲', '🕹', '🗜', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽', '🎞', '📞', '☎', '📟', '📠', '📺', '📻', '🎙', '🎚', '🎛', '🧭', '⏱', '⏲', '⏰', '🕰', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦', '🕯', '🪔', '🧯', '🛢', '💸', '💵', '💴', '💶', '💷', '💰', '💳', '💎', '⚖', '🧰', '🔧', '🔨', '⚒', '🛠', '⛏', '🔩', '⚙', '🧱', '⛓', '🧲', '🔫', '💣', '🧨', '🪓', '🔪', '🗡', '⚔', '🛡', '🚬', '⚰', '⚱', '🏺', '🔮', '📿', '🧿', '💈', '⚗', '🔭', '🔬', '🕳', '🩹', '🩺', '💊', '💉', '🩸', '🧬', '🦠', '🧫', '🧪', '🌡', '🧹', '🧺', '🧻', '🚽', '🚰', '🚿', '🛁', '🛀', '🧼', '🪒', '🧴', '🧷', '🧹', '🧺']
  },
  symbols: { 
    name: 'Symbols', 
    emojis: ['❤', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮', '✝', '☪', '🕉', '☸', '✡', '🔯', '🕎', '☯', '☦', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛', '🉑', '☢', '☣', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷', '✴', '🆚', '💮', '🉐', '㊙', '㊗', '🈴', '🈵', '🈹', '🈲', '🅰', '🅱', '🆎', '🆑', '🅾', '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨', '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭', '❗', '❕', '❓', '❔', '‼', '⁉', '🔅', '🔆', '〽', '⚠', '🚸', '🔱', '⚜', '🔰', '♻', '✅', '🈯', '💹', '❇', '✳', '❎', '🌐', '💠']
  }
}

// Popular emojis for quick access
const POPULAR_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '😡', '🔥', '💪', '👏', '🎉', '✅', '❌', '🚀', '💯', '⭐']

const EmojiPicker = ({ onEmojiSelect, onClose, className = "" }) => {
  const [activeCategory, setActiveCategory] = useState('people')
  const [searchQuery, setSearchQuery] = useState('')
  const [recentEmojis, setRecentEmojis] = useState([])
  const pickerRef = useRef(null)

  // Load recent emojis from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recent-emojis')
    if (stored) {
      try {
        setRecentEmojis(JSON.parse(stored))
      } catch (e) {
        // Ignore parsing errors
      }
    }
  }, [])

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const handleEmojiClick = (emoji) => {
    // Add to recent emojis
    const newRecent = [emoji, ...recentEmojis.filter(e => e !== emoji)].slice(0, 20)
    setRecentEmojis(newRecent)
    localStorage.setItem('recent-emojis', JSON.stringify(newRecent))
    
    onEmojiSelect(emoji)
    onClose()
  }

  const getFilteredEmojis = () => {
    if (searchQuery.trim()) {
      // Search across all categories
      const allEmojis = Object.values(EMOJI_CATEGORIES).flatMap(cat => cat.emojis)
      return allEmojis.filter(emoji => {
        // Simple search - could be enhanced with emoji names/descriptions
        return emoji.includes(searchQuery)
      })
    }

    if (activeCategory === 'recent') {
      return recentEmojis
    }

    return EMOJI_CATEGORIES[activeCategory]?.emojis || []
  }

  const filteredEmojis = getFilteredEmojis()

  return (
    <div 
      ref={pickerRef}
      className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl w-80 ${className}`}
    >
      {/* Header */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
            Add Reaction
          </span>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
          >
            <ApperIcon name="X" className="h-4 w-4" />
          </button>
        </div>
        
        <Input
          placeholder="Search emojis..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="text-sm"
        />
      </div>

      {/* Popular emojis row */}
      {!searchQuery && (
        <div className="p-3 border-b border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-8 gap-1">
            {POPULAR_EMOJIS.map(emoji => (
              <button
                key={emoji}
                onClick={() => handleEmojiClick(emoji)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-lg transition-colors"
                title={emoji}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category tabs */}
      {!searchQuery && (
        <div className="flex border-b border-slate-200 dark:border-slate-700">
          {Object.entries(EMOJI_CATEGORIES).map(([key, category]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                activeCategory === key
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
              }`}
              disabled={key === 'recent' && recentEmojis.length === 0}
            >
              {category.name.split(' ')[0]}
            </button>
          ))}
        </div>
      )}

      {/* Emojis grid */}
      <div className="p-3">
        {filteredEmojis.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <ApperIcon name="Search" className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">
              {searchQuery ? 'No emojis found' : 'No recent emojis'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto">
            {filteredEmojis.map((emoji, index) => (
              <button
                key={`${emoji}-${index}`}
                onClick={() => handleEmojiClick(emoji)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-lg transition-colors"
                title={emoji}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default EmojiPicker