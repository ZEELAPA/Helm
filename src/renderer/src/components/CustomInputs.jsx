import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addMonths, subMonths, isSameMonth } from 'date-fns'
import { Calendar as CalIcon, Clock, ChevronLeft, ChevronRight } from 'lucide-react'

// --- HELPER: Portal Logic ---
const PortalPopup = ({ children, onClose }) => {
    // FIX: Removed the 'scroll' listener. 
    // It was detecting the scroll *inside* the dropdown and closing it.
    useEffect(() => {
        const handleResize = () => onClose()
        window.addEventListener('resize', handleResize)
        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    return createPortal(
        <>
            {/* Invisible backdrop to catch clicks outside */}
            <div className="fixed inset-0 z-[9998]" onClick={onClose}></div>
            {/* The actual popup content */}
            <div className="fixed z-[9999]" style={{ isolation: 'isolate' }}>
                {children}
            </div>
        </>,
        document.body
    )
}

// --- 1. THE DATE PICKER ---
export const CustomDatePicker = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date())
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const triggerRef = useRef(null)

  const selectedDate = value ? new Date(value) : new Date()

  // Grid Generation
  const monthStart = startOfMonth(viewDate)
  const monthEnd = endOfMonth(viewDate)
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 })
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 })
  const days = eachDayOfInterval({ start: startDate, end: endDate })

  const toggleOpen = () => {
      if (!isOpen && triggerRef.current) {
          const rect = triggerRef.current.getBoundingClientRect()
          setCoords({ top: rect.bottom + 5, left: rect.left })
      }
      setIsOpen(!isOpen)
  }

  const handleSelect = (day) => {
    onChange(format(day, 'yyyy-MM-dd'))
    setIsOpen(false)
  }

  return (
    <>
      <div 
        ref={triggerRef}
        onClick={toggleOpen}
        className={`flex items-center gap-2 bg-tokyo-base border p-2 cursor-pointer transition select-none ${isOpen ? 'border-tokyo-cyan' : 'border-tokyo-highlight hover:border-tokyo-cyan/50'}`}
      >
        <CalIcon size={14} className="text-tokyo-dim" />
        <span className="text-sm text-tokyo-text">{format(selectedDate, 'MMM dd, yyyy')}</span>
      </div>

      {isOpen && (
        <PortalPopup onClose={() => setIsOpen(false)}>
          <div 
            className="w-64 bg-tokyo-base border border-tokyo-cyan shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-100"
            style={{ position: 'fixed', top: coords.top, left: coords.left }}
          >
            <div className="flex justify-between items-center mb-2 px-1">
                <button onClick={(e) => {e.stopPropagation(); setViewDate(subMonths(viewDate, 1))}} className="hover:text-tokyo-cyan"><ChevronLeft size={16}/></button>
                <span className="text-xs font-bold text-tokyo-cyan uppercase">{format(viewDate, 'MMMM yyyy')}</span>
                <button onClick={(e) => {e.stopPropagation(); setViewDate(addMonths(viewDate, 1))}} className="hover:text-tokyo-cyan"><ChevronRight size={16}/></button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
                {['S','M','T','W','T','F','S'].map(d => (
                    <div key={d} className="text-[10px] text-tokyo-dim font-bold">{d}</div>
                ))}
                
                {days.map((day, i) => {
                    const isSelected = isSameDay(day, selectedDate)
                    const isCurrentMonth = isSameMonth(day, viewDate)
                    return (
                        <div 
                            key={i} 
                            onClick={(e) => { e.stopPropagation(); handleSelect(day); }}
                            className={`
                                text-xs py-1 cursor-pointer rounded hover:bg-tokyo-highlight
                                ${!isCurrentMonth ? 'text-tokyo-dim/30' : 'text-tokyo-text'}
                                ${isSelected ? 'bg-tokyo-cyan text-tokyo-base font-bold' : ''}
                            `}
                        >
                            {format(day, 'd')}
                        </div>
                    )
                })}
            </div>
          </div>
        </PortalPopup>
      )}
    </>
  )
}

// --- 2. THE TIME PICKER ---
export const CustomTimePicker = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [coords, setCoords] = useState({ top: 0, left: 0 })
    const triggerRef = useRef(null)
    
    const [hours, minutes] = value ? value.split(':') : ['09', '00']
    const hourOptions = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'))
    const minuteOptions = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0')) 

    const toggleOpen = () => {
        if (!isOpen && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect()
            setCoords({ top: rect.bottom + 5, left: rect.left })
        }
        setIsOpen(!isOpen)
    }

    const handleHourChange = (h) => onChange(`${h}:${minutes}`)
    const handleMinuteChange = (m) => onChange(`${hours}:${m}`)

    return (
        <>
            <div 
                ref={triggerRef}
                onClick={toggleOpen}
                className={`flex items-center gap-2 bg-tokyo-base border p-2 cursor-pointer transition select-none ${isOpen ? 'border-tokyo-cyan' : 'border-tokyo-highlight hover:border-tokyo-cyan/50'}`}
            >
                <Clock size={14} className="text-tokyo-dim" />
                <span className="text-sm text-tokyo-text">{value}</span>
            </div>

            {isOpen && (
                <PortalPopup onClose={() => setIsOpen(false)}>
                    <div 
                        className="w-48 bg-tokyo-base border border-tokyo-cyan shadow-2xl flex h-48 animate-in fade-in zoom-in-95 duration-100"
                        style={{ position: 'fixed', top: coords.top, left: coords.left }}
                    >
                        {/* Hours Column */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar border-r border-tokyo-surface p-1">
                            <div className="text-[10px] text-center text-tokyo-dim mb-1">HR</div>
                            {hourOptions.map(h => (
                                <div 
                                    key={h} 
                                    onClick={() => handleHourChange(h)}
                                    className={`text-center text-xs py-1 cursor-pointer hover:bg-tokyo-highlight ${hours === h ? 'text-tokyo-cyan font-bold bg-tokyo-highlight/20' : 'text-tokyo-text'}`}
                                >
                                    {h}
                                </div>
                            ))}
                        </div>

                        {/* Minutes Column */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
                            <div className="text-[10px] text-center text-tokyo-dim mb-1">MIN</div>
                            {minuteOptions.map(m => (
                                <div 
                                    key={m} 
                                    onClick={() => handleMinuteChange(m)}
                                    className={`text-center text-xs py-1 cursor-pointer hover:bg-tokyo-highlight ${minutes === m ? 'text-tokyo-purple font-bold bg-tokyo-highlight/20' : 'text-tokyo-text'}`}
                                >
                                    {m}
                                </div>
                            ))}
                        </div>
                    </div>
                </PortalPopup>
            )}
        </>
    )
}