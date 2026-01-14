import React, { useState } from 'react'
import { X, Upload, Music, Trash2, Image, Monitor, Bell, Timer} from 'lucide-react'

const SettingsModal = ({ settings, onSave, onClose }) => {
  const [formData, setFormData] = useState(settings)
  const [tab, setTab] = useState('general') // 'general' or 'appearance'

  const handleAudioUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
        alert("File too large! Please choose a sound under 2MB.")
        return
    }
    const reader = new FileReader()
    reader.onload = (event) => setFormData(prev => ({ ...prev, customSound: event.target.result }))
    reader.readAsDataURL(file)
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-tokyo-base border border-tokyo-purple w-[500px] shadow-2xl rounded-lg flex flex-col overflow-hidden max-h-[80vh]">
        
        {/* Sidebar / Tabs */}
        <div className="flex border-b border-tokyo-highlight bg-tokyo-surface/50">
            <button 
                onClick={() => setTab('general')}
                className={`flex-1 p-3 text-xs font-bold uppercase tracking-wider ${tab === 'general' ? 'bg-tokyo-base text-tokyo-cyan border-b-2 border-tokyo-cyan' : 'text-tokyo-dim hover:text-tokyo-text'}`}
            >
                General
            </button>
            <button 
                onClick={() => setTab('appearance')}
                className={`flex-1 p-3 text-xs font-bold uppercase tracking-wider ${tab === 'appearance' ? 'bg-tokyo-base text-tokyo-purple border-b-2 border-tokyo-purple' : 'text-tokyo-dim hover:text-tokyo-text'}`}
            >
                Appearance
            </button>
            <button onClick={onClose} className="px-4 text-tokyo-red hover:bg-tokyo-red/10"><X size={16}/></button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
            
            {/* --- GENERAL TAB --- */}
            {tab === 'general' && (
                <div className="flex flex-col gap-6">
                    <div className="space-y-3">
                         <h3 className="text-sm font-bold text-tokyo-cyan flex items-center gap-2"><Timer size={14}/> Timer Defaults</h3>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] uppercase text-tokyo-dim">Focus (min)</label>
                                <input type="number" className="bg-tokyo-surface p-2 rounded text-tokyo-text outline-none focus:border focus:border-tokyo-purple"
                                    value={formData.focusDuration} onChange={e => setFormData({...formData, focusDuration: parseInt(e.target.value)})} />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] uppercase text-tokyo-dim">Break (min)</label>
                                <input type="number" className="bg-tokyo-surface p-2 rounded text-tokyo-text outline-none focus:border focus:border-tokyo-purple"
                                    value={formData.breakDuration} onChange={e => setFormData({...formData, breakDuration: parseInt(e.target.value)})} />
                            </div>
                        </div>
                    </div>

                     <div className="space-y-3 pt-4 border-t border-tokyo-highlight">
                        <h3 className="text-sm font-bold text-tokyo-blue flex items-center gap-2"><Bell size={14}/> Notifications</h3>
                        <label className="flex items-center gap-3 cursor-pointer bg-tokyo-surface p-3 rounded hover:bg-tokyo-highlight/20 transition">
                            <input 
                                type="checkbox" 
                                checked={formData.enableNotifications} 
                                onChange={(e) => setFormData({...formData, enableNotifications: e.target.checked})}
                                className="accent-tokyo-blue w-4 h-4"
                            />
                            <span className="text-xs">Enable System Desktop Notifications</span>
                        </label>

                        <div className="flex flex-col gap-2 mt-2">
                            <label className="text-[10px] uppercase text-tokyo-dim">Timer Sound</label>
                            <div className="flex items-center gap-2">
                                <label className="flex-1 cursor-pointer bg-tokyo-surface hover:bg-tokyo-highlight transition p-2 rounded border border-dashed border-tokyo-dim flex items-center justify-center gap-2 text-xs text-tokyo-text">
                                    <Upload size={14} /> {formData.customSound ? "Change Sound" : "Upload MP3"}
                                    <input type="file" accept="audio/mp3,audio/wav" className="hidden" onChange={handleAudioUpload}/>
                                </label>
                                {formData.customSound && <button onClick={() => setFormData({...formData, customSound: null})} className="p-2 bg-tokyo-red/20 text-tokyo-red rounded"><Trash2 size={16} /></button>}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- APPEARANCE TAB --- */}
            {tab === 'appearance' && (
                <div className="flex flex-col gap-6">
                    <div className="space-y-3">
                         <h3 className="text-sm font-bold text-tokyo-purple flex items-center gap-2"><Monitor size={14}/> Background Theme</h3>
                         
                         <div className="flex flex-col gap-2">
                            <label className="text-[10px] uppercase text-tokyo-dim">Solid Base Color</label>
                            <div className="flex gap-2">
                                <input 
                                    type="color" 
                                    value={formData.backgroundColor || '#1a1b26'} 
                                    onChange={(e) => setFormData({...formData, backgroundColor: e.target.value, backgroundImage: null})}
                                    className="h-8 w-16 bg-transparent border-none cursor-pointer"
                                />
                                <span className="text-xs self-center font-mono">{formData.backgroundColor}</span>
                            </div>
                         </div>

                         <div className="flex flex-col gap-2 pt-2">
                             <label className="text-[10px] uppercase text-tokyo-dim">Or Custom Image URL</label>
                             <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    placeholder="https://images.unsplash.com/photo..."
                                    value={formData.backgroundImage || ''}
                                    onChange={(e) => setFormData({...formData, backgroundImage: e.target.value})}
                                    className="flex-1 bg-tokyo-surface p-2 rounded text-xs text-tokyo-text outline-none border border-transparent focus:border-tokyo-purple"
                                />
                                {formData.backgroundImage && (
                                    <button onClick={() => setFormData({...formData, backgroundImage: null})} className="text-tokyo-red hover:bg-tokyo-red/10 p-2 rounded">
                                        <Trash2 size={14}/>
                                    </button>
                                )}
                             </div>
                             <p className="text-[10px] text-tokyo-dim italic">Tip: Use a dark image for best text visibility.</p>
                         </div>
                    </div>
                </div>
            )}

        </div>

        <div className="bg-tokyo-surface p-4 flex justify-end">
            <button onClick={() => onSave(formData)} className="bg-tokyo-cyan text-tokyo-base font-bold px-6 py-2 rounded hover:brightness-110">
                SAVE CHANGES
            </button>
        </div>

      </div>
    </div>
  )
}

export default SettingsModal