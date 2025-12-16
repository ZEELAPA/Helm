import React from 'react'
import { CheckSquare, Square, Edit2, FileText, List, Calendar as CalIcon } from 'lucide-react' 
import CommandBar from './CommandBar'

const TaskItem = ({ task, onToggle, onEdit, onOpenScratchpad }) => {
    const safeTitle = task?.title || "Untitled Task"
    
    const rawColor = task?.color || "purple"
    const safeColor = String(rawColor).toLowerCase() 
    
    
    // Helper to format date safely
    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        try {
            return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        } catch (e) {
            return ""
        }
    }

    return (
        <div 
            onDoubleClick={() => onEdit(task)} 
            className="group flex items-center gap-3 hover:bg-tokyo-highlight/10 rounded transition-colors pr-2 cursor-pointer select-none py-1"
        >
            {/* CHECKBOX */}
            <div 
                onClick={(e) => e.stopPropagation()} 
                onDoubleClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={() => onToggle(task.id)}
                    className={`transition-colors ${task.done ? 'text-tokyo-dim' : `text-tokyo-${safeColor}`}`}
                >
                    {task.done ? <CheckSquare size={16} /> : <Square size={16} />}
                </button>
            </div>

            {/* CONTENT */}
            <div className="flex-1 flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                    <span className={`text-sm truncate ${task.done ? 'line-through text-tokyo-dim' : 'text-tokyo-text'}`}>
                        {safeTitle}
                    </span>
                    
                    {/* NEW: PROJECT BADGE */}
                    {task.project && (
                        <span className="text-[9px] font-bold border border-tokyo-dim/30 bg-tokyo-surface text-tokyo-cyan px-1 rounded uppercase tracking-wider">
                            {task.project}
                        </span>
                    )}
                </div>
                
                {/* DATE/TIME INFO */}
                <span className="text-[10px] text-tokyo-dim flex gap-2">
                    {formatDate(task.date)} 
                    {task.startTime && ` • ${task.startTime}`}
                </span>
            </div>

            {/* ACTION BUTTONS */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button 
                    onClick={(e) => {
                        e.stopPropagation()
                        onOpenScratchpad(task)
                    }}
                    className={`p-1 rounded hover:bg-tokyo-purple/20 ${task.description ? 'text-tokyo-purple' : 'text-tokyo-dim hover:text-tokyo-text'}`}
                    title="Open Notes"
                >
                    <FileText size={14} />
                </button>

                <button 
                    onClick={(e) => {
                        e.stopPropagation()
                        onEdit(task)
                    }}
                    className="p-1 hover:bg-tokyo-cyan/20 text-tokyo-dim hover:text-tokyo-cyan rounded"
                >
                    <Edit2 size={14} />
                </button>
            </div>
        </div>
    )
}

const JournalSidebar = ({ tasks, onAddTask, onToggleTask, onEditTask, onOpenScratchpad, viewMode, onToggleMode }) => { 
  return (
    // FIX: Removed the nested w-[35%] div that was breaking layout.
    // The sidebar now fills the Grid Area defined in App.jsx
    <div className="h-full bg-tokyo-surface/20 rounded-lg border border-tokyo-highlight flex flex-col backdrop-blur-sm overflow-hidden">
        
        {/* HEADER */}
        <div className="p-3 border-b border-tokyo-highlight flex justify-between items-center bg-tokyo-surface/50">
            <h2 className="text-tokyo-cyan font-bold tracking-widest flex items-center gap-2 text-xs">
                {viewMode === 'daily' ? 'JOURNAL' : 'MASTER LIST'}
            </h2>
            
            {/* TOGGLE BUTTON */}
            <button 
                onClick={() => onToggleMode(viewMode === 'daily' ? 'all' : 'daily')}
                className="text-[10px] flex items-center gap-2 bg-tokyo-base px-2 py-1 rounded border border-tokyo-highlight hover:border-tokyo-cyan transition text-tokyo-text"
                title={viewMode === 'daily' ? "Switch to All Tasks" : "Switch to Daily View"}
            >
                {viewMode === 'daily' ? (
                    <> <List size={10} /> ALL </>
                ) : (
                    <> <CalIcon size={10} /> DAILY </>
                )}
            </button>
        </div>
        
        {/* TASK LIST */}
        <div className="flex-1 overflow-y-auto p-2 custom-scrollbar flex flex-col gap-1">
            {tasks.map(task => (
                <TaskItem 
                    key={task.id} 
                    task={task} 
                    onToggle={onToggleTask}
                    onEdit={onEditTask}
                    onOpenScratchpad={onOpenScratchpad} 
                />
            ))}
            {tasks.length === 0 && (
                <div className="text-center text-tokyo-dim text-xs mt-10 italic opacity-50">
                    No tasks found...
                </div>
            )}
        </div>

        {/* INPUT */}
        <CommandBar onAddTask={onAddTask} />
    </div>
  )
}

export default JournalSidebar