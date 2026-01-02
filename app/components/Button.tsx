'use client'

import { forwardRef } from 'react'
import { Loader2, LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  loading?: boolean
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
  href?: string
}

const variants = {
  primary: 'bg-white text-black hover:bg-gray-100 shadow-lg hover:shadow-xl',
  secondary: 'bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-500/20',
  outline: 'bg-transparent border border-white/10 text-white hover:bg-white/5 hover:border-white/20',
  ghost: 'bg-transparent text-gray-400 hover:text-white hover:bg-white/5',
  danger: 'bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-500/20',
}

const sizes = {
  sm: 'px-4 py-2 text-sm rounded-lg gap-1.5',
  md: 'px-6 py-3 text-base rounded-xl gap-2',
  lg: 'px-8 py-4 text-lg rounded-xl gap-2',
  icon: 'w-10 h-10 rounded-xl',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      icon: Icon,
      iconPosition = 'right',
      href,
      className,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading

    const buttonClasses = cn(
      'relative inline-flex items-center justify-center font-bold transition-all duration-200',
      'hover:scale-105 active:scale-95',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]',
      variants[variant],
      sizes[size],
      className
    )

    const content = (
      <>
        {loading && (
          <Loader2 className="w-5 h-5 animate-spin" />
        )}
        {!loading && Icon && iconPosition === 'left' && (
          <Icon size={size === 'sm' ? 16 : size === 'lg' ? 22 : 18} />
        )}
        {children && <span>{children}</span>}
        {!loading && Icon && iconPosition === 'right' && (
          <Icon 
            size={size === 'sm' ? 16 : size === 'lg' ? 22 : 18} 
            className="group-hover:translate-x-0.5 transition-transform"
          />
        )}
      </>
    )

    if (href && !isDisabled) {
      return (
        <Link href={href} className={cn(buttonClasses, 'group')}>
          {content}
        </Link>
      )
    }

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(buttonClasses, 'group')}
        {...props}
      >
        {content}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button

// Icon button variant
export function IconButton({
  icon: Icon,
  variant = 'ghost',
  size = 'icon',
  className,
  'aria-label': ariaLabel,
  ...props
}: Omit<ButtonProps, 'children' | 'icon'> & { icon: LucideIcon; 'aria-label': string }) {
  return (
    <Button variant={variant} size={size} className={className} aria-label={ariaLabel} {...props}>
      <Icon size={20} />
    </Button>
  )
}
