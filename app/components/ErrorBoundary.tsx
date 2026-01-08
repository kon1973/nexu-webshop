'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp, Bug } from 'lucide-react'
import Link from 'next/link'
import * as Sentry from '@sentry/nextjs'

interface ErrorBoundaryProps {
  error: Error & { digest?: string }
  reset: () => void
  title?: string
  message?: string
  showHomeButton?: boolean
  showDetails?: boolean
  /** Component name for better error tracking */
  componentName?: string
}

export default function ErrorBoundary({
  error,
  reset,
  title = 'Hiba történt!',
  message = 'Valami váratlan hiba lépett fel. Kérjük, próbáld újra később.',
  showHomeButton = true,
  showDetails = process.env.NODE_ENV === 'development',
  componentName,
}: ErrorBoundaryProps) {
  const [showErrorDetails, setShowErrorDetails] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)

  useEffect(() => {
    // Log error for monitoring
    console.error('Error boundary caught:', error)
    
    // Report to Sentry
    Sentry.withScope((scope) => {
      if (componentName) {
        scope.setTag('component', componentName)
      }
      scope.setTag('error_boundary', 'true')
      if (error.digest) {
        scope.setTag('error_digest', error.digest)
      }
      Sentry.captureException(error)
    })
  }, [error, componentName])

  const handleRetry = async () => {
    setIsRetrying(true)
    // Small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500))
    reset()
    setIsRetrying(false)
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#121212] border border-red-500/20 rounded-2xl p-8 shadow-2xl text-center">
        {/* Error Icon */}
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
          <AlertTriangle className="text-red-500" size={40} />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-3">{title}</h2>

        {/* Message */}
        <p className="text-gray-400 mb-6 leading-relaxed">
          {message}
        </p>

        {/* Error Digest (for support) */}
        {error.digest && (
          <p className="text-xs text-gray-600 mb-6 font-mono bg-white/5 py-2 px-4 rounded-lg inline-block">
            Hibakód: {error.digest}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
          >
            <RefreshCw size={18} className={isRetrying ? 'animate-spin' : ''} />
            {isRetrying ? 'Újratöltés...' : 'Próbáld újra'}
          </button>

          {showHomeButton && (
            <Link
              href="/"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Home size={18} />
              Főoldal
            </Link>
          )}
        </div>

        {/* Error Details Toggle (dev mode) */}
        {showDetails && (
          <div className="border-t border-white/10 pt-4 mt-4">
            <button
              onClick={() => setShowErrorDetails(!showErrorDetails)}
              className="text-sm text-gray-500 hover:text-gray-300 transition-colors flex items-center justify-center gap-2 mx-auto"
            >
              <Bug size={14} />
              Technikai részletek
              {showErrorDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showErrorDetails && (
              <div className="mt-4 text-left bg-black/50 rounded-lg p-4 overflow-auto max-h-48">
                <p className="text-red-400 font-mono text-xs break-all">
                  {error.name}: {error.message}
                </p>
                {error.stack && (
                  <pre className="text-gray-500 font-mono text-xs mt-2 whitespace-pre-wrap">
                    {error.stack}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}

        {/* Support Link */}
        <p className="text-xs text-gray-600 mt-6">
          Probléma továbbra is fennáll?{' '}
          <Link href="/contact" className="text-purple-400 hover:text-purple-300 transition-colors">
            Kapcsolatfelvétel
          </Link>
        </p>
      </div>
    </div>
  )
}

// Pre-configured error boundaries for common scenarios
export function CartError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <ErrorBoundary
      error={error}
      reset={reset}
      title="Kosár betöltési hiba"
      message="Sajnáljuk, a kosár tartalma nem töltődött be. Próbáld újra betölteni az oldalt."
    />
  )
}

export function CheckoutError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <ErrorBoundary
      error={error}
      reset={reset}
      title="Pénztár hiba"
      message="A pénztár oldal betöltése nem sikerült. Kérjük, ellenőrizd az internetkapcsolatod és próbáld újra."
    />
  )
}

export function ProductError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <ErrorBoundary
      error={error}
      reset={reset}
      title="Termék nem elérhető"
      message="A keresett termék betöltése nem sikerült. Lehet, hogy a termék már nem elérhető."
    />
  )
}

export function ShopError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <ErrorBoundary
      error={error}
      reset={reset}
      title="Termékek betöltése sikertelen"
      message="A termékek betöltése közben hiba lépett fel. Próbáld frissíteni az oldalt."
      componentName="Shop"
    />
  )
}

/**
 * Minimal inline error display for small sections
 */
export function InlineError({ 
  message = 'Nem sikerült betölteni', 
  onRetry 
}: { 
  message?: string
  onRetry?: () => void 
}) {
  return (
    <div 
      className="flex items-center justify-center gap-3 p-4 bg-red-500/5 border border-red-500/10 rounded-xl text-sm"
      role="alert"
      aria-live="polite"
    >
      <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" aria-hidden="true" />
      <span className="text-gray-400">{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-purple-400 hover:text-purple-300 underline underline-offset-2 focus-ring rounded"
        >
          Újra
        </button>
      )}
    </div>
  )
}

/**
 * Section Error - for partial page failures
 */
export function SectionError({
  title = 'Nem sikerült betölteni',
  description = 'Ez a szekció jelenleg nem elérhető.',
  onRetry,
}: {
  title?: string
  description?: string
  onRetry?: () => void
}) {
  return (
    <div 
      className="py-12 px-6 text-center"
      role="alert"
      aria-live="polite"
    >
      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
        <AlertTriangle className="w-6 h-6 text-red-500" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm mb-4 max-w-md mx-auto">{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors focus-ring"
        >
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
          Újrapróbálás
        </button>
      )}
    </div>
  )
}

/**
 * Empty State Component
 */
export function EmptyState({
  icon: Icon = AlertTriangle,
  title,
  description,
  action,
}: {
  icon?: React.ComponentType<{ className?: string }>
  title: string
  description?: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
}) {
  return (
    <div className="text-center py-12 px-6">
      <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
      {description && (
        <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">{description}</p>
      )}
      {action && (
        action.href ? (
          <Link
            href={action.href}
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors focus-ring"
          >
            {action.label}
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors focus-ring"
          >
            {action.label}
          </button>
        )
      )}
    </div>
  )
}
