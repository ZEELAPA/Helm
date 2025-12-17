import React, { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { PenTool, Eye, Type, Bold, Link as LinkIcon, CaseUpper, CaseLower, MoreHorizontal } from 'lucide-react'

const MarkdownEditor = ({ value, onChange, placeholder }) => {
  const [mode, setMode] = useState('write') // 'write' or 'read'
  const textareaRef = useRef(null)
  
  // --- CONTEXT MENU STATE ---
  const [menu, setMenu] = useState({ visible: false, x: 0, y: 0 })

  // --- STATS LOGIC ---
  const getStats = (text) => {
    const clean = text || ""
    return {
        chars: clean.length,
        words: clean.trim().split(/\s+/).filter(Boolean).length
    }
  }
  const stats = getStats(value)

  // --- TEXT MANIPULATION ---
  const applyTransform = (type) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const currentText = textarea.value
    
    // If no text selected, we can't transform (except maybe inserting a link)
    if (start === end && type !== 'link') {
        setMenu({ ...menu, visible: false })
        return
    }

    const selectedText = currentText.substring(start, end)
    let newText = selectedText
    let newCursorPos = end // Where to put cursor after

    switch (type) {
        case 'uppercase':
            newText = selectedText.toUpperCase()
            break
        case 'lowercase':
            newText = selectedText.toLowerCase()
            break
        case 'titlecase':
            newText = selectedText.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
            break
        case 'bold':
            newText = `**${selectedText}**`
            newCursorPos += 4 // Account for ** **
            break
        case 'link':
            newText = `[${selectedText}](url)`
            newCursorPos += 6 // Move cursor to 'url'
            break
    }

    // Reconstruct full string
    const finalString = currentText.substring(0, start) + newText + currentText.substring(end)
    
    // Update State
    onChange(finalString)
    setMenu({ ...menu, visible: false })

    // Restore Selection/Cursor (Need timeout because React render cycle)
    setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start, start + newText.length)
    }, 0)
  }

  // --- HANDLERS ---
  const handleContextMenu = (e) => {
    e.preventDefault()
    // Show menu at mouse position
    setMenu({
        visible: true,
        x: e.clientX,
        y: e.clientY
    })
  }

  // Close menu on outside click
  useEffect(() => {
    const handleClick = () => setMenu({ ...menu, visible: false })
    if (menu.visible) window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [menu.visible])

  return (
    <div className="flex flex-col h-full border border-tokyo-highlight bg-tokyo-surface/20 rounded overflow-hidden relative">
      
      {/* 1. TOOLBAR */}
      <div className="flex items-center justify-between bg-tokyo-surface/50 p-1 border-b border-tokyo-highlight select-none">
        <div className="flex gap-1">
            <button 
                onClick={() => setMode('write')}
                className={`px-3 py-1 text-[10px] font-bold flex items-center gap-2 rounded transition ${mode === 'write' ? 'bg-tokyo-highlight text-tokyo-cyan' : 'text-tokyo-dim hover:text-tokyo-text'}`}
            >
                <PenTool size={12} /> WRITE
            </button>
            <button 
                onClick={() => setMode('read')}
                className={`px-3 py-1 text-[10px] font-bold flex items-center gap-2 rounded transition ${mode === 'read' ? 'bg-tokyo-highlight text-tokyo-purple' : 'text-tokyo-dim hover:text-tokyo-text'}`}
            >
                <Eye size={12} /> PREVIEW
            </button>
        </div>
        
        {/* Helper hint */}
        <div className="text-[10px] text-tokyo-dim pr-2 hidden md:block">
            {mode === 'write' ? 'Right-click text for options' : 'Markdown View'}
        </div>
      </div>

      {/* 2. CONTENT AREA */}
      <div className="flex-1 relative min-h-[150px]">
        {mode === 'write' ? (
            <textarea 
                ref={textareaRef}
                className="w-full h-full bg-transparent p-4 text-sm font-mono text-tokyo-text outline-none resize-none placeholder-tokyo-dim/50 custom-scrollbar leading-relaxed"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onContextMenu={handleContextMenu}
                placeholder={placeholder || "# Notes\n- item 1..."}
            />
        ) : (
            <div className="w-full h-full p-4 overflow-y-auto prose prose-invert prose-sm max-w-none custom-scrollbar">
                <ReactMarkdown
                    components={{
                        h1: ({node, ...props}) => <h1 className="text-xl font-bold text-tokyo-cyan mb-4 border-b border-tokyo-highlight pb-2" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-lg font-bold text-tokyo-blue mb-3 mt-6" {...props} />,
                        p: ({node, ...props}) => <p className="mb-4 text-tokyo-text text-sm leading-relaxed" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-4 text-tokyo-text/80" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-4 text-tokyo-text/80" {...props} />,
                        li: ({node, ...props}) => <li className="mb-1" {...props} />,
                        code: ({node, inline, ...props}) => (
                            inline 
                            ? <code className="bg-black/30 text-tokyo-orange px-1 rounded font-mono text-xs" {...props} />
                            : <code className="block bg-black/30 text-tokyo-text p-3 rounded font-mono text-xs my-4 whitespace-pre-wrap border border-tokyo-highlight" {...props} />
                        ),
                        blockquote: ({node, ...props}) => <blockquote className="border-l-2 border-tokyo-purple pl-4 italic text-tokyo-dim my-4" {...props} />,
                        a: ({node, ...props}) => <a className="text-tokyo-cyan hover:underline decoration-dashed" {...props} />
                    }}
                >
                    {value || "*No content*"}
                </ReactMarkdown>
            </div>
        )}
      </div>

      {/* 3. FOOTER STATS */}
      <div className="bg-tokyo-base border-t border-tokyo-highlight p-1 px-3 flex justify-end gap-4 text-[10px] text-tokyo-dim font-mono select-none">
         <span>CHARS: {stats.chars}</span>
         <span>WORDS: {stats.words}</span>
      </div>

      {/* 4. CUSTOM CONTEXT MENU */}
      {menu.visible && (
        <div 
            className="fixed z-[100] w-40 bg-tokyo-surface border border-tokyo-cyan shadow-xl rounded-lg py-1 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100"
            style={{ top: menu.y, left: menu.x }}
        >
            <div className="text-[9px] font-bold text-tokyo-dim px-3 py-1 uppercase tracking-wider bg-black/20">Format</div>
            
            <button onClick={() => applyTransform('bold')} className="px-3 py-2 text-xs text-left hover:bg-tokyo-highlight text-tokyo-text flex items-center gap-2">
                <Bold size={14} /> Bold
            </button>
            <button onClick={() => applyTransform('link')} className="px-3 py-2 text-xs text-left hover:bg-tokyo-highlight text-tokyo-text flex items-center gap-2">
                <LinkIcon size={14} /> Make Link
            </button>
            
            <div className="h-px bg-tokyo-highlight my-1"></div>
            <div className="text-[9px] font-bold text-tokyo-dim px-3 py-1 uppercase tracking-wider bg-black/20">Case</div>

            <button onClick={() => applyTransform('uppercase')} className="px-3 py-2 text-xs text-left hover:bg-tokyo-highlight text-tokyo-text flex items-center gap-2">
                <CaseUpper size={14} /> UPPERCASE
            </button>
            <button onClick={() => applyTransform('lowercase')} className="px-3 py-2 text-xs text-left hover:bg-tokyo-highlight text-tokyo-text flex items-center gap-2">
                <CaseLower size={14} /> lowercase
            </button>
            <button onClick={() => applyTransform('titlecase')} className="px-3 py-2 text-xs text-left hover:bg-tokyo-highlight text-tokyo-text flex items-center gap-2">
                <Type size={14} /> Title Case
            </button>
        </div>
      )}

    </div>
  )
}

export default MarkdownEditor