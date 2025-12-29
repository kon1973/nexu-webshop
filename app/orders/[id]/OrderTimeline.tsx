'use client'

import { Check, Clock, Package, Truck } from 'lucide-react'

type OrderStatus = 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled'

const STEPS = [
  { id: 'pending', label: 'Rendelés leadva', icon: Clock },
  { id: 'paid', label: 'Fizetve / Feldolgozás alatt', icon: Check },
  { id: 'shipped', label: 'Szállítás alatt', icon: Truck },
  { id: 'completed', label: 'Kézbesítve', icon: Package },
]

export default function OrderTimeline({ status, createdAt }: { status: string, createdAt: Date }) {
  if (status === 'cancelled') {
    return (
      <div className="w-full bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center mb-8">
        <p className="text-red-500 font-bold">A rendelés törölve lett.</p>
      </div>
    )
  }

  const currentStepIndex = STEPS.findIndex(s => s.id === status)
  // If status is not found (e.g. custom status), default to 0
  const activeIndex = currentStepIndex === -1 ? 0 : currentStepIndex

  return (
    <div className="w-full py-6 mb-8">
      <div className="relative flex justify-between items-center w-full max-w-3xl mx-auto">
        {/* Progress Bar Background */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -translate-y-1/2 z-0" />
        
        {/* Active Progress Bar */}
        <div 
          className="absolute top-1/2 left-0 h-1 bg-purple-600 -translate-y-1/2 z-0 transition-all duration-500"
          style={{ width: `${(activeIndex / (STEPS.length - 1)) * 100}%` }}
        />

        {STEPS.map((step, index) => {
          const isActive = index <= activeIndex
          const isCurrent = index === activeIndex
          const Icon = step.icon

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isActive 
                    ? 'bg-[#0a0a0a] border-purple-600 text-purple-500 shadow-[0_0_15px_rgba(147,51,234,0.5)]' 
                    : 'bg-[#0a0a0a] border-white/10 text-gray-600'
                }`}
              >
                <Icon size={18} />
              </div>
              <p className={`text-xs font-medium absolute -bottom-8 w-32 text-center ${
                isActive ? 'text-white' : 'text-gray-600'
              }`}>
                {step.label}
              </p>
              {index === 0 && (
                <p className="text-[10px] text-gray-500 absolute -bottom-12 w-32 text-center">
                  {new Date(createdAt).toLocaleDateString('hu-HU')}
                </p>
              )}
            </div>
          )
        })}
      </div>
      <div className="h-12" /> {/* Spacer for labels */}
    </div>
  )
}
