'use client'

import { forwardRef, useState } from 'react'
import { Eye, EyeOff, LucideIcon, AlertCircle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  success?: string
  hint?: string
  icon?: LucideIcon
  size?: 'sm' | 'md' | 'lg'
  id?: string
}

const sizes = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-3 text-base',
  lg: 'px-5 py-4 text-lg',
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      success,
      hint,
      icon: Icon,
      size = 'md',
      type,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = type === 'password'
    const inputId = props.id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined)

    return (
      <div className="space-y-2">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-300">
            {label}
          </label>
        )}
        
        <div className="relative group">
          {/* Glow effect on focus */}
          <div className={cn(
            'absolute -inset-0.5 rounded-xl opacity-0 blur transition-opacity duration-300',
            'group-focus-within:opacity-100',
            error ? 'bg-red-500/20' : success ? 'bg-green-500/20' : 'bg-purple-500/20'
          )} />
          
          <div className="relative">
            {Icon && (
              <Icon 
                size={18} 
                className={cn(
                  'absolute left-4 top-1/2 -translate-y-1/2 transition-colors',
                  error ? 'text-red-400' : success ? 'text-green-400' : 'text-gray-500 group-focus-within:text-purple-400'
                )} 
              />
            )}
            
            <input
              ref={ref}
              id={inputId}
              type={isPassword ? (showPassword ? 'text' : 'password') : type}
              disabled={disabled}
              className={cn(
                'w-full bg-[#1a1a1a] border rounded-xl text-white placeholder:text-gray-500',
                'transition-all duration-200',
                'focus:outline-none focus:ring-0',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                sizes[size],
                Icon && 'pl-11',
                isPassword && 'pr-11',
                error 
                  ? 'border-red-500/50 focus:border-red-500' 
                  : success 
                    ? 'border-green-500/50 focus:border-green-500'
                    : 'border-white/10 focus:border-purple-500',
                className
              )}
              {...props}
            />
            
            {isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            )}
            
            {error && !isPassword && (
              <AlertCircle 
                size={18} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-red-400" 
              />
            )}
            
            {success && !isPassword && !error && (
              <CheckCircle2 
                size={18} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-green-400" 
              />
            )}
          </div>
        </div>
        
        {(error || success || hint) && (
          <p className={cn(
            'text-sm',
            error ? 'text-red-400' : success ? 'text-green-400' : 'text-gray-500'
          )}>
            {error || success || hint}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input

// Textarea variant
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  id?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, disabled, id, ...props }, ref) => {
    const textareaId = id || (label ? `textarea-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined)
    
    return (
      <div className="space-y-2">
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-gray-300">
            {label}
          </label>
        )}
        
        <div className="relative group">
          <div className={cn(
            'absolute -inset-0.5 rounded-xl opacity-0 blur transition-opacity duration-300',
            'group-focus-within:opacity-100',
            error ? 'bg-red-500/20' : 'bg-purple-500/20'
          )} />
          
          <textarea
            ref={ref}
            id={textareaId}
            disabled={disabled}
            className={cn(
              'relative w-full bg-[#1a1a1a] border rounded-xl px-4 py-3 text-white placeholder:text-gray-500',
              'transition-all duration-200 min-h-[120px] resize-y',
              'focus:outline-none focus:ring-0',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-purple-500',
              className
            )}
            {...props}
          />
        </div>
        
        {(error || hint) && (
          <p className={cn(
            'text-sm',
            error ? 'text-red-400' : 'text-gray-500'
          )}>
            {error || hint}
          </p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
