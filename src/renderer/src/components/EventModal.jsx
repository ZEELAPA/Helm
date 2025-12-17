import React, { useState, useEffect } from 'react'
import { X, Save, Calendar, AlignLeft, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { CustomDatePicker, CustomTimePicker } from './CustomInputs'

const EventModal = ({ selectedDate, initialData, onSave, onClose, onDelete, onOpenScratchpad }) => {
  // Default State
  const defaultState = {
    title: '',
    type: 'event',
    date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    startTime: '09:00',
    endTime: '10:00',
    description: '',
    repeats: 'none',
    color: 'green',
    project: ''
  }

  const [formData, setFormData] = useState(defaultState)

  useEffect(() => {
    if (initialData) {
        setFormData({
            ...defaultState,
            ...initialData,
            date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : defaultState.date
        })
    }
  }, [initialData])

  const handleSubmit = () => {
    if (!formData.title) return
    const dateObj = new Date(formData.date)
    const dayOfWeek = dateObj.getDay()
    onSave({ ...formData, id: initialData?.id, dayOfWeek })
  }

  const colorMap = {
      green: 'bg-tokyo-green',
      pink: 'bg-tokyo-red',
      blue: 'bg-tokyo-blue',
      orange: 'bg-tokyo-orange',
      purple: 'bg-tokyo-purple'
  }

  // --- ESCAPE KEY HANDLER ---
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
        e.stopPropagation() // Prevent bubbling
        onClose()
    }
  }

  return (
    // Added onKeyDown here to capture events from inputs
    <div 
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onKeyDown={handleKeyDown}
    >
      <div className="w-full max-w-md bg-tokyo-base border border-tokyo-cyan p-1 shadow-2xl">
        
        {/* Header */}
        <div className="bg-tokyo-surface p-2 flex justify-between items-center mb-4 border-b border-tokyo-highlight">
            <h2 className="text-tokyo-cyan font-bold tracking-widest flex items-center gap-2">
                <Calendar size={14} /> {initialData ? 'EDIT ENTRY' : 'NEW ENTRY'}
            </h2>
            <button onClick={onClose} className="hover:text-tokyo-red"><X size={18} /></button>
        </div>

        {/* Form Body */}
        <div className="p-4 space-y-4 font-mono text-sm">
            <div className="flex flex-col gap-1">
                <label className="text-tokyo-dim text-[10px] uppercase">Title</label>
                <input 
                    autoFocus
                    className="bg-tokyo-surface/50 border border-tokyo-highlight p-2 text-tokyo-text outline-none focus:border-tokyo-cyan placeholder-tokyo-dim/30"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    placeholder="Enter title..."
                />
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-tokyo-dim text-[10px] uppercase">Project / Category</label>
                <input 
                    type="text" 
                    className="bg-tokyo-base border border-tokyo-highlight p-2 text-sm text-tokyo-cyan font-bold rounded outline-none focus:border-tokyo-cyan placeholder-tokyo-dim/30"
                    value={formData.project || ''} 
                    onChange={(e) => setFormData({...formData, project: e.target.value})}
                    placeholder="e.g., WORK, PERSONAL"
                />
            </div>  

            <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={formData.type === 'event'} onChange={() => setFormData({...formData, type: 'event', color: 'green'})} className="accent-tokyo-cyan" />
                    <span className={formData.type === 'event' ? 'text-tokyo-cyan' : 'text-tokyo-dim'}>Event</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={formData.type === 'task'} onChange={() => setFormData({...formData, type: 'task', color: 'purple'})} className="accent-tokyo-purple" />
                    <span className={formData.type === 'task' ? 'text-tokyo-purple' : 'text-tokyo-dim'}>Task</span>
                </label>
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-tokyo-dim text-[10px] uppercase">Notes</label>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => {
                            if (initialData && onOpenScratchpad) {
                                onOpenScratchpad(initialData)
                            } else {
                                // Optional: You could allow opening scratchpad for new items if you save them first automatically
                                alert("Please save the task first to add notes.")
                            }
                        }}
                        className="w-full border border-dashed border-tokyo-highlight p-3 text-tokyo-dim hover:text-tokyo-purple hover:border-tokyo-purple transition flex items-center justify-center gap-2 text-sm"
                    >
                        <AlignLeft size={16} /> 
                        {initialData?.description ? "EDIT EXISTING NOTES" : "ADD MARKDOWN NOTES"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                    <label className="text-tokyo-dim text-[10px] uppercase">Date</label>
                    <CustomDatePicker 
                        value={formData.date} 
                        onChange={(newDate) => setFormData({...formData, date: newDate})} 
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-tokyo-dim text-[10px] uppercase">Recurrence</label>
                    <select className="bg-tokyo-surface/50 border border-tokyo-highlight p-2 text-tokyo-text outline-none"
                        value={formData.repeats} onChange={e => setFormData({...formData, repeats: e.target.value})} >
                        <option value="none">One Time</option>
                        <option value="weekly">Weekly</option>
                    </select>
                </div>
            </div>

            <div className="flex gap-4">
                <div className="flex-1 flex flex-col gap-1">
                    <label className="text-tokyo-dim text-[10px] uppercase">Start Time</label>
                    <CustomTimePicker 
                        value={formData.startTime}
                        onChange={(val) => setFormData({...formData, startTime: val})}
                    />
                </div>

                {formData.type === 'event' && (
                    <div className="flex-1 flex flex-col gap-1">
                        <label className="text-tokyo-dim text-[10px] uppercase">End Time</label>
                        <CustomTimePicker 
                            value={formData.endTime}
                            onChange={(val) => setFormData({...formData, endTime: val})}
                        />
                    </div>
                )}
            </div>

            <div className="flex gap-2">
                {Object.keys(colorMap).map(c => (
                    <button key={c} onClick={() => setFormData({...formData, color: c})}
                    className={`w-6 h-6 rounded border-2 ${formData.color === c ? 'border-white' : 'border-transparent'} ${colorMap[c]}`}></button>
                ))}
            </div>

            <div className="pt-4 flex justify-between gap-2 border-t border-tokyo-highlight mt-2">
                {initialData ? (
                    <button onClick={() => onDelete(initialData.id)} className="px-4 py-2 text-tokyo-red hover:bg-tokyo-red/10 border border-tokyo-red/50 rounded flex items-center gap-2">
                        <Trash2 size={14} /> DELETE
                    </button>
                ) : <div></div>}

                <div className="flex gap-2">
                    <button onClick={onClose} className="px-4 py-2 text-tokyo-dim hover:text-tokyo-text text-xs">[ ESC to Cancel ]</button>
                    <button onClick={handleSubmit} className="px-4 py-2 bg-tokyo-cyan text-tokyo-base font-bold hover:brightness-110 flex items-center gap-2">
                        <Save size={14} /> SAVE
                    </button>
                </div>
            </div>

        </div>
      </div>
    </div>
  )
}

export default EventModal