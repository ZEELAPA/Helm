import { useEffect } from 'react'

export const useKeyboard = (keyMap) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // 1. Ignore if user is typing in an input/textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
        // Allow ESC to escape inputs
        if (e.key === 'Escape') {
            document.activeElement.blur()
        }
        return
      }

      // 2. Check for modifiers + keys
      const combo = [
        e.ctrlKey || e.metaKey ? 'REQ_CTRL' : null,
        e.shiftKey ? 'REQ_SHIFT' : null,
        e.key.toLowerCase()
      ].filter(Boolean).join('+')

      // 3. Execute matching handler
      // We map "ctrl+1" or just "a"
      const action = keyMap[combo] || keyMap[e.key.toLowerCase()]
      
      if (action) {
        e.preventDefault()
        action()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [keyMap])
}