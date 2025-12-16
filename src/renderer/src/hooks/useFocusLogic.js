import { useState, useEffect, useRef } from 'react'

export const useFocusLogic = (defaultDuration = 25, breakDuration = 5, onFinish) => {
    const timerRef = useRef(null)
    const finishLock = useRef(false) // <--- FIX 1: The Lock
    
    // State
    const [totalBank, setTotalBank] = useState(defaultDuration * 60)
    const [currentSlice, setCurrentSlice] = useState(defaultDuration * 60)
    const [isActive, setIsActive] = useState(false)
    const [mode, setMode] = useState('FOCUS') 
    const [activeTask, setActiveTask] = useState(null)

    // --- FIX 2: Settings Listener ---
    // If settings change while paused, update the timer immediately
    useEffect(() => {
        if (!isActive && mode === 'FOCUS') {
            setTotalBank(defaultDuration * 60)
            setCurrentSlice(defaultDuration * 60)
        }
    }, [defaultDuration])

    // --- LOGIC: The Ticker ---
    useEffect(() => {
        if (isActive && currentSlice > 0) {
            timerRef.current = setInterval(() => {
                setCurrentSlice(prev => prev - 1)
                setTotalBank(prev => Math.max(0, prev - 1))
            }, 1000)
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [isActive, currentSlice > 0]) 

    // --- LOGIC: The Finish Checker ---
    useEffect(() => {
        // Only run if we hit 0 AND we aren't locked
        if (currentSlice === 0 && isActive && !finishLock.current) {
            finishLock.current = true // LOCK IT IMMEDIATELY
            handleSliceFinish()
            
            // Unlock after 1 second (prevents double/triple firing)
            setTimeout(() => {
                finishLock.current = false
            }, 1000)
        }
    }, [currentSlice, isActive])


    const startCustomSession = (minutes) => {
        setIsActive(false)
        setMode('FOCUS')
        setTotalBank(minutes * 60)
        setCurrentSlice(minutes * 60)
        setIsActive(true)
    }

    const handleSliceFinish = () => {
        if (timerRef.current) clearInterval(timerRef.current)
        setIsActive(false)
        
        // This will now only run ONCE
        if (onFinish) onFinish();
        
        if (totalBank <= 0) return 

        // Auto-switch modes
        if (mode === 'FOCUS') {
            setMode('BREAK')
            setCurrentSlice(Math.min(totalBank, breakDuration * 60))
        } else {
            setMode('FOCUS')
            setCurrentSlice(Math.min(totalBank, defaultDuration * 60))
        }
        setIsActive(true) 
    }

    // --- CONTROLS ---
    const toggleTimer = () => setIsActive(!isActive)
    
    const adjustBank = (amount) => {
        if (isActive) return
        setTotalBank(prev => Math.max(60, prev + amount))
    }

    const resetSession = () => {
        setIsActive(false)
        setMode('FOCUS')
        setTotalBank(defaultDuration * 60)
        setCurrentSlice(defaultDuration * 60)
    }

    const startSession = (task) => {
        setActiveTask(task)
        if (totalBank <= 0) resetSession()
    }

    return {
        totalBank,
        currentSlice,
        isActive,
        mode,
        activeTask,
        toggleTimer,
        adjustBank,
        resetSession,
        startSession,
        startCustomSession
    }
}