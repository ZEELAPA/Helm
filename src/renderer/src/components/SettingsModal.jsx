import React from 'react'
import { X, Upload, Music, Trash2 } from 'lucide-react'

const SettingsModal = ({ settings, onSave, onClose }) => {
  // Local state for the form
  const [formData, setFormData] = React.useState(settings)

  // --- FILE HANDLER: Converts Audio to Base64 String ---
  const handleAudioUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Limit size to 2MB to prevent DB bloating
    if (file.size > 2 * 1024 * 1024) {
        alert("File too large! Please choose a sound under 2MB.")
        return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
        const base64String = event.target.result
        setFormData(prev => ({ ...prev, customSound: base64String }))
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveSound = () => {
      setFormData(prev => ({ ...prev, customSound: null }))
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-tokyo-base border border-tokyo-purple p-6 w-[400px] shadow-2xl rounded-lg">
        
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-tokyo-cyan font-bold text-lg flex items-center gap-2">
                <Music /> SYSTEM SETTINGS
            </h2>
            <button onClick={onClose}><X /></button>
        </div>

        <div className="flex flex-col gap-4">
            {/* EXISTING INPUTS (Duration, etc) */}
            <div className="flex flex-col gap-1">
                <label className="text-xs uppercase text-tokyo-dim">Focus Duration (mins)</label>
                <input 
                    type="number" 
                    className="bg-tokyo-surface p-2 rounded text-tokyo-text outline-none focus:border focus:border-tokyo-purple"
                    value={formData.focusDuration}
                    onChange={e => setFormData({...formData, focusDuration: parseInt(e.target.value)})}
                />
            </div>
            
            <div className="flex flex-col gap-1">
                <label className="text-xs uppercase text-tokyo-dim">Break Duration (mins)</label>
                <input 
                    type="number" 
                    className="bg-tokyo-surface p-2 rounded text-tokyo-text outline-none focus:border focus:border-tokyo-purple"
                    value={formData.breakDuration}
                    onChange={e => setFormData({...formData, breakDuration: parseInt(e.target.value)})}
                />
            </div>

            {/* --- NEW: AUDIO UPLOAD SECTION --- */}
            <div className="flex flex-col gap-2 mt-2 border-t border-tokyo-highlight pt-4">
                <label className="text-xs uppercase text-tokyo-dim">Notification Sound</label>
                
                <div className="flex items-center gap-2">
                    <label className="flex-1 cursor-pointer bg-tokyo-surface hover:bg-tokyo-highlight transition p-2 rounded border border-dashed border-tokyo-dim flex items-center justify-center gap-2 text-xs text-tokyo-text">
                        <Upload size={14} />
                        {formData.customSound ? "Change Sound File" : "Upload Custom MP3"}
                        <input 
                            type="file" 
                            accept="audio/mp3,audio/wav" 
                            className="hidden" 
                            onChange={handleAudioUpload}
                        />
                    </label>

                    {formData.customSound && (
                        <button 
                            onClick={handleRemoveSound}
                            className="p-2 bg-tokyo-red/20 text-tokyo-red rounded hover:bg-tokyo-red/40"
                            title="Reset to Default"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
                
                {formData.customSound && (
                    <div className="text-[10px] text-tokyo-green flex items-center gap-1">
                        <Music size={10} /> Custom sound loaded
                    </div>
                )}
            </div>
        </div>

        <div className="flex justify-end mt-6">
            <button 
                onClick={() => onSave(formData)}
                className="bg-tokyo-purple text-tokyo-base font-bold px-6 py-2 rounded hover:brightness-110"
            >
                SAVE CONFIG
            </button>
        </div>

      </div>
    </div>
  )
}

export default SettingsModal