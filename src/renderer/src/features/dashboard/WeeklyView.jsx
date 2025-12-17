import React from 'react'
import { startOfWeek, addDays, format, isSameDay } from 'date-fns'

const WeeklyView = ({ currentDate, items, onSelectItem }) => {
  const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 0 }) 
  const weekDays = [...Array(7)].map((_, i) => addDays(startOfCurrentWeek, i))
  const hours = [...Array(24)].map((_, i) => i) 

    const getStylePosition = (startTime, endTime, type) => {
        if (!startTime) return { top: '0px', height: '0px' }

        const [startH, startM] = startTime.split(':').map(Number)
        const startMinutes = (startH * 60) + startM

        let endMinutes;
        if (endTime) {
            const [endH, endM] = endTime.split(':').map(Number)
            endMinutes = (endH * 60) + endM
        } else {
            // Tasks default to 45 mins visual height if no end time, or 30 mins
            endMinutes = startMinutes + (type === 'task' ? 45 : 60) 
        }

        const duration = endMinutes - startMinutes

        return {
            top: `${startMinutes}px`,
            height: `${Math.max(25, duration)}px` // Minimum height for readability
        }
    }

  const getItemsForDay = (dayDate) => {
    return items.filter(item => {
        if (item.repeats === 'weekly' && item.dayOfWeek === dayDate.getDay()) return true
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
            {/* Time Labels */}
            <div className="row-span-full border-r border-tokyo-highlight bg-tokyo-base/50 z-30 sticky left-0 shadow-lg">
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
                    <div key={dayIndex} className="row-span-full relative border-r border-tokyo-surface/30">
                        {/* Grid Lines */}
                        {hours.map(h => <div key={h} className="h-[60px] border-b border-tokyo-surface/20 pointer-events-none"></div>)}

                        {dayEvents.map(event => {
                            const isTask = event.type === 'task'
                            const stylePos = getStylePosition(event.startTime, event.endTime, event.type)
                            
                            // VISUAL LOGIC FOR OVERLAP
                            // Events: Z-10, slightly transparent, full width
                            // Tasks: Z-20, Solid color, "Sticker" look, slightly inset
                            
                            const zIndex = isTask ? 'z-20' : 'z-10'
                            
                            // Style classes
                            const baseClasses = "absolute rounded p-2 overflow-hidden cursor-pointer hover:brightness-110 flex flex-col leading-tight transition-all"
                            
                            const taskStyle = "left-1 right-1 bg-tokyo-surface border-l-4 border-tokyo-purple shadow-lg shadow-black/50"
                            const eventStyle = "inset-x-0 bg-tokyo-green/20 border-l-2 border-tokyo-green text-tokyo-green"

                            // Task Text Colors
                            const taskText = event.done ? "text-tokyo-dim line-through decoration-tokyo-red" : "text-tokyo-text font-bold"

                            return (
                                <div
                                    key={event.id}
                                    onClick={(e) => { e.stopPropagation(); onSelectItem(event); }}
                                    className={`${baseClasses} ${zIndex} ${isTask ? taskStyle : eventStyle}`}
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
                                    
                                    {/* Only show time if height allows */}
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