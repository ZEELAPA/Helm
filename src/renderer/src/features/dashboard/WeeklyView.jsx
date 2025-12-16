import React from 'react'
import { startOfWeek, addDays, format, isSameDay } from 'date-fns'

const WeeklyView = ({ currentDate, items, onSelectItem }) => {
  // Use currentDate as the anchor for the week view
  const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 0 }) 
  const weekDays = [...Array(7)].map((_, i) => addDays(startOfCurrentWeek, i))
  const hours = [...Array(24)].map((_, i) => i) 

    const getStylePosition = (startTime, endTime) => {
        if (!startTime) return { top: '0px', height: '0px' }

        const [startH, startM] = startTime.split(':').map(Number)
        // 1. Calculate Start Position
        const startMinutes = (startH * 60) + startM

        // 2. Calculate End Position
        let endMinutes;
        
        if (endTime) {
            // It has an end time (Event)
            const [endH, endM] = endTime.split(':').map(Number)
            endMinutes = (endH * 60) + endM
        } else {
            // It is a Task (No end time) -> Default to 30 mins visual height
            endMinutes = startMinutes + 30 
        }

        const duration = endMinutes - startMinutes

        return {
            top: `${startMinutes}px`,
            height: `${Math.max(20, duration)}px`
        }
    }

  const getItemsForDay = (dayDate) => {
    return items.filter(item => {
        // ALLOW BOTH EVENTS AND TASKS
        // 1. Check recurring
        if (item.repeats === 'weekly' && item.dayOfWeek === dayDate.getDay()) return true
        // 2. Check specific date
        if (item.date && isSameDay(new Date(item.date), dayDate)) return true
        return false
    })
  }

  // Helper for colors
  const getColor = (color, type) => {
      const map = {
          green: 'bg-tokyo-green text-tokyo-base',
          pink: 'bg-tokyo-red text-white',
          blue: 'bg-tokyo-blue text-tokyo-base',
          orange: 'bg-tokyo-orange text-tokyo-base',
          purple: 'bg-tokyo-purple text-white'
      }
      return map[color] || map['green']
  }

  return (
    <div className="flex flex-col h-full overflow-hidden text-xs">
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
      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        <div className="grid grid-cols-[50px_repeat(7,1fr)] grid-rows-[repeat(24,60px)]">
            {/* Time Labels */}
            <div className="row-span-full border-r border-tokyo-highlight bg-tokyo-base/50 z-10 sticky left-0">
                {hours.map(h => (
                    <div key={h} className="h-[60px] border-b border-tokyo-surface text-[10px] text-tokyo-dim text-right pr-2 pt-1">
                        {h}:00
                    </div>
                ))}
            </div>

            {/* Columns */}
            {weekDays.map((day, dayIndex) => {
                const dayEvents = getItemsForDay(day)
                return (
                    <div key={dayIndex} className="row-span-full relative border-r border-tokyo-surface/50">
                        {hours.map(h => <div key={h} className="h-[60px] border-b border-tokyo-surface/30 pointer-events-none"></div>)}

                        {dayEvents.map(event => {
                            const stylePos = getStylePosition(event.startTime, event.endTime) // Use new helper
                            const colorClass = getColor(event.color, event.type)
                            const borderClass = event.type === 'task' ? 'border-dashed border-2' : 'border-solid border'
                            
                            return (
                                <div
                                    key={event.id}
                                    onClick={(e) => { e.stopPropagation(); onSelectItem(event); }}
                                    className={`absolute inset-x-1 rounded p-1 border-white/20 shadow-lg cursor-pointer hover:brightness-110 overflow-hidden z-10 flex flex-col ${colorClass} ${borderClass}`}
                                    style={{
                                         top: stylePos.top,
                                        height: stylePos.height
                                    }}
                                >
                                    <div className="flex justify-between items-start">
                                        {/* Truncate text if height is small */}
                                        <span className="font-bold leading-tight truncate">{event.title}</span>
                                    </div>
                                    {/* Hide time if box is too small */}
                                    {parseInt(stylePos.height) > 30 && (
                                        <span className="opacity-80 text-[10px]">{event.startTime} - {event.endTime}</span>
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