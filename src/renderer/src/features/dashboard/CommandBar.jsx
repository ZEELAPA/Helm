import React, { useState, useRef, useEffect } from 'react'
import { Terminal, Command } from 'lucide-react'

const SUGGESTIONS = [
    { cmd: '/timer', desc: 'Start focus timer (e.g. /timer 25)' },
    { cmd: '/dashboard', desc: 'Go to Dashboard view' },
    { cmd: '/focus', desc: 'Go to Focus view' },
    { cmd: '/goto today', desc: 'Jump calendar to today' },
    { cmd: '/clear', desc: 'Clear completed tasks' },
    { cmd: '/quit', desc: 'Close application' }
]

const CommandBar = ({ onAddTask }) => {
  const [input, setInput] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  
  const inputRef = useRef(null)

  // FILTER LOGIC
  const filteredSuggestions = SUGGESTIONS.filter(s => 
      s.cmd.toLowerCase().startsWith(input.toLowerCase().split(' ')[0])
  )

  useEffect(() => {
    // Show suggestions only if input starts with '/'
    if (input.startsWith('/')) {
        setShowSuggestions(true)
        setSelectedIndex(0) // Reset selection on type
    } else {
        setShowSuggestions(false)
    }
  }, [input])


  const handleSubmit = (e) => {
    e.preventDefault()
    
    // If suggestions are open and user hits Enter, select the suggestion
    if (showSuggestions && filteredSuggestions.length > 0) {
        selectSuggestion(filteredSuggestions[selectedIndex].cmd)
        return
    }

    if (!input.trim()) return
    
    onAddTask(input)
    setInput('')
    setShowSuggestions(false)
    // Keep focus for rapid entry? Or blur? Let's keep focus.
  }

  const selectSuggestion = (cmd) => {
      setInput(cmd + ' ') // Add space for arguments
      inputRef.current.focus()
      setShowSuggestions(false)
  }

  const handleKeyDown = (e) => {
    if (!showSuggestions) return

    if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredSuggestions.length - 1))
    } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => (prev < filteredSuggestions.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'Tab') {
        e.preventDefault()
        if (filteredSuggestions.length > 0) {
            selectSuggestion(filteredSuggestions[selectedIndex].cmd)
        }
    } else if (e.key === 'Escape') {
        setShowSuggestions(false)
    }
  }

  return (
    <div className="mt-auto p-4 border-t transition-colors duration-300 relative z-50 bg-tokyo-surface/20 backdrop-blur-md">
        
        {/* SUGGESTION POPUP */}
        {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-tokyo-base border border-tokyo-purple shadow-2xl rounded-lg overflow-hidden flex flex-col">
                <div className="text-[10px] bg-tokyo-surface px-2 py-1 text-tokyo-dim font-bold uppercase tracking-wider flex justify-between">
                    <span>Available Commands</span>
                    <span>[TAB] to select</span>
                </div>
                
                {filteredSuggestions.map((item, index) => (
                    <div 
                        key={item.cmd}
                        onClick={() => selectSuggestion(item.cmd)}
                        className={`px-3 py-2 text-xs flex items-center justify-between cursor-pointer border-l-2 transition-colors ${
                            index === selectedIndex 
                            ? 'bg-tokyo-highlight/30 border-tokyo-cyan text-tokyo-cyan' 
                            : 'border-transparent text-tokyo-text hover:bg-tokyo-highlight/10'
                        }`}
                    >
                        <span className="font-bold font-mono">{item.cmd}</span>
                        <span className="text-tokyo-dim text-[10px]">{item.desc}</span>
                    </div>
                ))}
            </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-center gap-2 cursor-text" onClick={() => inputRef.current.focus()}>
            <Terminal size={14} className={isFocused ? 'text-tokyo-cyan' : 'text-tokyo-dim'} />
            
            <input 
                id="cmd-input"
                ref={inputRef}
                type="text"
                autoComplete="off"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => {
                    setIsFocused(false)
                    // Small delay so click event on suggestion registers before blur hides it
                    setTimeout(() => setShowSuggestions(false), 200)
                }}
                placeholder="Type a task or /command..."
                className="bg-transparent w-full outline-none text-sm text-tokyo-text placeholder-tokyo-dim font-mono"
            />
            
            <div className={`text-[10px] font-bold px-1 rounded flex items-center gap-1 transition-all ${isFocused ? 'bg-tokyo-cyan text-tokyo-base' : 'text-tokyo-dim'}`}>
               <Command size={10} /> CMD
            </div>
        </form>
    </div>
  )
}

export default CommandBar