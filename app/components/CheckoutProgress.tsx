'use client'

import { motion } from 'framer-motion'
import { Check, ShoppingCart, MapPin, CreditCard, Package, Sparkles } from 'lucide-react'

interface Step {
  id: number
  name: string
  description: string
  icon: React.ReactNode
}

interface CheckoutProgressProps {
  currentStep: number
  completedSteps: number[]
}

const steps: Step[] = [
  { id: 1, name: 'Kosár', description: 'Termékek áttekintése', icon: <ShoppingCart size={18} /> },
  { id: 2, name: 'Szállítás', description: 'Cím megadása', icon: <MapPin size={18} /> },
  { id: 3, name: 'Fizetés', description: 'Fizetési mód', icon: <CreditCard size={18} /> },
  { id: 4, name: 'Összegzés', description: 'Rendelés véglegesítése', icon: <Package size={18} /> },
]

export default function CheckoutProgress({ currentStep, completedSteps }: CheckoutProgressProps) {
  return (
    <div className="w-full">
      {/* Desktop Progress */}
      <div className="hidden md:block">
        <div className="relative">
          {/* Progress Line Background */}
          <div className="absolute top-6 left-0 right-0 h-1 bg-white/10 rounded-full" />
          
          {/* Animated Progress Line */}
          <motion.div 
            className="absolute top-6 left-0 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
          
          {/* Steps */}
          <div className="relative flex justify-between">
            {steps.map((step, index) => {
              const isCompleted = completedSteps.includes(step.id)
              const isCurrent = currentStep === step.id
              const isPast = step.id < currentStep
              
              return (
                <div key={step.id} className="flex flex-col items-center">
                  {/* Step Circle */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isCompleted || isPast
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30'
                        : isCurrent
                          ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/30 ring-4 ring-purple-500/20'
                          : 'bg-white/10 text-gray-500 border border-white/20'
                    }`}
                  >
                    {isCompleted || isPast ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      >
                        <Check size={20} strokeWidth={3} />
                      </motion.div>
                    ) : (
                      step.icon
                    )}
                    
                    {/* Pulse animation for current step */}
                    {isCurrent && (
                      <motion.div
                        className="absolute inset-0 rounded-full bg-purple-500/30"
                        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </motion.div>
                  
                  {/* Step Info */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                    className="mt-3 text-center"
                  >
                    <p className={`font-semibold text-sm ${
                      isCurrent ? 'text-white' : isPast || isCompleted ? 'text-green-400' : 'text-gray-500'
                    }`}>
                      {step.name}
                    </p>
                    <p className={`text-xs mt-0.5 ${
                      isCurrent ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {step.description}
                    </p>
                  </motion.div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Mobile Progress */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
              {steps[currentStep - 1]?.icon}
            </div>
            <div>
              <p className="text-white font-semibold">{steps[currentStep - 1]?.name}</p>
              <p className="text-gray-400 text-xs">{steps[currentStep - 1]?.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 px-3 py-1 bg-white/10 rounded-full">
            <span className="text-purple-400 font-bold">{currentStep}</span>
            <span className="text-gray-500">/</span>
            <span className="text-gray-400">{steps.length}</span>
          </div>
        </div>
        
        {/* Mobile Progress Bar */}
        <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${(currentStep / steps.length) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute inset-y-0 left-0 bg-white/30 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${(currentStep / steps.length) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            style={{ filter: 'blur(4px)' }}
          />
        </div>
        
        {/* Step Dots */}
        <div className="flex justify-between mt-2 px-1">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`w-2 h-2 rounded-full transition-colors ${
                step.id <= currentStep ? 'bg-purple-500' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
