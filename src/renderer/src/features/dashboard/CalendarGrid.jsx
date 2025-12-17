import React from 'react'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isSameDay } from 'date-fns'

const CalendarGrid = ({ viewDate, selectedDate, items = [], onSelectDate }) => {
  const monthStart = startOfMonth(viewDate)
  const monthEnd = endOfMonth(viewDate)
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }) 
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 })

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate })

  // --- HELPER: Split items into Events and Tasks ---
  const getItemsForDay = (dayDate) => {
    const dayItems = items.filter(item => {
        // 1. Weekly Repeats
        if (item.repeats === 'weekly' && item.dayOfWeek === dayDate.getDay()) return true
        // 2. Specific Date
        if (item.date) return isSameDay(new Date(item.date), dayDate)
        return false
    })

    return {
        events: dayItems.filter(i => i.type === 'event'),
        tasks: dayItems.filter(i => i.type === 'task').sort((a,b) => Number(a.done) - Number(b.done)) // Pending first
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden select-none">
      {/* Header */}
      <div className="p-4 flex justify-between items-baseline border-b border-tokyo-surface bg-tokyo-base/50">
        <h2 className="text-2xl font-bold text-tokyo-blue tracking-wider uppercase font-mono ">
          {format(viewDate, 'MMMM yyyy')}
        </h2>
        <span className="text-tokyo-dim text-sm font-mono">STATUS: ONLINE</span>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 border-b border-tokyo-highlight bg-tokyo-base/50">
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
          <div key={day} className="py-2 text-center text-xs font-bold text-tokyo-dim tracking-widest">
            {day}
          </div>
        ))}
      </div>

      {/* The Grid */}
      <div className="grid grid-cols-7 grid-rows-6 flex-1">
        {calendarDays.map((dayItem, index) => {
            const isSelected = isSameDay(dayItem, selectedDate)
            const isCurrentMonth = isSameMonth(dayItem, monthStart)
            const isToday = isSameDay(dayItem, new Date())

            const { events, tasks } = getItemsForDay(dayItem)

            return (
                <div 
                    key={index}
                    onClick={() => onSelectDate(dayItem)}
                    className={`
                        relative border-r border-b border-tokyo-surface/50 p-2 cursor-pointer transition-colors duration-100 flex flex-col gap-1
                        hover:bg-tokyo-highlight/20
                        ${!isCurrentMonth ? 'text-tokyo-dim/30 bg-tokyo-base/30' : 'text-tokyo-text'}
                        ${isSelected ? 'bg-tokyo-highlight/30' : ''}
                    `}
                >
                    {/* Date Number */}
                    <div className="flex justify-between items-start mb-1">
                        <span className={`text-sm font-bold ${isToday ? 'text-tokyo-cyan' : ''}`}>
                            {format(dayItem, 'd')}
                        </span>
                        {isToday && <div className="w-1.5 h-1.5 rounded-full bg-tokyo-cyan shadow-[0_0_8px_#7dcfff]"></div>}
                    </div>

                    {/* ROW 1: EVENTS (Green Dots) */}
                    <div className="flex gap-1 flex-wrap content-start min-h-[6px]">
                        {events.slice(0, 8).map((item, i) => (
                            <div 
                                key={item.id || i} 
                                className="w-1.5 h-1.5 rounded-full bg-tokyo-green shadow-[0_0_5px_rgba(115,218,170,0.5)]"
                                title={`Event: ${item.title}`}
                            />
                        ))}
                    </div>

                    {/* ROW 2: TASKS (Purple Dots) */}
                    <div className="flex gap-1 flex-wrap content-start min-h-[6px]">
                        {tasks.slice(0, 8).map((item, i) => (
                            <div 
                                key={item.id || i} 
                                className={`w-1.5 h-1.5 rounded-full box-border ${
                                    item.done 
                                    ? 'border border-tokyo-dim opacity-50' // Hollow circle for Done
                                    : 'bg-tokyo-purple' // Solid for Pending
                                }`}
                                title={`Task: ${item.title}`}
                            />
                        ))}
                    </div>
                </div>
            )
        })}
      </div>
    </div>
  )
}

export default CalendarGrid