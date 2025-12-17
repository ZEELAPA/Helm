import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { PictureInPicture } from 'lucide-react'
import { Play, Pause, RotateCcw, Bell, ChevronUp, ChevronDown, ArrowRight, Music } from 'lucide-react'

const FocusTimer = ({ logic, defaultDuration, breakDuration, settings, onPopOut }) => {
  const [sessionName, setSessionName] = useState("Freestyle Session")
  
  // --- DRAG STATE ---
  const [isDragging, setIsDragging] = useState(false)
  const dragAccumulator = useRef(0) // Tracks pixel movement

  const { 
      totalBank, currentSlice, isActive, mode, 
      toggleTimer, adjustBank, resetSession 
  } = logic

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getNextStep = () => {
    if (totalBank <= currentSlice) return "FINISH"
    return mode === 'FOCUS' ? `BREAK (${breakDuration}m)` : `FOCUS (${defaultDuration}m)`
  }

  // --- DRAG HANDLERS ---
  const handleMouseDown = (e) => {
      if (isActive) return // Lock when running
      setIsDragging(true)
      dragAccumulator.current = 0
      document.body.style.cursor = 'ns-resize' // Change cursor globally
  }

  const handleMouseUp = () => {
      setIsDragging(false)
      document.body.style.cursor = 'default' // Reset cursor
  }

  const handleMouseMove = (e) => {
      if (!isDragging) return

      // Accumulate vertical movement
      dragAccumulator.current += e.movementY
      
      const SENSITIVITY = 15 // Pixels to move to change 1 minute

      // Dragging UP (Negative Y) -> Increase Time
      if (dragAccumulator.current <= -SENSITIVITY) {
          adjustBank(-60)
          dragAccumulator.current = 0 // Reset bucket
      }
      
      // Dragging DOWN (Positive Y) -> Decrease Time
      if (dragAccumulator.current >= SENSITIVITY) {
          adjustBank(60)
          dragAccumulator.current = 0 // Reset bucket
      }
  }

  // Attach global listeners so dragging works even if mouse leaves the div
  useEffect(() => {
      if (isDragging) {
          window.addEventListener('mouseup', handleMouseUp)
          window.addEventListener('mousemove', handleMouseMove)
      } else {
          window.removeEventListener('mouseup', handleMouseUp)
          window.removeEventListener('mousemove', handleMouseMove)
      }
      return () => {
          window.removeEventListener('mouseup', handleMouseUp)
          window.removeEventListener('mousemove', handleMouseMove)
      }
  }, [isDragging])

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="h-full w-full bg-tokyo-base flex flex-col items-center justify-center text-tokyo-text select-none relative"
    >
      {/* Page Header */}
      <div className="absolute top-0 w-full flex flex-col items-center pt-8">
         <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs tracking-widest uppercase font-bold px-2 py-0.5 rounded ${mode === 'FOCUS' ? 'bg-tokyo-purple/20 text-tokyo-purple' : 'bg-tokyo-green/20 text-tokyo-green'}`}>
                STATUS: {mode}
            </span>
         </div>

        <button 
            onClick={onPopOut}
            className="absolute right-8 top-8 text-tokyo-dim hover:text-tokyo-cyan transition flex flex-col items-center gap-1 group"
            title="Pop Out Widget"
        >
          <PictureInPicture size={20} />
          <span className="text-[10px] opacity-0 group-hover:opacity-100 transition">POP OUT</span>
        </button>
         
         <input 
            type="text"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            className="bg-transparent text-xl font-bold text-tokyo-cyan text-center outline-none border-b border-transparent hover:border-tokyo-dim focus:border-tokyo-cyan transition w-1/2"
         />
      </div>

      {/* --- THE DRAGGABLE CLOCK AREA --- */}
      <div 
        className={`relative group flex flex-col items-center mt-8 p-8 rounded-3xl transition-colors duration-300 ${!isActive ? 'cursor-ns-resize hover:bg-tokyo-surface/20' : ''}`}
        onMouseDown={handleMouseDown}
      >
        <span className="text-xs font-bold text-tokyo-dim tracking-widest mb-[-1rem]">
            {isActive ? "REMAINING" : "DRAG TO SET"}
        </span>

        {/* Floating Arrows Visuals (Only show when not active) */}
        {!isActive && (
            <div className={`absolute -right-4 top-1/2 -translate-y-1/2 flex flex-col text-tokyo-dim transition-opacity duration-300 ${isDragging ? 'opacity-100 text-tokyo-cyan scale-110' : 'opacity-0 group-hover:opacity-50'}`}>
                <ChevronUp size={32} />
                <ChevronDown size={32} />
            </div>
        )}

        <div className={`text-[10rem] lg:text-[12rem] font-bold tabular-nums tracking-tighter leading-none transition-colors duration-500 ${
            isActive ? 'text-tokyo-text' : isDragging ? 'text-tokyo-cyan' : 'text-tokyo-dim'
        }`}>
            {isActive ? formatTime(currentSlice) : formatTime(totalBank)}
        </div>
        
        <div className="absolute -bottom-2 w-full text-center text-sm font-mono text-tokyo-dim">
            TOTAL SESSION: {formatTime(totalBank)}
        </div>
      </div>

      {/* Control Deck */}
      <div className="flex items-center gap-8 mt-16 bg-tokyo-surface/30 p-4 rounded-2xl border border-tokyo-highlight backdrop-blur-md shadow-2xl">
        <button 
            onClick={toggleTimer}
            className={`w-16 h-16 flex items-center justify-center rounded-xl transition-all shadow-lg ${
                isActive ? 'bg-tokyo-yellow text-tokyo-base shadow-tokyo-yellow/20' : 'bg-tokyo-green text-tokyo-base hover:bg-tokyo-green/90 shadow-tokyo-green/20'
            }`}
        >
            {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
        </button>

        <button onClick={resetSession} className="text-tokyo-dim hover:text-tokyo-text transition">
            <RotateCcw size={24} />
        </button>

        <div className="w-px h-8 bg-tokyo-highlight mx-2"></div>

        <div className="flex flex-col gap-1 min-w-[120px]">
            <label className="text-[10px] uppercase text-tokyo-dim font-bold flex items-center gap-1">
                <ArrowRight size={10} /> Up Next
            </label>
            <div className="text-xs font-bold text-tokyo-cyan flex items-center gap-2">
                {getNextStep()}
            </div>
        </div>

        <div className="w-px h-8 bg-tokyo-highlight mx-2"></div>
        
        <div className="flex flex-col gap-1 min-w-[100px]">
             <label className="text-[10px] uppercase text-tokyo-dim font-bold flex items-center gap-1">
                <Bell size={10} /> Sound
             </label>
             <div className="text-xs font-bold text-tokyo-blue uppercase flex items-center gap-2">
                {settings?.customSound ? (
                    <>
                        <Music size={12} className="text-tokyo-green" />
                        <span className="text-tokyo-green">Custom</span>
                    </>
                ) : (
                    "Default Bell"
                )}
             </div>
        </div>
      </div>
    </motion.div>
  )
}

export default FocusTimer