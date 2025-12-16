import React, { useState } from 'react'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addMonths, subMonths, isSameMonth } from 'date-fns'
import { Calendar as CalIcon, Clock, ChevronLeft, ChevronRight } from 'lucide-react'

// --- 1. THE DATE PICKER ---
export const CustomDatePicker = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date()) // For navigation

  const selectedDate = value ? new Date(value) : new Date()

  // Generate Mini Grid
  const monthStart = startOfMonth(viewDate)
  const monthEnd = endOfMonth(viewDate)
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 })
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 })
  const days = eachDayOfInterval({ start: startDate, end: endDate })

  const handleSelect = (day) => {
    // Return formatted string "YYYY-MM-DD" to match native input behavior
    onChange(format(day, 'yyyy-MM-dd'))
    setIsOpen(false)
  }

  return (
    <div className="relative w-full font-mono">
      {/* The Input Trigger */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 bg-tokyo-base border p-2 cursor-pointer transition select-none ${isOpen ? 'border-tokyo-cyan' : 'border-tokyo-highlight hover:border-tokyo-cyan/50'}`}
      >
        <CalIcon size={14} className="text-tokyo-dim" />
        <span className="text-sm text-tokyo-text">{format(selectedDate, 'MMM dd, yyyy')}</span>
      </div>

      {/* The Popup */}
      {isOpen && (
        <>
          {/* Backdrop to close */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          
          <div className="absolute top-full left-0 mt-1 w-64 bg-tokyo-base border border-tokyo-cyan shadow-xl z-50 p-2">
            
            {/* Nav Header */}
            <div className="flex justify-between items-center mb-2 px-1">
                <button onClick={(e) => {e.stopPropagation(); setViewDate(subMonths(viewDate, 1))}} className="hover:text-tokyo-cyan"><ChevronLeft size={16}/></button>
                <span className="text-xs font-bold text-tokyo-cyan uppercase">{format(viewDate, 'MMMM yyyy')}</span>
                <button onClick={(e) => {e.stopPropagation(); setViewDate(addMonths(viewDate, 1))}} className="hover:text-tokyo-cyan"><ChevronRight size={16}/></button>
            </div>

            {/* Grid */}
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
        </>
      )}
    </div>
  )
}

// --- 2. THE TIME PICKER ---
export const CustomTimePicker = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false)
    
    // Parse "HH:MM"
    const [hours, minutes] = value ? value.split(':') : ['09', '00']
    
    const hourOptions = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'))
    // 5-minute intervals for cleaner UI, or use length 60 for full precision
    const minuteOptions = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0')) 

    const handleHourChange = (h) => onChange(`${h}:${minutes}`)
    const handleMinuteChange = (m) => onChange(`${hours}:${m}`)

    return (
        <div className="relative w-full font-mono">
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 bg-tokyo-base border p-2 cursor-pointer transition select-none ${isOpen ? 'border-tokyo-cyan' : 'border-tokyo-highlight hover:border-tokyo-cyan/50'}`}
            >
                <Clock size={14} className="text-tokyo-dim" />
                <span className="text-sm text-tokyo-text">{value}</span>
            </div>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute top-full left-0 mt-1 w-48 bg-tokyo-base border border-tokyo-cyan shadow-xl z-50 flex h-48">
                        
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
                </>
            )}
        </div>
    )
}