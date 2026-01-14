import React, { useState, useEffect } from 'react'
import { 
    X, Save, Calendar, Trash2, Repeat, BellRing, 
    Link, Video, Folder, MessageCircle, Globe, Plus, ExternalLink,
    BookOpen, History, AlignLeft, ArrowRight, Settings, Layout, FileText
} from 'lucide-react'
import { format, subMinutes } from 'date-fns'
import { CustomDatePicker, CustomTimePicker } from './CustomInputs'

const EventModal = ({ selectedDate, initialData, onSave, onClose, onDelete, onOpenScratchpad, notebooks = [] }) => {
  const defaultState = {
    title: '',
    type: 'event',
    date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    startTime: '09:00',
    endTime: '10:00',
    description: '',
    repeats: 'none',
    repeatStart: '',
    repeatEnd: '',
    color: 'green',
    project: '',
    notificationOffset: 'none',
    notifyAt: null,
    hasBeenNotified: false,
    resources: [] 
  }

  const [formData, setFormData] = useState(defaultState)
  const [activeTab, setActiveTab] = useState('main') // 'main' | 'content' | 'config' | 'history'
  const [notebookDate, setNotebookDate] = useState(defaultState.date)

  useEffect(() => {
    if (initialData) {
        const initDate = initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : defaultState.date
        setFormData({
            ...defaultState,
            ...initialData,
            date: initDate,
            repeatStart: initialData.repeatStart || '',
            repeatEnd: initialData.repeatEnd || '',
            notificationOffset: initialData.notificationOffset || 'none',
            resources: initialData.resources || [] 
        })
        setNotebookDate(initDate)
    }
  }, [initialData])

  // --- LOGIC HELPERS ---
  const addResource = () => { setFormData(prev => ({ ...prev, resources: [...prev.resources, { id: Date.now(), label: '', url: '' }] })) }
  const updateResource = (index, field, value) => { const updated = [...formData.resources]; updated[index][field] = value; setFormData(prev => ({ ...prev, resources: updated })) }
  const removeResource = (index) => { const updated = formData.resources.filter((_, i) => i !== index); setFormData(prev => ({ ...prev, resources: updated })) }
  
  const getSmartIcon = (url) => {
      const lower = url.toLowerCase()
      if (lower.includes('meet.google') || lower.includes('zoom') || lower.includes('teams')) return <Video size={14} />
      if (lower.includes('drive') || lower.includes('dropbox') || lower.includes('docs')) return <Folder size={14} />
      if (lower.includes('discord') || lower.includes('slack') || lower.includes('messenger')) return <MessageCircle size={14} />
      return <Globe size={14} />
  }

  const isRepeatingClass = formData.repeats === 'weekly';

  const handleOpenNotebook = (targetDateString) => {
      if (!initialData?.id) { alert("Please save the event first."); return }
      const notebookId = `${initialData.id}_${targetDateString}`
      const existingNote = notebooks.find(n => n.id === notebookId)
      const template = `# Class: ${formData.title}\n## Date: ${targetDateString}\n\n### 📝 Key Concepts\n- \n\n### 🏠 Homework / Actions\n- [ ] `
      
      onOpenScratchpad({
          id: notebookId, 
          title: `${formData.title} (${targetDateString})`,
          description: existingNote ? existingNote.content : template
      })
  }

  const historyList = isRepeatingClass && initialData?.id 
    ? notebooks.filter(n => n.id.startsWith(`${initialData.id}_`)).sort((a,b) => b.id.localeCompare(a.id))
    : []

  const handleSubmit = () => {
    if (!formData.title) return
    const dateObj = new Date(formData.date)
    const dayOfWeek = dateObj.getDay()
    
    let finalNotifyAt = null;
    if (formData.notificationOffset !== 'none') {
        const [h, m] = formData.startTime.split(':').map(Number);
        const taskDateTime = new Date(formData.date);
        taskDateTime.setHours(h, m, 0, 0);
        const offset = parseInt(formData.notificationOffset);
        finalNotifyAt = subMinutes(taskDateTime, offset).toISOString();
    }

    const cleanData = {
        ...formData,
        id: initialData?.id,
        dayOfWeek,
        endTime: formData.type === 'task' ? null : formData.endTime,
        notifyAt: finalNotifyAt,
        hasBeenNotified: false,
        resources: formData.resources.filter(r => r.url.trim() !== '')
    }
    onSave(cleanData)
  }

  const colorMap = {
      green: 'bg-tokyo-green', teal: 'bg-tokyo-teal', cyan: 'bg-tokyo-cyan', blue: 'bg-tokyo-blue',
      purple: 'bg-tokyo-purple', magenta: 'bg-tokyo-magenta', pink: 'bg-tokyo-red', orange: 'bg-tokyo-orange', yellow: 'bg-tokyo-yellow',
  }

  const handleKeyDown = (e) => { if (e.key === 'Escape') { e.stopPropagation(); onClose() } }

  // --- TAB STYLE HELPER ---
  const TabButton = ({ id, label, icon: Icon }) => (
      <button 
        onClick={() => setActiveTab(id)}
        className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-bold uppercase transition border-b-2 
        ${activeTab === id ? 'text-tokyo-cyan border-tokyo-cyan bg-tokyo-surface/50' : 'text-tokyo-dim border-transparent hover:text-tokyo-text'}`}
      >
          <Icon size={12} /> {label}
      </button>
  )

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onKeyDown={handleKeyDown}>
      <div className="w-full max-w-md bg-tokyo-base border border-tokyo-cyan p-1 shadow-2xl flex flex-col h-auto max-h-[85vh]">
        
        {/* HEADER */}
        <div className="bg-tokyo-surface p-2 flex justify-between items-center border-b border-tokyo-highlight shrink-0">
            <h2 className="text-tokyo-cyan font-bold tracking-widest flex items-center gap-2">
                <Calendar size={14} /> {initialData ? 'EDIT ENTRY' : 'NEW ENTRY'}
            </h2>
            <button onClick={onClose} className="hover:text-tokyo-red"><X size={18} /></button>
        </div>

        {/* --- LAUNCHPAD (ALWAYS VISIBLE TOP) --- */}
        {formData.resources.length > 0 && (
            <div className="p-3 bg-tokyo-base border-b border-tokyo-highlight flex flex-wrap gap-2 shrink-0 max-h-[100px] overflow-y-auto custom-scrollbar">
                {formData.resources.map((res, i) => (
                    res.url && (
                        <a key={i} href={res.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 bg-tokyo-surface border border-tokyo-highlight hover:border-tokyo-cyan hover:shadow-[0_0_10px_rgba(125,207,255,0.2)] rounded text-xs font-bold text-tokyo-text transition group">
                            <span className="text-tokyo-cyan">{getSmartIcon(res.url)}</span>
                            {res.label || "Link"}
                            <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity text-tokyo-dim" />
                        </a>
                    )
                ))}
            </div>
        )}

        {/* --- TABS --- */}
        <div className="flex border-b border-tokyo-highlight bg-tokyo-base shrink-0">
            <TabButton id="main" label="Main" icon={Layout} />
            <TabButton id="content" label="Content" icon={FileText} />
            <TabButton id="config" label="Config" icon={Settings} />
            {isRepeatingClass && <TabButton id="history" label="History" icon={History} />}
        </div>

        {/* --- SCROLLABLE CONTENT AREA --- */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 font-mono text-sm min-h-0">
            
            {/* TAB 1: MAIN (Logistics) */}
            {activeTab === 'main' && (
                <div className="space-y-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-tokyo-dim text-[10px] uppercase">Title</label>
                        <input autoFocus className="bg-tokyo-surface/50 border border-tokyo-highlight p-2 text-tokyo-text outline-none focus:border-tokyo-cyan placeholder-tokyo-dim/30" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Enter title..." />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-tokyo-dim text-[10px] uppercase">Type</label>
                            <div className="flex bg-tokyo-surface/50 p-1 rounded border border-tokyo-highlight">
                                <button onClick={() => setFormData({...formData, type: 'event', color: 'green'})} className={`flex-1 text-[10px] uppercase py-1 rounded transition ${formData.type === 'event' ? 'bg-tokyo-highlight text-tokyo-cyan' : 'text-tokyo-dim'}`}>Event</button>
                                <button onClick={() => setFormData({...formData, type: 'task', color: 'purple'})} className={`flex-1 text-[10px] uppercase py-1 rounded transition ${formData.type === 'task' ? 'bg-tokyo-highlight text-tokyo-purple' : 'text-tokyo-dim'}`}>Task</button>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-tokyo-dim text-[10px] uppercase">Date</label>
                            <CustomDatePicker value={formData.date} onChange={(newDate) => setFormData({...formData, date: newDate})} />
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1 flex flex-col gap-1">
                            <label className="text-tokyo-dim text-[10px] uppercase">Start Time</label>
                            <CustomTimePicker value={formData.startTime} onChange={(val) => setFormData({...formData, startTime: val})} />
                        </div>
                        {formData.type === 'event' && (
                            <div className="flex-1 flex flex-col gap-1">
                                <label className="text-tokyo-dim text-[10px] uppercase">End Time</label>
                                <CustomTimePicker value={formData.endTime} onChange={(val) => setFormData({...formData, endTime: val})} />
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-tokyo-dim text-[10px] uppercase">Color Tag</label>
                        <div className="flex gap-2 flex-wrap">
                            {Object.keys(colorMap).map(c => (
                                <button key={c} onClick={() => setFormData({...formData, color: c})} className={`w-6 h-6 rounded border-2 transition-transform hover:scale-110 ${formData.color === c ? 'border-white scale-110' : 'border-transparent'} ${colorMap[c]}`} title={c}></button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: CONTENT (Notes & Links) */}
            {activeTab === 'content' && (
                <div className="space-y-4">
                    {/* Notebook Section */}
                    <div className="flex flex-col gap-1">
                        <label className="text-tokyo-dim text-[10px] uppercase">Notes / Content</label>
                        {isRepeatingClass ? (
                            <div className="flex flex-col gap-2 p-3 border border-tokyo-purple/50 bg-tokyo-purple/5 rounded">
                                <div className="flex justify-between items-center border-b border-tokyo-purple/20 pb-2 mb-1">
                                    <span className="text-[10px] text-tokyo-purple font-bold">TARGET DATE:</span>
                                    <div className="scale-90 origin-right"><CustomDatePicker value={notebookDate} onChange={setNotebookDate} /></div>
                                </div>
                                <button onClick={() => handleOpenNotebook(notebookDate)} className="w-full bg-tokyo-purple text-tokyo-base p-2 hover:brightness-110 transition flex items-center justify-center gap-2 text-xs font-bold rounded shadow-lg shadow-tokyo-purple/20">
                                    <BookOpen size={14} /> OPEN CLASS NOTEBOOK
                                </button>
                            </div>
                        ) : (
                            <button onClick={() => { if (initialData && onOpenScratchpad) { onOpenScratchpad(initialData) } else { alert("Please save first.") } }} className="w-full border border-dashed border-tokyo-highlight p-3 text-tokyo-dim hover:text-tokyo-text hover:border-tokyo-text transition flex items-center justify-center gap-2 text-sm">
                                <AlignLeft size={16} /> {initialData?.description ? "EDIT NOTES" : "ADD NOTES"}
                            </button>
                        )}
                    </div>

                    {/* Resource Manager Inputs */}
                    <div className="flex flex-col gap-2 p-3 border border-dashed border-tokyo-highlight rounded bg-tokyo-surface/20">
                        <div className="flex justify-between items-center">
                            <label className="text-tokyo-dim text-[10px] uppercase flex items-center gap-2"><Link size={12} /> Edit Resources</label>
                            <button onClick={addResource} className="text-[10px] text-tokyo-cyan hover:underline flex items-center gap-1"><Plus size={10} /> Add Link</button>
                        </div>
                        {formData.resources.length === 0 && <div className="text-[10px] text-tokyo-dim italic opacity-50">No links added yet.</div>}
                        <div className="flex flex-col gap-2">
                            {formData.resources.map((res, i) => (
                                <div key={res.id} className="flex gap-2 items-center animate-in fade-in slide-in-from-left-2">
                                    <div className="flex-1 grid grid-cols-[1fr_2fr] gap-2">
                                        <input className="bg-tokyo-base border border-tokyo-highlight p-1.5 text-xs text-tokyo-cyan placeholder-tokyo-dim focus:border-tokyo-cyan outline-none rounded" placeholder="Label" value={res.label} onChange={(e) => updateResource(i, 'label', e.target.value)} />
                                        <input className="bg-tokyo-base border border-tokyo-highlight p-1.5 text-xs text-tokyo-text placeholder-tokyo-dim focus:border-tokyo-cyan outline-none rounded" placeholder="https://..." value={res.url} onChange={(e) => updateResource(i, 'url', e.target.value)} />
                                    </div>
                                    <button onClick={() => removeResource(i)} className="text-tokyo-dim hover:text-tokyo-red transition"><Trash2 size={14} /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 3: CONFIG (Recurrence & Notifications) */}
            {activeTab === 'config' && (
                <div className="space-y-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-tokyo-dim text-[10px] uppercase">Recurrence Pattern</label>
                        <select className="bg-tokyo-surface/50 border border-tokyo-highlight p-2 text-tokyo-text outline-none w-full" value={formData.repeats} onChange={e => setFormData({...formData, repeats: e.target.value})} >
                            <option value="none">One Time</option>
                            <option value="weekly">Weekly</option>
                        </select>
                    </div>

                    {formData.repeats === 'weekly' && (
                        <div className="bg-tokyo-highlight/10 p-3 border border-tokyo-highlight rounded flex flex-col gap-3">
                            <div className="flex items-center gap-2 text-tokyo-dim text-[10px] font-bold uppercase"><Repeat size={10} /> Duration Limits (Optional)</div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1"><span className="text-[9px] text-tokyo-dim uppercase">Start Date</span><CustomDatePicker value={formData.repeatStart} onChange={(d) => setFormData({...formData, repeatStart: d})} /></div>
                                <div className="flex flex-col gap-1"><span className="text-[9px] text-tokyo-dim uppercase">End Date</span><CustomDatePicker value={formData.repeatEnd} onChange={(d) => setFormData({...formData, repeatEnd: d})} /></div>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-1 bg-tokyo-highlight/10 p-3 border border-tokyo-highlight rounded">
                        <label className="text-tokyo-dim text-[10px] uppercase flex items-center gap-2"><BellRing size={12} /> Reminder Notification</label>
                        <select className="bg-tokyo-base border border-tokyo-highlight p-2 text-tokyo-text outline-none text-xs w-full" value={formData.notificationOffset} onChange={e => setFormData({...formData, notificationOffset: e.target.value})}>
                            <option value="none">No Notification</option>
                            <option value="0">At time of event</option>
                            <option value="5">5 minutes before</option>
                            <option value="15">15 minutes before</option>
                            <option value="30">30 minutes before</option>
                            <option value="60">1 hour before</option>
                            <option value="1440">1 day before</option>
                        </select>
                    </div>
                </div>
            )}

            {/* TAB 4: HISTORY */}
            {activeTab === 'history' && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-tokyo-dim text-xs font-bold uppercase p-2 border-b border-tokyo-highlight mb-2">
                        <History size={14} /> Notebook Archives
                    </div>
                    {historyList.length === 0 ? (
                        <div className="text-center text-tokyo-dim text-xs mt-10 italic">No history notes found.</div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {historyList.map(note => {
                                const dateStr = note.id.split('_')[1] 
                                return (
                                    <button key={note.id} onClick={() => handleOpenNotebook(dateStr)} className="flex justify-between items-center bg-tokyo-surface/20 p-3 border border-tokyo-highlight hover:border-tokyo-purple hover:bg-tokyo-surface transition text-left rounded group">
                                        <span className="font-mono text-sm text-tokyo-text">{dateStr}</span>
                                        <div className="flex items-center gap-2 text-xs text-tokyo-dim group-hover:text-tokyo-purple">
                                            <span>OPEN</span> <ArrowRight size={14} />
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* FOOTER */}
        <div className="pt-3 pb-2 px-4 flex justify-between gap-2 border-t border-tokyo-highlight bg-tokyo-base shrink-0">
            {initialData ? (
                <button onClick={() => onDelete(initialData.id)} className="px-4 py-2 text-tokyo-red hover:bg-tokyo-red/10 border border-tokyo-red/50 rounded flex items-center gap-2"><Trash2 size={14} /> DELETE</button>
            ) : <div></div>}
            <div className="flex gap-2">
                <button onClick={onClose} className="px-4 py-2 text-tokyo-dim hover:text-tokyo-text text-xs">[ ESC ]</button>
                <button onClick={handleSubmit} className="px-6 py-2 bg-tokyo-cyan text-tokyo-base font-bold hover:brightness-110 flex items-center gap-2"><Save size={14} /> SAVE</button>
            </div>
        </div>

      </div>
    </div>
  )
}

export default EventModal