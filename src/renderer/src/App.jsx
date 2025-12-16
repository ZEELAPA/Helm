import React, { useState, useEffect } from 'react'
import { useKeyboard } from './hooks/useKeyboard'
import { loadTasks, saveTasks } from './services/db'
import { AnimatePresence } from 'framer-motion'
import { X, Settings, LayoutGrid, Timer, ChevronLeft, ChevronRight } from 'lucide-react'
import { isSameDay, addWeeks, subWeeks, addMonths, subMonths } from 'date-fns'
import BootSequence from './components/BootSequence'

import CalendarGrid from './features/dashboard/CalendarGrid'
import WeeklyView from './features/dashboard/WeeklyView'
import JournalSidebar from './features/dashboard/JournalSidebar'
import FocusTimer from './features/focus/FocusTimer'
import SettingsModal from './components/SettingsModal'
import EventModal from './components/EventModal'
import { useFocusLogic } from './hooks/useFocusLogic'
import { useAudio } from './hooks/useAudio'
import ScratchpadModal from './components/ScratchpadModal'
import { PictureInPicture } from 'lucide-react'


function App() {
  const [selectedDate, setSelectedDate] = useState(new Date()) 
  const [viewDate, setViewDate] = useState(new Date()) // Controls what Month/Week is visible
  const [isBooting, setIsBooting] = useState(true) 

  const [view, setView] = useState('dashboard') 
  const [calendarView, setCalendarView] = useState('month')
  
  const [showSettings, setShowSettings] = useState(false)
  const [showEventModal, setShowEventModal] = useState(false)
  const [scratchpadTask, setScratchpadTask] = useState(null)
  const [taskViewMode, setTaskViewMode] = useState('daily') // 'daily' or 'all'

  
  // EDIT STATE: If null, we are creating. If object, we are editing.
  const [editingItem, setEditingItem] = useState(null)

    const [settings, setSettings] = useState({ 
    focusDuration: 25, 
    breakDuration: 5,
    customSound: null // <--- ADD THIS
    })
  
  const handleSaveDescription = (id, newDescription) => {
      setItems(prev => prev.map(t => t.id === id ? { ...t, description: newDescription } : t))
      setScratchpadTask(null)
  }


  // DATA
  const [items, setItems] = useState([
    { id: 1, type: 'task', title: "Welcome to Helm", date: new Date(), startTime: '09:00', endTime: '10:00', done: false, color: 'purple', description: 'Start here' },
    { id: 2, type: 'event', title: "Database Systems", dayOfWeek: 1, startTime: '09:00', endTime: '12:00', color: 'green', repeats: 'weekly' }
  ])

  const [isLoaded, setIsLoaded] = useState(false) 
  
  useEffect(() => {
    const initData = async () => {
      console.log("System: Booting...")
      try {
        const savedItems = await loadTasks()
        if (savedItems && savedItems.length > 0) {
            const hydratedItems = savedItems.map(item => ({
                ...item,
                date: new Date(item.date)
            }))

          setItems(hydratedItems)
          console.log(`System: Loaded ${savedItems.length} entries.`)
        } else {
          console.log("System: Database empty. Initializing defaults.")
          setItems([
            { id: 1, type: 'task', title: "Welcome to Helm", date: new Date(), startTime: '09:00', endTime: '10:00', done: false, color: 'purple', description: 'Start here' }
          ])
        }
      } catch (e) {
        console.error("System Error: DB Load failed", e)
      } finally {
        setIsLoaded(true)
      }
    }
    initData()
  }, [])

  // 4. SAVE ONLY WHEN LOADED
  useEffect(() => {
    if (isLoaded) {
      saveTasks(items)
      console.log("System: Data Synced.")
      
    }
  }, [items, isLoaded])

  // --- DATA LOGIC ---

  const visibleTasks = items
    .filter(item => {
        if (item.type !== 'task') return false; // Only show tasks in journal

        if (taskViewMode === 'all') {
            return true
        } 
        
        // Default 'daily' mode logic:
        // Matches selected date OR is a pending task from the past (overdue)
        const itemDate = new Date(item.date).toDateString()
        const selectedDateStr = selectedDate.toDateString()
        const isToday = itemDate === selectedDateStr
        
        // Optional: Show overdue tasks in daily view too?
        return isToday
    })
    .sort((a, b) => {
        // Sort by date then time
        return new Date(a.date) - new Date(b.date) || a.startTime.localeCompare(b.startTime)
    })


  // SAVE (Create or Update)
  const handleSaveItem = (itemData) => {
    if (itemData.id) {
        // UPDATE existing
        setItems(items.map(i => i.id === itemData.id ? itemData : i))
    } else {
        // CREATE new
        setItems([...items, { ...itemData, id: Date.now() }])
    }
    
    setShowEventModal(false)
    setEditingItem(null) // Reset edit state
  }

  const handleDeleteItem = (id) => {
      setItems(items.filter(i => i.id !== id))
      setShowEventModal(false)
  }

  // TRIGGER EDIT
  const openEditModal = (item) => {
      setEditingItem(item)
      setShowEventModal(true)
  }

  // TRIGGER CREATE
  const openCreateModal = () => {
      setEditingItem(null)
      setShowEventModal(true)
  }

  const handleToggleTask = (id) => setItems(items.map(t => t.id === id ? { ...t, done: !t.done } : t))
  
  const handleAddTask = (text) => {
    // 1. Simple Parser: Check for +project syntax
    // Example: "Buy Milk +personal" -> Title: "Buy Milk", Project: "personal"
    let title = text;
    let project = "";

    if (text.includes('+')) {
        const parts = text.split('+');
        title = parts[0].trim();
        project = parts[1].trim().toUpperCase(); // Auto-uppercase project
    }

    const newItem = {
        id: Date.now(),
        type: 'task',
        title: title,
        project: project, // <--- Add this
        date: selectedDate,
        startTime: '12:00', // Default
        done: false,
        color: 'purple'
    }
    setItems([...items, newItem])
  }

  // --- NAVIGATION LOGIC ---
  const handlePrev = () => {
      if(calendarView === 'month') setViewDate(subMonths(viewDate, 1))
      else setViewDate(subWeeks(viewDate, 1))
  }

  const handleNext = () => {
      if(calendarView === 'month') setViewDate(addMonths(viewDate, 1))
      else setViewDate(addWeeks(viewDate, 1))
  }

  const { playSound } = useAudio(settings.customSound) 
  

  const handleTimerFinish = () => {
    // 1. Play Audio
    playSound()

    // 2. Send Native Notification
    const notif = new Notification('Helm', {
        body: 'Session Complete',
        silent: true, // We play our own sound
    })

    // 3. Focus the window if clicked
    notif.onclick = () => {      
      if (window.electron && window.electron.ipcRenderer) {
        window.electron.ipcRenderer.send('window:focus')
      }
    }
  }

  const focusLogic = useFocusLogic(
      settings.focusDuration, 
      settings.breakDuration,
      handleTimerFinish // <--- Pass the new handler here
  )

  const formatTime = (s) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`

  useEffect(() => {
    const formattedTime = formatTime(focusLogic.currentSlice)
    
    window.db.sendTimerSync({
      time: formattedTime,
      isActive: focusLogic.isActive,
      mode: focusLogic.mode
    })
  }, [focusLogic.currentSlice, focusLogic.isActive, focusLogic.mode])

  // 2. LISTEN FOR COMMANDS FROM MINI WINDOW
  useEffect(() => {
    // Remove listener on cleanup to prevent duplicates
    const removeListener = window.db.onTimerCommand((action) => {
        if (action === 'toggle') focusLogic.toggleTimer()
        if (action === 'stop') focusLogic.resetSession()
    })
    return () => {
        // Since onTimerCommand returns the IPC remover in some setups, or we just rely on React cleanup
        // Note: Electron's IPC listeners can stack. Ideally, ensure this runs once.
        // For simple apps, this React Effect cleanup is usually sufficient if wired correctly in preload.
    }
  }, [focusLogic]) // dependency on focusLogic to get latest functions

  // --- KEYBOARD SHORTCUTS ---
  useKeyboard({
      // View Switching
      'REQ_CTRL+1': () => setView('dashboard'),
      'REQ_CTRL+2': () => setView('focus'),
      
      // Actions
      'REQ_CTRL+n': () => openCreateModal(),
      'REQ_CTRL+,': () => setShowSettings(true), // Ctrl + comma for settings
      
      // Vim Bindings
      'a': () => {
          // Find the command input and focus it
          // We need a tiny DOM hack or a Ref here. 
          // Since CommandBar is deep, DOM ID is easiest for now.
          const cmdInput = document.getElementById('cmd-input')
          if (cmdInput) cmdInput.focus()
      },
      
      'Escape': () => {
          setShowEventModal(false)
          setShowSettings(false)
      }
  })
  // --------------------------

  if (isBooting) {
    return <BootSequence onComplete={() => setIsBooting(false)} />
  }

  // --- COMMAND LINE INTERFACE ---
  const handleCommandInput = (input) => {
    // 1. Check if it's a command
    if (input.startsWith('/')) {
        const [cmd, ...args] = input.slice(1).split(' ')
        const arg1 = args[0]

        switch (cmd.toLowerCase()) {
            case 'timer':
                if (arg1 && !isNaN(arg1)) {
                    focusLogic.startCustomSession(parseInt(arg1)) // Call the new hook method
                    setView('focus')
                } else {
                    setView('focus')
                }
                break;
            case 'focus':
                // /timer 30 -> Starts 30 min session
                if (arg1 && !isNaN(arg1)) {
                    // Update settings temporarily or start directly? 
                    // Let's switch view and start.
                    setView('focus')
                    // Note: You might need to expose a method from useFocusLogic to setTime manually
                    // For now, let's just switch tabs.
                } else {
                    setView('focus')
                }
                break;

            case 'dashboard':
            case 'home':
                setView('dashboard')
                break;

            case 'clear':
                // Delete all completed tasks
                setItems(prev => prev.filter(t => !t.done))
                break;
            
            case 'goto':
                if (arg1 === 'today') {
                    const now = new Date()
                    setSelectedDate(now)
                    setViewDate(now)
                }
                break;

            default:
                // Optional: Show error toast "Command not found"
                console.warn("Unknown command")
        }
    } else {
        // 2. It's just a normal task
        handleAddTask(input)
    }
  }

  return (
    <div className="h-screen w-screen flex flex-col p-4 overflow-hidden bg-tokyo-base text-tokyo-text font-mono relative">
      
      {/* NAV BAR */}
      <div className="h-10 flex items-center justify-between mb-2 select-none" style={{WebkitAppRegion: 'drag'}}>
        <div className="font-bold text-tokyo-cyan mr-8 flex items-center gap-2">
            <span>Helm</span>
            {focusLogic.isActive && <span className="text-[10px] text-tokyo-purple animate-pulse">● REC</span>}
        </div>
        <div className="flex gap-2 bg-tokyo-surface/50 p-1 rounded-lg" style={{WebkitAppRegion: 'no-drag'}}>
            <button onClick={() => setView('dashboard')} className={`px-4 py-1 rounded text-xs font-bold flex items-center gap-2 transition ${view === 'dashboard' ? 'bg-tokyo-highlight text-tokyo-cyan' : 'text-tokyo-dim hover:text-tokyo-text'}`}>
                <LayoutGrid size={14} /> DASHBOARD
            </button>
            <button onClick={() => setView('focus')} className={`px-4 py-1 rounded text-xs font-bold flex items-center gap-2 transition ${view === 'focus' ? 'bg-tokyo-highlight text-tokyo-purple' : 'text-tokyo-dim hover:text-tokyo-text'}`}>
                <Timer size={14} /> {focusLogic.isActive ? formatTime(focusLogic.currentSlice) : 'FOCUS'}
            </button>
        </div>
        <div className="flex items-center gap-4 ml-auto" style={{WebkitAppRegion: 'no-drag'}}>
            {/* Settings Button */}
            <button 
               onClick={() => setShowSettings(true)} 
               className="text-tokyo-dim hover:text-tokyo-text transition"
            >
               <Settings size={16} />
            </button>
            
            {/* 3. NEW CLOSE BUTTON (Replaces Date) */}
            <button 
               onClick={() => window.db.closeApp()} 
               className="text-tokyo-dim hover:text-tokyo-red transition p-1 hover:bg-tokyo-red/10 rounded"
               title="Close to Tray"
            >
               <X size={18} />
            </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 min-h-0 relative z-0">
        {view === 'dashboard' && (
            <div className="h-full grid grid-cols-dashboard gap-4">
                {/* LEFT PANE */}
                <div className="flex flex-col gap-2 h-full min-h-0">
                    <div className="flex justify-between items-center bg-tokyo-surface/20 p-2 rounded border border-tokyo-highlight">
                        <div className="flex gap-2 items-center">
                            {/* ARROWS - NOW ALWAYS VISIBLE FOR BOTH VIEWS */}
                            <div className="flex gap-1 mr-2">
                                <button onClick={handlePrev} className="p-1 hover:text-tokyo-cyan"><ChevronLeft size={14} /></button>
                                <button onClick={handleNext} className="p-1 hover:text-tokyo-cyan"><ChevronRight size={14} /></button>
                            </div>

                            <button onClick={() => setCalendarView('month')} className={`text-xs px-2 py-1 rounded transition ${calendarView === 'month' ? 'bg-tokyo-cyan text-tokyo-base font-bold' : 'text-tokyo-dim hover:text-tokyo-text'}`}>MONTH</button>
                            <button onClick={() => setCalendarView('week')} className={`text-xs px-2 py-1 rounded transition ${calendarView === 'week' ? 'bg-tokyo-cyan text-tokyo-base font-bold' : 'text-tokyo-dim hover:text-tokyo-text'}`}>WEEK</button>
                        </div>
                        <button onClick={openCreateModal} className="text-xs border border-tokyo-green text-tokyo-green px-2 py-1 rounded hover:bg-tokyo-green hover:text-tokyo-base transition font-bold">+ NEW ENTRY</button>
                    </div>

                    <div className="flex-1 min-h-0 overflow-hidden rounded-lg border border-tokyo-highlight bg-tokyo-surface/30 backdrop-blur-sm relative">
                        {calendarView === 'month' ? (
                            <CalendarGrid 
                                viewDate={viewDate} 
                                selectedDate={selectedDate} 
                                items={items} 
                                onSelectDate={(date) => { setSelectedDate(date); setViewDate(date); }} 
                            />
                        ) : (
                            <WeeklyView 
                                currentDate={viewDate} 
                                items={items} 
                                onSelectItem={openEditModal} // Clicking event in Grid opens edit
                            />
                        )}
                    </div>
                </div>

                {/* RIGHT PANE */}
                <JournalSidebar 
                    tasks={visibleTasks} 
                    onAddTask={handleCommandInput}
                    onToggleTask={handleToggleTask}
                    onEditTask={openEditModal}
                    onOpenScratchpad={setScratchpadTask}
                    viewMode={taskViewMode}
                    onToggleMode={setTaskViewMode}
                />
            </div>
        )}

        {view === 'focus' && (
            <FocusTimer 
                logic={focusLogic} 
                defaultDuration={settings.focusDuration} 
                breakDuration={settings.breakDuration}
                settings={settings}
                onPopOut={() => window.db.switchToMini()}
            />
        )}
      </div>

      {showSettings && <SettingsModal settings={settings} onSave={(s) => { setSettings(s); setShowSettings(false); }} onClose={() => setShowSettings(false)} />}
      
      {showEventModal && (
        <EventModal 
            selectedDate={selectedDate} 
            initialData={editingItem} 
            onSave={handleSaveItem} 
            onDelete={handleDeleteItem}
            onClose={() => setShowEventModal(false)}
            // Add this new prop:
            onOpenScratchpad={(task) => {
                setShowEventModal(false) // Close the small modal
                setScratchpadTask(task)  // Open the big modal
            }} 
        />
      )}  

      {/* Add the Scratchpad Modal conditionally */}
      {scratchpadTask && (
          <ScratchpadModal 
              task={scratchpadTask}
              onSave={handleSaveDescription}
              onClose={() => setScratchpadTask(null)}
          />
      )}
    </div>
  )
}

export default App