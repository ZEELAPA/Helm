import React, { useState } from 'react'
import { X, Save, FileText } from 'lucide-react'
import MarkdownEditor from './MarkdownEditor'

const ScratchpadModal = ({ task, onSave, onClose }) => {
  const [content, setContent] = useState(task.description || '')

  const handleSave = () => {
    onSave(task.id, content)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-8">
      <div className="w-full max-w-4xl h-[80vh] bg-tokyo-base border border-tokyo-purple p-1 shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="bg-tokyo-surface p-3 flex justify-between items-center border-b border-tokyo-highlight">
            <div className="flex flex-col">
                <h2 className="text-tokyo-purple font-bold tracking-widest flex items-center gap-2">
                    <FileText size={16} /> SCRATCHPAD
                </h2>
                <span className="text-xs text-tokyo-dim font-mono">EDITING: <b>{task.title}</b></span>
            </div>
            <button onClick={onClose} className="hover:text-tokyo-red transition"><X size={20} /></button>
        </div>

        {/* Editor Area */}
        <div className="flex-1 p-2 min-h-0 bg-tokyo-base">
            <MarkdownEditor 
                value={content}
                onChange={setContent}
                placeholder="# Start typing your notes..."
            />
        </div>

        {/* Footer */}
        <div className="bg-tokyo-surface p-3 border-t border-tokyo-highlight flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-tokyo-dim hover:text-tokyo-text transition">[ DISCARD ]</button>
            <button onClick={handleSave} className="px-6 py-2 bg-tokyo-purple text-tokyo-base font-bold hover:brightness-110 flex items-center gap-2">
                <Save size={16} /> SAVE NOTES
            </button>
        </div>

      </div>
    </div>
  )
}

export default ScratchpadModal