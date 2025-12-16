import React from 'react'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isSameDay } from 'date-fns'

const CalendarGrid = ({ viewDate, selectedDate, items = [], onSelectDate }) => { // Accepted items prop
  const monthStart = startOfMonth(viewDate)
  const monthEnd = endOfMonth(viewDate)
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }) 
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 })

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate })

  // --- HELPER: Find items for a specific grid day ---
  const getDotsForDay = (dayDate) => {
    // Filter items that match this specific day
    const dayItems = items.filter(item => {
        // 1. Check for Weekly Repeats (Events only usually)
        if (item.repeats === 'weekly' && item.dayOfWeek === dayDate.getDay()) return true
        
        // 2. Check for Specific Date matches
        if (item.date) {
            // Handle string vs Date object issues safely
            const itemDateObj = new Date(item.date)
            return isSameDay(itemDateObj, dayDate)
        }
        return false
    })

    // Sort: Events (Green) first, then Tasks (Purple)
    return dayItems.sort((a, b) => (a.type === 'event' ? -1 : 1))
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 flex justify-between items-baseline border-b border-tokyo-surface bg-tokyo-base/50">
        <h2 className="text-3xl font-bold text-tokyo-blue tracking-tighter uppercase">
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

            // Get data for this cell
            const dots = getDotsForDay(dayItem)

            return (
                <div 
                    key={index}
                    onClick={() => onSelectDate(dayItem)}
                    className={`
                        relative border-r border-b border-tokyo-surface/50 p-2 cursor-pointer transition-colors duration-100 flex flex-col justify-between
                        hover:bg-tokyo-highlight/20
                        ${!isCurrentMonth ? 'text-tokyo-dim/30 bg-tokyo-base/30' : 'text-tokyo-text'}
                        ${isSelected ? 'bg-tokyo-highlight/30' : ''}
                    `}
                >
                    <div className="flex justify-between items-start">
                        <span className={`text-sm font-bold ${isToday ? 'text-tokyo-cyan' : ''}`}>
                            {format(dayItem, 'd')}
                        </span>
                        
                        {/* Status Indicator for Today */}
                        {isToday && (
                             <div className="w-1.5 h-1.5 rounded-full bg-tokyo-cyan shadow-[0_0_8px_#7dcfff]"></div>
                        )}
                    </div>

                    {/* --- THE SIGNAL DOTS --- */}
                    <div className="flex gap-1 flex-wrap content-end min-h-[6px]">
                        {dots.slice(0, 5).map((item, i) => (
                            <div 
                                key={item.id || i} 
                                className={`w-1.5 h-1.5 rounded-full ${
                                    item.type === 'event' 
                                        ? 'bg-tokyo-green shadow-[0_0_5px_rgba(115,218,170,0.5)]' // Green + Glow
                                        : 'bg-tokyo-purple' // Purple
                                }`}
                                title={item.title}
                            />
                        ))}
                        {/* If more than 5 items, show a small plus */}
                        {dots.length > 5 && (
                            <div className="w-1.5 h-1.5 flex items-center justify-center text-[6px] text-tokyo-dim">+</div>
                        )}
                    </div>
                </div>
            )
        })}
      </div>
    </div>
  )
}

export default CalendarGrid