import React, { useState, useEffect } from 'react'
import { Play, Pause, Maximize2, Square } from 'lucide-react'

const MiniApp = () => {
  const [timerState, setTimerState] = useState({
    time: "00:00",
    isActive: false,
    mode: "Loading..."
  })

  useEffect(() => {
    // Listen for updates from the hidden Main Window
    window.db.onTimerUpdate((data) => {
      setTimerState(data)
    })
  }, [])

  const handleExpand = () => {
    window.db.switchToMain()
  }

  const handleControl = (action) => {
    window.db.sendTimerControl(action)
  }

  return (
    <div className="h-screen w-screen bg-tokyo-base border-2 border-tokyo-blue flex flex-col p-2 relative overflow-hidden select-none">
      {/* DRAG HANDLE */}
      <div className="absolute top-0 left-0 w-full h-full z-0" style={{WebkitAppRegion: 'drag'}}></div>

      {/* HEADER */}
      <div className="relative z-10 flex justify-between items-center px-2 pt-1">
        <span className={`text-[10px] font-bold tracking-widest ${timerState.mode === 'FOCUS' ? 'text-tokyo-purple' : 'text-tokyo-green'}`}>
            {timerState.mode}
        </span>
        <button 
            onClick={handleExpand} 
            className="text-tokyo-dim hover:text-tokyo-cyan transition" 
            style={{WebkitAppRegion: 'no-drag'}}
        >
            <Maximize2 size={14} />
        </button>
      </div>

      {/* TIMER DISPLAY */}
      <div className="relative z-10 flex-1 flex items-center justify-between px-4">
        <div className="text-5xl font-mono font-bold text-tokyo-text tracking-tighter shadow-tokyo-cyan drop-shadow-md">
            {timerState.time}
        </div>

        {/* CONTROLS */}
        <div className="flex flex-col gap-2" style={{WebkitAppRegion: 'no-drag'}}>
            <button 
                onClick={() => handleControl('toggle')}
                className={`p-2 rounded-full ${timerState.isActive ? 'bg-tokyo-yellow text-tokyo-base' : 'bg-tokyo-green text-tokyo-base'} hover:brightness-110`}
            >
                {timerState.isActive ? <Pause size={16} fill="currentColor"/> : <Play size={16} fill="currentColor"/>}
            </button>
            <button 
                 onClick={() => handleControl('stop')}
                 className="p-2 rounded-full bg-tokyo-surface text-tokyo-red hover:bg-tokyo-red hover:text-white transition"
            >
                <Square size={16} fill="currentColor"/>
            </button>
        </div>
      </div>
    </div>
  )
}

export default MiniApp