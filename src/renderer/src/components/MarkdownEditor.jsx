import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { PenTool, Eye } from 'lucide-react'

const MarkdownEditor = ({ value, onChange, placeholder }) => {
  const [mode, setMode] = useState('write') // 'write' or 'read'

  return (
    <div className="flex flex-col h-full border border-tokyo-highlight bg-tokyo-surface/20 rounded overflow-hidden">
      
      {/* Toolbar */}
      <div className="flex items-center gap-1 bg-tokyo-surface/50 p-1 border-b border-tokyo-highlight">
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

      {/* Content Area */}
      <div className="flex-1 relative min-h-[150px]">
        {mode === 'write' ? (
            <textarea 
                className="w-full h-full bg-transparent p-3 text-sm font-mono text-tokyo-text outline-none resize-none placeholder-tokyo-dim/50"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder || "# Notes\n- item 1..."}
            />
        ) : (
            <div className="w-full h-full p-3 overflow-y-auto prose prose-invert prose-sm max-w-none custom-scrollbar">
                {/* We map HTML elements to Tailwind classes to match your theme */}
                <ReactMarkdown
                    components={{
                        h1: ({node, ...props}) => <h1 className="text-lg font-bold text-tokyo-cyan mb-2 border-b border-tokyo-highlight pb-1" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-md font-bold text-tokyo-blue mb-2 mt-4" {...props} />,
                        p: ({node, ...props}) => <p className="mb-2 text-tokyo-text text-sm" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2 text-tokyo-text/80" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2 text-tokyo-text/80" {...props} />,
                        li: ({node, ...props}) => <li className="mb-1" {...props} />,
                        code: ({node, inline, ...props}) => (
                            inline 
                            ? <code className="bg-black/30 text-tokyo-orange px-1 rounded font-mono text-xs" {...props} />
                            : <code className="block bg-black/30 text-tokyo-text p-2 rounded font-mono text-xs my-2 whitespace-pre-wrap" {...props} />
                        ),
                        blockquote: ({node, ...props}) => <blockquote className="border-l-2 border-tokyo-purple pl-3 italic text-tokyo-dim my-2" {...props} />
                    }}
                >
                    {value || "*No content*"}
                </ReactMarkdown>
            </div>
        )}
      </div>
    </div>
  )
}

export default MarkdownEditor