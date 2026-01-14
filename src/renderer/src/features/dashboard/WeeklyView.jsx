import React from 'react'
import { startOfWeek, addDays, format, isSameDay, startOfDay } from 'date-fns'

const WeeklyView = ({ currentDate, items, onSelectItem }) => {
  const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 0 }) 
  const weekDays = [...Array(7)].map((_, i) => addDays(startOfCurrentWeek, i))
  const hours = [...Array(24)].map((_, i) => i) 

  const getStylePosition = (startTime, endTime, type) => {
        if (!startTime) return { top: '0px', height: '0px' }

        const [startH, startM] = startTime.split(':').map(Number)
        const startMinutes = (startH * 60) + startM
        
        // FIX: Ensure tasks always have a default height if no endTime is set (which is now enforced)
        let endMinutes;
        if (endTime && type !== 'task') {
            const [endH, endM] = endTime.split(':').map(Number)
            endMinutes = (endH * 60) + endM
        } else {
            // Force 30 min height for tasks
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

  // ... (Return logic is same, update mapping below for colors)
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

      <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-tokyo-base/30">
        <div className="grid grid-cols-[50px_repeat(7,1fr)] grid-rows-[repeat(24,60px)]">
            <div className="row-span-full border-r border-tokyo-highlight bg-tokyo-base/50 z-30 sticky left-0 shadow-lg">
                {hours.map(h => {
                    // Logic to convert 0-23 to 12 AM/PM
                    const ampm = h >= 12 ? 'PM' : 'AM'
                    const displayHour = h % 12 || 12 
                    
                    return (
                        <div key={h} className="h-[60px] border-b border-tokyo-surface text-[10px] text-tokyo-dim text-right pr-2 pt-1">
                            {displayHour} {ampm}
                        </div>
                    )
                })}
            </div>

            {weekDays.map((day, dayIndex) => {
                const dayEvents = getItemsForDay(day)
                return (
                    <div key={dayIndex} className="row-span-full relative border-r border-tokyo-surface/30">
                        {hours.map(h => <div key={h} className="h-[60px] border-b border-tokyo-surface/20 pointer-events-none"></div>)}

                        {dayEvents.map(event => {
                            const isTask = event.type === 'task'
                            const stylePos = getStylePosition(event.startTime, event.endTime, event.type)
                            const zIndex = isTask ? 'z-20' : 'z-10'
                            
                            // Dynamic Colors
                            const color = event.color || 'green'
                            const taskStyle = `left-1 right-1 bg-tokyo-surface border-l-4 border-tokyo-${color} shadow-lg shadow-black/50`
                            const eventStyle = `inset-x-0 bg-tokyo-${color}/20 border-l-2 border-tokyo-${color} text-tokyo-${color}`
                            const taskText = event.done ? "text-tokyo-dim line-through decoration-tokyo-red" : "text-tokyo-text font-bold"

                            return (
                                <div
                                    key={event.id}
                                    onClick={(e) => { e.stopPropagation(); onSelectItem(event); }}
                                    className={`absolute rounded p-2 overflow-hidden cursor-pointer hover:brightness-110 flex flex-col leading-tight transition-all ${zIndex} ${isTask ? taskStyle : eventStyle}`}
                                    style={{ top: stylePos.top, height: stylePos.height }}
                                >
                                    <div className="flex justify-between items-start gap-1">
                                        <span className={isTask ? taskText : "font-bold"}>{event.title}</span>
                                    </div>
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