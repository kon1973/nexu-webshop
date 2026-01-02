'use client'

import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

export default function CountdownTimer({ targetDate }: { targetDate: Date | string }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date()
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  if (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0) {
    return null
  }

  return (
    <div className="flex items-center gap-4 bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 animate-in fade-in slide-in-from-top-2">
      <div className="flex items-center gap-2 text-red-400 font-bold uppercase tracking-wider text-sm">
        <Clock size={18} className="animate-pulse" />
        Az akció lejár:
      </div>
      <div className="flex gap-2 text-white font-mono font-bold text-lg">
        {timeLeft.days > 0 && (
          <>
            <div className="bg-[#121212] px-2 py-1 rounded border border-white/10 min-w-[40px] text-center">
              {String(timeLeft.days).padStart(2, '0')}
              <span className="text-[10px] text-gray-500 block font-sans font-normal uppercase">nap</span>
            </div>
            <span className="self-start mt-1">:</span>
          </>
        )}
        <div className="bg-[#121212] px-2 py-1 rounded border border-white/10 min-w-[40px] text-center">
          {String(timeLeft.hours).padStart(2, '0')}
          <span className="text-[10px] text-gray-500 block font-sans font-normal uppercase">óra</span>
        </div>
        <span className="self-start mt-1">:</span>
        <div className="bg-[#121212] px-2 py-1 rounded border border-white/10 min-w-[40px] text-center">
          {String(timeLeft.minutes).padStart(2, '0')}
          <span className="text-[10px] text-gray-500 block font-sans font-normal uppercase">perc</span>
        </div>
        <span className="self-start mt-1">:</span>
        <div className="bg-[#121212] px-2 py-1 rounded border border-white/10 min-w-[40px] text-center">
          {String(timeLeft.seconds).padStart(2, '0')}
          <span className="text-[10px] text-gray-500 block font-sans font-normal uppercase">mp</span>
        </div>
      </div>
    </div>
  )
}
