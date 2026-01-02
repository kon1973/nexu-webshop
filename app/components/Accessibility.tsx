'use client'

import { useEffect, useState } from 'react'

/**
 * Skip to main content link for keyboard users
 * This link becomes visible when focused (tabbed to)
 */
export default function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-purple-600 focus:text-white focus:rounded-lg focus:font-medium focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-[#0a0a0a]"
    >
      Ugrás a tartalomhoz
    </a>
  )
}

/**
 * Keyboard navigation hints
 * Shows available keyboard shortcuts on the page
 */
export function KeyboardHints() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Show hints when '?' is pressed
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        const activeElement = document.activeElement
        const isInput = activeElement instanceof HTMLInputElement || 
                       activeElement instanceof HTMLTextAreaElement
        
        if (!isInput) {
          setIsVisible(prev => !prev)
        }
      }
      
      // Hide on Escape
      if (e.key === 'Escape') {
        setIsVisible(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (!isVisible) return null

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={() => setIsVisible(false)}
      role="dialog"
      aria-label="Billentyűparancsok"
    >
      <div 
        className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-white mb-4">Billentyűparancsok</h2>
        
        <div className="space-y-3">
          <ShortcutRow keys={['/']} description="Keresés megnyitása" />
          <ShortcutRow keys={['Esc']} description="Bezárás / Mégse" />
          <ShortcutRow keys={['?']} description="Súgó megjelenítése" />
          <ShortcutRow keys={['Tab']} description="Következő elem" />
          <ShortcutRow keys={['Shift', 'Tab']} description="Előző elem" />
          <ShortcutRow keys={['Enter']} description="Kiválasztás / Megnyitás" />
          <ShortcutRow keys={['↑', '↓']} description="Navigálás listában" />
        </div>

        <p className="mt-6 text-xs text-gray-500 text-center">
          Nyomj <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-gray-400">Esc</kbd> vagy <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-gray-400">?</kbd> a bezáráshoz
        </p>
      </div>
    </div>
  )
}

function ShortcutRow({ keys, description }: { keys: string[]; description: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-400">{description}</span>
      <div className="flex items-center gap-1">
        {keys.map((key, index) => (
          <span key={index}>
            {index > 0 && <span className="text-gray-600 mx-1">+</span>}
            <kbd className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs font-mono text-gray-300">
              {key}
            </kbd>
          </span>
        ))}
      </div>
    </div>
  )
}

/**
 * Focus trap for modals and dialogs
 */
export function useFocusTrap(isActive: boolean, containerRef: React.RefObject<HTMLElement>) {
  useEffect(() => {
    if (!isActive || !containerRef.current) return

    const container = containerRef.current
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    // Focus first element when trap is activated
    firstElement?.focus()

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isActive, containerRef])
}

/**
 * Announce changes to screen readers
 */
export function useAnnounce() {
  const [announcement, setAnnouncement] = useState('')

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    setAnnouncement('')
    // Small delay to ensure the change is detected
    setTimeout(() => setAnnouncement(message), 100)
  }

  const Announcer = () => (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  )

  return { announce, Announcer }
}
