 'use client'

import { useState } from 'react'
import { 
  Save, 
  RotateCcw, 
  ChevronRight,
  Info,
  AlertTriangle,
  Check
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// Settings Section Component
export function SettingsSection({
  title,
  description,
  children,
  collapsible = false,
  defaultOpen = true
}: {
  title: string
  description?: string
  children: React.ReactNode
  collapsible?: boolean
  defaultOpen?: boolean
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="bg-white/5 rounded-2xl overflow-hidden">
      <button
        onClick={() => collapsible && setIsOpen(!isOpen)}
        className={cn(
          'w-full p-6 flex items-start justify-between text-left',
          collapsible && 'hover:bg-white/5 transition-colors'
        )}
        disabled={!collapsible}
      >
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {description && (
            <p className="text-sm text-gray-400 mt-1">{description}</p>
          )}
        </div>
        {collapsible && (
          <ChevronRight
            size={20}
            className={cn(
              'text-gray-500 transition-transform mt-1',
              isOpen && 'rotate-90'
            )}
          />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 space-y-4 border-t border-white/5 pt-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Settings Row Component
export function SettingsRow({
  label,
  description,
  hint,
  error,
  children,
  horizontal = true
}: {
  label: string
  description?: string
  hint?: string
  error?: string
  children: React.ReactNode
  horizontal?: boolean
}) {
  return (
    <div className={cn(
      'py-4 border-b border-white/5 last:border-b-0',
      horizontal ? 'flex items-center justify-between gap-4' : 'space-y-3'
    )}>
      <div className={cn(horizontal && 'flex-1')}>
        <label className="text-sm font-medium text-white">{label}</label>
        {description && (
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        )}
      </div>
      
      <div className={cn(horizontal ? 'flex-shrink-0' : 'w-full')}>
        {children}
        {(hint || error) && (
          <div className="mt-2 flex items-start gap-1.5">
            {error ? (
              <>
                <AlertTriangle size={12} className="text-red-400 mt-0.5" />
                <span className="text-xs text-red-400">{error}</span>
              </>
            ) : hint ? (
              <>
                <Info size={12} className="text-gray-500 mt-0.5" />
                <span className="text-xs text-gray-500">{hint}</span>
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}

// Toggle Switch Component
export function Toggle({
  checked,
  onChange,
  disabled = false,
  size = 'default'
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  size?: 'small' | 'default'
}) {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={cn(
        'relative rounded-full transition-colors',
        size === 'small' ? 'w-8 h-4' : 'w-11 h-6',
        checked ? 'bg-purple-500' : 'bg-white/10',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 bg-white rounded-full transition-transform shadow-sm',
          size === 'small' ? 'w-3 h-3' : 'w-5 h-5',
          checked 
            ? size === 'small' ? 'translate-x-4' : 'translate-x-5'
            : 'translate-x-0.5'
        )}
      />
    </button>
  )
}

// Text Input Component
export function SettingsInput({
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled = false,
  error,
  prefix,
  suffix,
  className
}: {
  type?: 'text' | 'email' | 'password' | 'number' | 'url'
  value: string | number
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  error?: boolean
  prefix?: string
  suffix?: string
  className?: string
}) {
  return (
    <div className={cn('relative flex items-center', className)}>
      {prefix && (
        <span className="absolute left-3 text-sm text-gray-500">{prefix}</span>
      )}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          'w-full px-4 py-2 bg-white/5 border rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 transition-colors',
          error ? 'border-red-500 focus:ring-red-500/50' : 'border-white/10 focus:ring-purple-500/50',
          prefix && 'pl-8',
          suffix && 'pr-8',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      />
      {suffix && (
        <span className="absolute right-3 text-sm text-gray-500">{suffix}</span>
      )}
    </div>
  )
}

// Select Component
export function SettingsSelect({
  value,
  onChange,
  options,
  disabled = false,
  placeholder,
  className
}: {
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string; disabled?: boolean }>
  disabled?: boolean
  placeholder?: string
  className?: string
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      className={cn(
        'px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-colors appearance-none cursor-pointer',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {placeholder && (
        <option value="" disabled>{placeholder}</option>
      )}
      {options.map(opt => (
        <option key={opt.value} value={opt.value} disabled={opt.disabled}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}

// Textarea Component
export function SettingsTextarea({
  value,
  onChange,
  placeholder,
  rows = 4,
  disabled = false,
  error,
  maxLength,
  className
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  disabled?: boolean
  error?: boolean
  maxLength?: number
  className?: string
}) {
  return (
    <div className={cn('relative', className)}>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        maxLength={maxLength}
        className={cn(
          'w-full px-4 py-3 bg-white/5 border rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 transition-colors resize-none',
          error ? 'border-red-500 focus:ring-red-500/50' : 'border-white/10 focus:ring-purple-500/50',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      />
      {maxLength && (
        <span className="absolute bottom-2 right-3 text-xs text-gray-500">
          {value.length}/{maxLength}
        </span>
      )}
    </div>
  )
}

// Color Picker Component
export function SettingsColorPicker({
  value,
  onChange,
  presets = [],
  disabled = false
}: {
  value: string
  onChange: (value: string) => void
  presets?: string[]
  disabled?: boolean
}) {
  const defaultPresets = [
    '#a855f7', '#3b82f6', '#22c55e', '#eab308', '#ef4444', '#f97316', '#ec4899', '#14b8a6'
  ]
  const colors = presets.length > 0 ? presets : defaultPresets

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5">
        {colors.map(color => (
          <button
            key={color}
            onClick={() => !disabled && onChange(color)}
            disabled={disabled}
            className={cn(
              'w-6 h-6 rounded-full transition-transform hover:scale-110',
              value === color && 'ring-2 ring-white ring-offset-2 ring-offset-[#0a0a0a]',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      
      <div className="relative">
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
        <div 
          className="w-6 h-6 rounded-full border-2 border-dashed border-white/20"
          style={{ backgroundColor: value }}
        />
      </div>
    </div>
  )
}

// Radio Group Component
export function SettingsRadioGroup({
  value,
  onChange,
  options,
  disabled = false,
  orientation = 'horizontal'
}: {
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string; description?: string }>
  disabled?: boolean
  orientation?: 'horizontal' | 'vertical'
}) {
  return (
    <div className={cn(
      'flex gap-3',
      orientation === 'vertical' ? 'flex-col' : 'flex-wrap'
    )}>
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => !disabled && onChange(opt.value)}
          disabled={disabled}
          className={cn(
            'flex items-start gap-3 p-3 rounded-xl border transition-colors text-left',
            value === opt.value 
              ? 'bg-purple-500/10 border-purple-500' 
              : 'bg-white/5 border-white/10 hover:border-white/20',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <div className={cn(
            'w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5',
            value === opt.value ? 'border-purple-500' : 'border-white/20'
          )}>
            {value === opt.value && (
              <div className="w-2 h-2 rounded-full bg-purple-500" />
            )}
          </div>
          <div>
            <span className="text-sm text-white">{opt.label}</span>
            {opt.description && (
              <p className="text-xs text-gray-500 mt-0.5">{opt.description}</p>
            )}
          </div>
        </button>
      ))}
    </div>
  )
}

// Checkbox Component
export function SettingsCheckbox({
  checked,
  onChange,
  label,
  description,
  disabled = false
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  description?: string
  disabled?: boolean
}) {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={cn(
        'flex items-start gap-3 text-left',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <div className={cn(
        'w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors',
        checked ? 'bg-purple-500 border-purple-500' : 'border-white/20'
      )}>
        {checked && <Check size={12} className="text-white" />}
      </div>
      {(label || description) && (
        <div>
          {label && <span className="text-sm text-white">{label}</span>}
          {description && (
            <p className="text-xs text-gray-500 mt-0.5">{description}</p>
          )}
        </div>
      )}
    </button>
  )
}

// Settings Form Actions
export function SettingsActions({
  onSave,
  onReset,
  isSaving = false,
  hasChanges = false,
  saveLabel = 'Mentés',
  resetLabel = 'Visszaállítás'
}: {
  onSave: () => void | Promise<void>
  onReset?: () => void
  isSaving?: boolean
  hasChanges?: boolean
  saveLabel?: string
  resetLabel?: string
}) {
  const handleSave = async () => {
    try {
      await onSave()
      toast.success('Beállítások mentve')
    } catch {
      toast.error('Hiba történt a mentés során')
    }
  }

  return (
    <div className="flex items-center justify-end gap-3 pt-6 border-t border-white/10">
      {onReset && (
        <button
          onClick={onReset}
          disabled={!hasChanges || isSaving}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RotateCcw size={16} />
          {resetLabel}
        </button>
      )}
      
      <button
        onClick={handleSave}
        disabled={!hasChanges || isSaving}
        className="flex items-center gap-2 px-6 py-2.5 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/50 text-white text-sm font-medium rounded-xl transition-colors disabled:cursor-not-allowed"
      >
        {isSaving ? (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <Save size={16} />
        )}
        {saveLabel}
      </button>
    </div>
  )
}

// Range Slider Component
export function SettingsSlider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  showValue = true,
  suffix,
  className
}: {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  showValue?: boolean
  suffix?: string
  className?: string
}) {
  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div className={cn('flex items-center gap-4', className)}>
      <div className="flex-1 relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          disabled={disabled}
          className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500 [&::-webkit-slider-thumb]:cursor-pointer"
          style={{
            background: `linear-gradient(to right, #a855f7 ${percentage}%, rgba(255,255,255,0.1) ${percentage}%)`
          }}
        />
      </div>
      
      {showValue && (
        <span className="text-sm text-white min-w-[4rem] text-right">
          {value}{suffix}
        </span>
      )}
    </div>
  )
}
