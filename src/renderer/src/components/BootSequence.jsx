import React, { useState, useEffect } from 'react'

const BootSequence = ({ onComplete }) => {
  const [lines, setLines] = useState([])
  
  const script = [
    { text: "> KERNEL_INIT...", delay: 200 },
    { text: "> MOUNTING_VIRTUAL_DRIVE [====================] 100%", delay: 600 },
    { text: "> CHECKING_INTEGRITY...", delay: 900 },
    { text: "> LOADING_USER_PROFILE...", delay: 1400 },
    { text: "> CONNECTING_DB_SERVICE...", delay: 1800 },
    { text: "> SYSTEM_READY.", delay: 2400 },
  ]

  useEffect(() => {
    let timeouts = []
    
    // Schedule each line
    script.forEach(({ text, delay }) => {
      const timeout = setTimeout(() => {
        setLines(prev => [...prev, text])
      }, delay)
      timeouts.push(timeout)
    })

    // Finish sequence
    const endTimeout = setTimeout(() => {
      onComplete()
    }, 3000)
    timeouts.push(endTimeout)

    return () => timeouts.forEach(clearTimeout)
  }, [])

  return (
    <div className="h-screen w-screen bg-[#0a0a0f] text-tokyo-green font-mono p-8 flex flex-col justify-end pb-20 select-none z-[100] relative">
      <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none"></div>
      
      {lines.map((line, i) => (
        <div key={i} className="mb-2 text-sm md:text-base opacity-90 drop-shadow-[0_0_5px_rgba(115,218,170,0.8)]">
          {line}
        </div>
      ))}
      <div className="text-tokyo-cyan animate-pulse mt-2">_</div>
    </div>
  )
}

export default BootSequence