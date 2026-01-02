'use client'

import { useState, useRef, useEffect } from 'react'
import { X, SlidersHorizontal, ChevronDown, Check, RotateCcw, Filter } from 'lucide-react'
import { motion, AnimatePresence, useDragControls } from 'framer-motion'
import { cn } from '@/lib/utils'

interface FilterOption {
  id: string
  label: string
  count?: number
}

interface FilterSection {
  id: string
  title: string
  type: 'checkbox' | 'radio' | 'range'
  options?: FilterOption[]
  min?: number
  max?: number
  step?: number
  unit?: string
}

interface MobileFilterProps {
  sections: FilterSection[]
  activeFilters: Record<string, string[]>
  onFilterChange: (sectionId: string, values: string[]) => void
  onReset: () => void
  totalResults?: number
  className?: string
}

export default function MobileFilter({
  sections,
  activeFilters,
  onFilterChange,
  onReset,
  totalResults,
  className
}: MobileFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState<string[]>([sections[0]?.id || ''])
  const sheetRef = useRef<HTMLDivElement>(null)
  const dragControls = useDragControls()

  // Count active filters
  const activeFilterCount = Object.values(activeFilters).flat().length

  // Handle drag close
  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.y > 100) {
      setIsOpen(false)
    }
  }

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const handleOptionToggle = (sectionId: string, optionId: string, isMulti: boolean) => {
    const currentValues = activeFilters[sectionId] || []
    
    if (isMulti) {
      // Checkbox: toggle the option
      const newValues = currentValues.includes(optionId)
        ? currentValues.filter(v => v !== optionId)
        : [...currentValues, optionId]
      onFilterChange(sectionId, newValues)
    } else {
      // Radio: replace with single value
      onFilterChange(sectionId, [optionId])
    }
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'flex items-center gap-2 px-4 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-xl text-sm font-medium text-white hover:bg-white/10 transition-colors',
          activeFilterCount > 0 && 'border-purple-500/50 bg-purple-500/10',
          className
        )}
      >
        <SlidersHorizontal size={16} />
        <span>Szűrők</span>
        {activeFilterCount > 0 && (
          <span className="px-1.5 py-0.5 bg-purple-500 text-white text-xs font-bold rounded-full min-w-[20px] text-center">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Bottom sheet overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Sheet */}
            <motion.div
              ref={sheetRef}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              drag="y"
              dragControls={dragControls}
              dragConstraints={{ top: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              className="fixed bottom-0 left-0 right-0 z-50 bg-[#121212] rounded-t-3xl max-h-[85vh] flex flex-col"
            >
              {/* Drag handle */}
              <div 
                className="flex justify-center py-3 cursor-grab active:cursor-grabbing"
                onPointerDown={(e) => dragControls.start(e)}
              >
                <div className="w-10 h-1 bg-white/20 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-4 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <Filter size={20} className="text-purple-400" />
                  <div>
                    <h2 className="text-lg font-bold text-white">Szűrők</h2>
                    {totalResults !== undefined && (
                      <p className="text-xs text-gray-500">{totalResults} találat</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {activeFilterCount > 0 && (
                    <button
                      onClick={onReset}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 hover:text-white transition-colors"
                    >
                      <RotateCcw size={12} />
                      Törlés
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <X size={18} className="text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Filter sections */}
              <div className="flex-1 overflow-y-auto overscroll-contain">
                {sections.map((section) => (
                  <div key={section.id} className="border-b border-white/5">
                    {/* Section header */}
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                    >
                      <span className="font-medium text-white">{section.title}</span>
                      <div className="flex items-center gap-2">
                        {(activeFilters[section.id]?.length || 0) > 0 && (
                          <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                            {activeFilters[section.id].length}
                          </span>
                        )}
                        <ChevronDown
                          size={16}
                          className={cn(
                            'text-gray-500 transition-transform',
                            expandedSections.includes(section.id) && 'rotate-180'
                          )}
                        />
                      </div>
                    </button>

                    {/* Section content */}
                    <AnimatePresence>
                      {expandedSections.includes(section.id) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4">
                            {section.type === 'range' ? (
                              <RangeFilter
                                min={section.min || 0}
                                max={section.max || 1000000}
                                step={section.step || 1000}
                                unit={section.unit || 'Ft'}
                                values={activeFilters[section.id] || []}
                                onChange={(values) => onFilterChange(section.id, values)}
                              />
                            ) : (
                              <div className="space-y-1">
                                {section.options?.map((option) => {
                                  const isSelected = activeFilters[section.id]?.includes(option.id)
                                  const isMulti = section.type === 'checkbox'
                                  
                                  return (
                                    <button
                                      key={option.id}
                                      onClick={() => handleOptionToggle(section.id, option.id, isMulti)}
                                      className={cn(
                                        'w-full flex items-center gap-3 p-3 rounded-xl transition-colors',
                                        isSelected 
                                          ? 'bg-purple-500/10 border border-purple-500/20' 
                                          : 'hover:bg-white/5'
                                      )}
                                    >
                                      {/* Checkbox/Radio indicator */}
                                      <div className={cn(
                                        'w-5 h-5 rounded flex items-center justify-center border transition-colors',
                                        isMulti ? 'rounded' : 'rounded-full',
                                        isSelected 
                                          ? 'bg-purple-500 border-purple-500' 
                                          : 'border-white/20'
                                      )}>
                                        {isSelected && <Check size={12} className="text-white" />}
                                      </div>
                                      
                                      <span className={cn(
                                        'flex-1 text-left text-sm',
                                        isSelected ? 'text-white' : 'text-gray-400'
                                      )}>
                                        {option.label}
                                      </span>
                                      
                                      {option.count !== undefined && (
                                        <span className="text-xs text-gray-600">
                                          ({option.count})
                                        </span>
                                      )}
                                    </button>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              {/* Apply button */}
              <div className="p-4 border-t border-white/10 bg-[#121212]">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-colors"
                >
                  {totalResults !== undefined 
                    ? `${totalResults} találat megtekintése`
                    : 'Szűrők alkalmazása'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

// Range filter component
function RangeFilter({
  min,
  max,
  step,
  unit,
  values,
  onChange
}: {
  min: number
  max: number
  step: number
  unit: string
  values: string[]
  onChange: (values: string[]) => void
}) {
  const [localMin, setLocalMin] = useState(values[0] ? parseInt(values[0]) : min)
  const [localMax, setLocalMax] = useState(values[1] ? parseInt(values[1]) : max)

  const handleCommit = () => {
    onChange([localMin.toString(), localMax.toString()])
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label className="text-xs text-gray-500 mb-1 block">Minimum</label>
          <input
            type="number"
            value={localMin}
            onChange={(e) => setLocalMin(Number(e.target.value))}
            onBlur={handleCommit}
            min={min}
            max={localMax}
            step={step}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:border-purple-500 focus:outline-none"
          />
        </div>
        <div className="text-gray-600 pt-5">—</div>
        <div className="flex-1">
          <label className="text-xs text-gray-500 mb-1 block">Maximum</label>
          <input
            type="number"
            value={localMax}
            onChange={(e) => setLocalMax(Number(e.target.value))}
            onBlur={handleCommit}
            min={localMin}
            max={max}
            step={step}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:border-purple-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Visual range slider */}
      <div className="relative h-2 bg-white/10 rounded-full">
        <div
          className="absolute h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
          style={{
            left: `${((localMin - min) / (max - min)) * 100}%`,
            right: `${100 - ((localMax - min) / (max - min)) * 100}%`
          }}
        />
      </div>

      <div className="flex justify-between text-xs text-gray-500">
        <span>{min.toLocaleString('hu-HU')} {unit}</span>
        <span>{max.toLocaleString('hu-HU')} {unit}</span>
      </div>
    </div>
  )
}
