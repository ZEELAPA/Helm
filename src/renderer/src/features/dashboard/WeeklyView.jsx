import React from 'react'
import { startOfWeek, addDays, format, isSameDay, startOfDay } from 'date-fns'

const WeeklyView = ({ currentDate, items, onSelectItem }) => {
  const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 0 }) 
  const weekDays = [...Array(7)].map((_, i) => addDays(startOfCurrentWeek, i))
  const hours = [...Array(24)].map((_, i) => i) 

  // --- FIX: Explicit Color Mapping for Tailwind ---
  const colorLookup = {
      green:   { bg: 'bg-tokyo-green/20',   border: 'border-tokyo-green',   text: 'text-tokyo-green' },
      teal:    { bg: 'bg-tokyo-teal/20',    border: 'border-tokyo-teal',    text: 'text-tokyo-teal' },
      cyan:    { bg: 'bg-tokyo-cyan/20',    border: 'border-tokyo-cyan',    text: 'text-tokyo-cyan' },
      blue:    { bg: 'bg-tokyo-blue/20',    border: 'border-tokyo-blue',    text: 'text-tokyo-blue' },
      purple:  { bg: 'bg-tokyo-purple/20',  border: 'border-tokyo-purple',  text: 'text-tokyo-purple' },
      magenta: { bg: 'bg-tokyo-magenta/20', border: 'border-tokyo-magenta', text: 'text-tokyo-magenta' },
      pink:    { bg: 'bg-tokyo-red/20',     border: 'border-tokyo-red',     text: 'text-tokyo-red' },
      red:     { bg: 'bg-tokyo-red/20',     border: 'border-tokyo-red',     text: 'text-tokyo-red' },
      orange:  { bg: 'bg-tokyo-orange/20',  border: 'border-tokyo-orange',  text: 'text-tokyo-orange' },
      yellow:  { bg: 'bg-tokyo-yellow/20',  border: 'border-tokyo-yellow',  text: 'text-tokyo-yellow' },
  }

  const getStylePosition = (startTime, endTime, type) => {
        if (!startTime) return { top: '0px', height: '0px' }

        const [startH, startM] = startTime.split(':').map(Number)
        const startMinutes = (startH * 60) + startM
        
        let endMinutes;
        if (endTime && type !== 'task') {
            const [endH, endM] = endTime.split(':').map(Number)
            endMinutes = (endH * 60) + endM
        } else {
            endMinutes = startMinutes + 30 
        }

        const duration = endMinutes - startMinutes

        return {
            top: `${startMinutes}px`,
            height: `${Math.max(25, duration)}px`
        }
    }

  const getItemsForDay = (dayDate) => {
    return items.filter(item => {
        const checkDate = startOfDay(dayDate)
        if (item.repeats === 'weekly') {
             if (item.dayOfWeek !== dayDate.getDay()) return false;
             if (item.repeatStart && checkDate < startOfDay(new Date(item.repeatStart))) return false;
             if (item.repeatEnd && checkDate > startOfDay(new Date(item.repeatEnd))) return false;
             return true;
        }
        if (item.date && isSameDay(new Date(item.date), dayDate)) return true
        return false
    })
  }

  return (
    <div className="flex flex-col h-full overflow-hidden text-xs select-none">
      {/* Header Row */}
      <div className="grid grid-cols-[50px_repeat(7,1fr)] border-b border-tokyo-highlight bg-tokyo-base">
        <div className="p-2 border-r border-tokyo-highlight"></div> 
        {weekDays.map(day => (
            <div key={day.toString()} className={`p-2 text-center border-r border-tokyo-surface flex flex-col ${isSameDay(day, new Date()) ? 'text-tokyo-cyan bg-tokyo-cyan/10' : 'text-tokyo-dim'}`}>
                <span className="font-bold uppercase">{format(day, 'EEE')}</span>
                <span className="text-lg">{format(day, 'd')}</span>
            </div>
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-tokyo-base/30">
        <div className="grid grid-cols-[50px_repeat(7,1fr)] grid-rows-[repeat(24,60px)]">
            {/* Time Labels (AM/PM) */}
            <div className="row-span-full border-r border-tokyo-highlight bg-tokyo-base/50 z-30 sticky left-0 shadow-lg">
                {hours.map(h => {
                    const ampm = h >= 12 ? 'PM' : 'AM'
                    const displayHour = h % 12 || 12 
                    return (
                        <div key={h} className="h-[60px] border-b border-tokyo-surface text-[10px] text-tokyo-dim text-right pr-2 pt-1">
                            {displayHour} {ampm}
                        </div>
                    )
                })}
            </div>

            {/* Columns */}
            {weekDays.map((day, dayIndex) => {
                const dayEvents = getItemsForDay(day)
                return (
                    <div key={dayIndex} className="row-span-full relative border-r border-tokyo-surface/30">
                        {hours.map(h => <div key={h} className="h-[60px] border-b border-tokyo-surface/20 pointer-events-none"></div>)}

                        {dayEvents.map(event => {
                            const isTask = event.type === 'task'
                            const stylePos = getStylePosition(event.startTime, event.endTime, event.type)
                            const zIndex = isTask ? 'z-20' : 'z-10'
                            
                            // --- FIX: USE LOOKUP TABLE ---
                            const colorKey = event.color || 'green'
                            const theme = colorLookup[colorKey] || colorLookup['green']

                            const taskStyle = `left-1 right-1 bg-tokyo-surface border-l-4 ${theme.border} shadow-lg shadow-black/50`
                            const eventStyle = `inset-x-0 ${theme.bg} border-l-2 ${theme.border} ${theme.text}`
                            
                            const taskText = event.done ? "text-tokyo-dim line-through decoration-tokyo-red" : "text-tokyo-text font-bold"

                            return (
                                <div
                                    key={event.id}
                                    onClick={(e) => { e.stopPropagation(); onSelectItem(event); }}
                                    className={`absolute rounded p-2 overflow-hidden cursor-pointer hover:brightness-110 flex flex-col leading-tight transition-all ${zIndex} ${isTask ? taskStyle : eventStyle}`}
                                    style={{
                                         top: stylePos.top,
                                        height: stylePos.height
                                    }}
                                >
                                    <div className="flex justify-between items-start gap-1">
                                        <span className={isTask ? taskText : "font-bold"}>
                                            {event.title}
                                        </span>
                                    </div>
                                    
                                    {parseInt(stylePos.height) > 35 && (
                                        <span className="opacity-70 text-[9px] mt-1 font-mono block">
                                            {event.startTime}
                                        </span>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )
            })}
        </div>
      </div>
    </div>
  )
}

export default WeeklyView