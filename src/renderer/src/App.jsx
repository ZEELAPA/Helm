import React, { useState, useEffect } from 'react'
import { useKeyboard } from './hooks/useKeyboard'
import { loadTasks, saveTasks } from './services/db'
import { X, Settings, LayoutGrid, Timer, ChevronLeft, ChevronRight, Minus, Square, Copy, Sidebar } from 'lucide-react' 
import { isSameDay, addWeeks, subWeeks, addMonths, subMonths, format } from 'date-fns'
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

// --- HELPER: Convert Hex to RGB numbers for Tailwind Variables ---
const hexToRgb = (hex) => {
  if (!hex) return '26 27 38'; // Default fallback
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result 
    ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}` 
    : '26 27 38';
}
// ---------------------------------------------------------------

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date()) 
  const [viewDate, setViewDate] = useState(new Date()) 
  const [isBooting, setIsBooting] = useState(true) 
  const [isMaximized, setIsMaximized] = useState(false)

  const [view, setView] = useState('dashboard') 
  const [calendarView, setCalendarView] = useState('month')
  
  const [showJournal, setShowJournal] = useState(true)

  const [showSettings, setShowSettings] = useState(false)
  const [showEventModal, setShowEventModal] = useState(false)
  const [scratchpadTask, setScratchpadTask] = useState(null)
  const [taskViewMode, setTaskViewMode] = useState('daily') 

  const [editingItem, setEditingItem] = useState(null)

  const [settings, setSettings] = useState({ 
    focusDuration: 25, 
    breakDuration: 5,
    customSound: null,
    enableNotifications: true,
    backgroundImage: null, 
    backgroundColor: '#1a1b26' 
  })

  // DATA
  const [items, setItems] = useState([])
  const [notebooks, setNotebooks] = useState([])
  const [isLoaded, setIsLoaded] = useState(false) 
  
  useEffect(() => {
    const initData = async () => {
      console.log("System: Booting...")
      try {
        // 1. Load Tasks
        const savedItems = await loadTasks()
        if (savedItems && savedItems.length > 0) {
            const hydratedItems = savedItems.map(item => ({
                ...item,
                date: new Date(item.date)
            }))
          setItems(hydratedItems)
        } else {
          // Default task if empty
          setItems([{ id: 1, type: 'task', title: "Welcome to Helm", date: new Date(), startTime: '09:00', endTime: '10:00', done: false, color: 'purple', description: 'Start here' }])
        }

        // 2. NEW: Load Settings from Database
        const savedSettings = await window.db.getItems('settings')
        if (savedSettings && Object.keys(savedSettings).length > 0) {
            setSettings(savedSettings) // Restore theme/audio settings
        }

        const savedNotebooks = await window.db.getItems('notebooks')
        if (savedNotebooks) setNotebooks(savedNotebooks)

      } catch (e) {
        console.error("System Error: DB Load failed", e)
      } finally {
        setIsLoaded(true)
      }
    }
    initData()
  }, [])

  useEffect(() => {
    if (isLoaded) saveTasks(items)
  }, [items, isLoaded])

  useEffect(() => { 
      if (isLoaded) window.db.setItems('notebooks', notebooks) 
  }, [notebooks, isLoaded])

  useEffect(() => {
    window.db.onWindowStateChange((state) => setIsMaximized(state))
  }, [])

  // --- THEME ENGINE: Apply Variables ---
  const appStyle = settings.backgroundImage 
    ? { backgroundImage: `linear-gradient(rgba(26, 27, 38, 0.85), rgba(26, 27, 38, 0.95)), url(${settings.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } 
    : { backgroundColor: settings.backgroundColor }

  useEffect(() => {
    if(!settings.backgroundImage) {
        // Convert HEX to RGB for Tailwind opacity support
        const rgbValue = hexToRgb(settings.backgroundColor);
        document.documentElement.style.setProperty('--bg-base', rgbValue);
        
        // Optional: Make surface slightly lighter than base automatically
        // You could add logic here to calculate lighter shades if needed
    }
  }, [settings.backgroundColor, settings.backgroundImage])
  // -------------------------------------

  // --- DATA LOGIC ---
  const visibleTasks = items
    .filter(item => {
        if (item.type !== 'task') return false; 
        if (taskViewMode === 'all') return true
        const itemDate = new Date(item.date).toDateString()
        const selectedDateStr = selectedDate.toDateString()
        return itemDate === selectedDateStr
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date) || a.startTime.localeCompare(b.startTime))

  const handleSaveItem = (itemData) => {
    if (itemData.id) {
        setItems(items.map(i => i.id === itemData.id ? itemData : i))
    } else {
        setItems([...items, { ...itemData, id: Date.now() }])
    }
    setShowEventModal(false)
    setEditingItem(null)
  }

  const handleDeleteItem = (id) => {
      setItems(items.filter(i => i.id !== id))
      setShowEventModal(false)
  }

  const openEditModal = (item) => {
      setEditingItem(item)
      setShowEventModal(true)
  }

  const openCreateModal = () => {
      setEditingItem(null)
      setShowEventModal(true)
  }

  const handleToggleTask = (id) => setItems(items.map(t => t.id === id ? { ...t, done: !t.done } : t))
  
  const handleAddTask = (text) => {
    let title = text;
    let project = "";
    if (text.includes('+')) {
        const parts = text.split('+');
        title = parts[0].trim();
        project = parts[1].trim().toUpperCase(); 
    }
    const newItem = {
        id: Date.now(),
        type: 'task',
        title: title,
        project: project,
        date: selectedDate,
        startTime: '12:00',
        done: false,
        color: 'purple'
    }
    setItems([...items, newItem])
  }

  // --- NAVIGATION ---
  const handlePrev = () => {
      if(calendarView === 'month') setViewDate(subMonths(viewDate, 1))
      else setViewDate(subWeeks(viewDate, 1))
  }

  const handleNext = () => {
      if(calendarView === 'month') setViewDate(addMonths(viewDate, 1))
      else setViewDate(addWeeks(viewDate, 1))
  }

  // --- AUDIO & FOCUS ---
  const { playSound } = useAudio(settings.customSound) 

  const handleTimerFinish = () => {
    playSound()
    if (settings.enableNotifications) {
        const notif = new Notification('Helm', { body: 'Session Complete', silent: true })
        notif.onclick = () => window.electron?.ipcRenderer?.send('window:focus')
    }
  }

  const focusLogic = useFocusLogic(settings.focusDuration, settings.breakDuration, handleTimerFinish)
  const formatTime = (s) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`

  useEffect(() => {
    window.db.sendTimerSync({
      time: formatTime(focusLogic.currentSlice),
      isActive: focusLogic.isActive,
      mode: focusLogic.mode
    })
  }, [focusLogic.currentSlice, focusLogic.isActive, focusLogic.mode])

  // Mini Window Listener
  useEffect(() => {
    const removeListener = window.db.onTimerCommand((action) => {
        if (action === 'toggle') focusLogic.toggleTimer()
        if (action === 'stop') focusLogic.resetSession()
    })
    return () => {} // Clean up handled by electron bridge mostly
  }, [focusLogic]) 

  // --- KEYBOARD ---
  useKeyboard({
      'REQ_CTRL+1': () => setView('dashboard'),
      'REQ_CTRL+2': () => setView('focus'),
      'REQ_CTRL+n': () => openCreateModal(),
      'REQ_CTRL+,': () => setShowSettings(true),
      'a': () => {
          const cmdInput = document.getElementById('cmd-input')
          if (cmdInput) cmdInput.focus()
      },
      'Escape': () => {
          setShowEventModal(false)
          setShowSettings(false)
      }
  })

  // --- RENDER BOOT ---
  if (isBooting) return <BootSequence onComplete={() => setIsBooting(false)} />

  // --- COMMAND PARSER ---
  const handleCommandInput = (input) => {
    if (input.startsWith('/')) {
        const [cmd, ...args] = input.slice(1).split(' ')
        const arg1 = args[0]

        switch (cmd.toLowerCase()) {
            case 'timer':
                if (arg1 && !isNaN(arg1)) {
                    focusLogic.startCustomSession(parseInt(arg1))
                    setView('focus')
                } else {
                    setView('focus')
                }
                break;
            case 'focus':
                if (arg1 && !isNaN(arg1)) { setView('focus') } 
                else { setView('focus') }
                break;
            case 'dashboard':
            case 'home':
                setView('dashboard')
                break;
            case 'clear':
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
                console.warn("Unknown command")
        }
    } else {
        handleAddTask(input)
    }
  }

  const handleSaveDescription = (id, newDescription) => {
      // Check if this is a "Composite ID" (String with underscore) -> Notebook
      if (typeof id === 'string' && id.includes('_')) {
          // It's a daily class note
          setNotebooks(prev => {
              const exists = prev.find(n => n.id === id)
              if (exists) {
                  return prev.map(n => n.id === id ? { ...n, content: newDescription } : n)
              } else {
                  return [...prev, { id, content: newDescription }]
              }
          })
      } else {
          // It's a standard task ID (Number) -> Standard Description
          setItems(prev => prev.map(t => t.id === id ? { ...t, description: newDescription } : t))
      }
      setScratchpadTask(null)
  }

  return (
    <div className="h-screen w-screen flex flex-col p-4 pt-1 overflow-hidden font-mono relative transition-colors duration-500 text-tokyo-text" style={appStyle}>
      
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
            
            {view === 'dashboard' && (
                <button 
                    onClick={() => setShowJournal(!showJournal)}
                    className={`transition ${showJournal ? 'text-tokyo-cyan' : 'text-tokyo-dim'}`}
                    title="Toggle Journal Sidebar"
                >
                    <Sidebar size={16} />
                </button>
            )}

            <button onClick={() => setShowSettings(true)} className="text-tokyo-dim hover:text-tokyo-text transition">
               <Settings size={16} />
            </button>
            <button onClick={() => window.db.minimizeWindow()} className="text-tokyo-dim hover:text-tokyo-text transition p-1 hover:bg-tokyo-highlight/50 rounded">
               <Minus size={16} />
            </button>
            <button onClick={() => window.db.maximizeWindow()} className="text-tokyo-dim hover:text-tokyo-text transition p-1 hover:bg-tokyo-highlight/50 rounded">
               {isMaximized ? <Copy size={16} /> : <Square size={16} />}
            </button>
            <button onClick={() => window.db.closeApp()} className="text-tokyo-dim hover:text-tokyo-red transition p-1 hover:bg-tokyo-red/10 rounded">
               <X size={18} />
            </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 min-h-0 relative z-0 flex gap-4">
        {view === 'dashboard' && (
            <>
                {/* LEFT PANE (Calendar) */}
                <div className={`flex flex-col gap-2 h-full min-h-0 transition-all duration-300 ${showJournal ? 'w-[70%]' : 'w-full'}`}>
                    <div className="flex justify-between items-center bg-tokyo-surface/20 p-2 rounded border border-tokyo-highlight">
                         <div className="flex gap-2 items-center">
                            <div className="flex gap-1 mr-2">
                                <button onClick={handlePrev} className="p-1 hover:text-tokyo-cyan"><ChevronLeft size={14} /></button>
                                <button onClick={handleNext} className="p-1 hover:text-tokyo-cyan"><ChevronRight size={14} /></button>
                            </div>
                            <button onClick={() => setCalendarView('month')} className={`text-sm px-2 py-1 rounded transition ${calendarView === 'month' ? 'bg-tokyo-cyan text-tokyo-base font-bold' : 'text-tokyo-dim hover:text-tokyo-text'}`}>MONTH</button>
                            <button onClick={() => setCalendarView('week')} className={`text-sm px-2 py-1 rounded transition ${calendarView === 'week' ? 'bg-tokyo-cyan text-tokyo-base font-bold' : 'text-tokyo-dim hover:text-tokyo-text'}`}>WEEK</button>
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
                                onSelectItem={openEditModal} 
                            />
                        )}
                    </div>
                </div>

                {/* RIGHT PANE (Journal) */}
                {showJournal && (
                    <div className="w-[30%] h-full min-h-0">
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
            </>
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

      {showSettings && (
        <SettingsModal 
            settings={settings} 
            onSave={(newSettings) => { 
                setSettings(newSettings); 
                setShowSettings(false);
                window.db.setItems('settings', newSettings) 
            }} 
            onClose={() => setShowSettings(false)} 
        />
      )}
      
      {showEventModal && (
        <EventModal 
            selectedDate={selectedDate} 
            initialData={editingItem} 
            notebooks={notebooks} 

            onSave={handleSaveItem} 
            onDelete={handleDeleteItem}
            onClose={() => setShowEventModal(false)}
            onOpenScratchpad={(task) => {
                setShowEventModal(false) 
                setScratchpadTask(task)
            }} 
        />
      )}

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