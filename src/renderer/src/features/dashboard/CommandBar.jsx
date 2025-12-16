import React, { useState, useRef } from 'react'
import { Terminal } from 'lucide-react'

const CommandBar = ({ onAddTask }) => {
  const [input, setInput] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef(null)

  // REMOVED: The useEffect that listened for 'window.keydown'

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!input.trim()) return
    
    onAddTask(input)
    setInput('')
    inputRef.current.blur()
    setIsFocused(false)
  }

  return (
    <div className={`mt-auto pt-4 border-t transition-colors duration-300 ${isFocused ? 'border-tokyo-cyan' : 'border-tokyo-highlight'}`}>
        <form onSubmit={handleSubmit} className="flex items-center gap-2 cursor-text" onClick={() => inputRef.current.focus()}>
            <Terminal size={14} className={isFocused ? 'text-tokyo-cyan' : 'text-tokyo-dim'} />
            
            <input 
                id="cmd-input"
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Type a task or /command (e.g. /timer 25)" // <--- UPDATE THIS
                className="bg-transparent w-full outline-none text-sm text-tokyo-text placeholder-tokyo-dim font-mono"
            />
            
            <div className={`text-[10px] font-bold px-1 rounded ${isFocused ? 'bg-tokyo-cyan text-tokyo-base' : 'text-tokyo-dim'}`}>
                CMD
            </div>
        </form>
    </div>
  )
}

export default CommandBar