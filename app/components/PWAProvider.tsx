'use client'

import { useEffect, useState } from 'react'
import { Download, X, RefreshCw } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/**
 * PWA Service Worker Registration and Install Prompt
 */
export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      registerServiceWorker()
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      // Show install prompt if user hasn't dismissed it recently
      const dismissed = localStorage.getItem('pwa-install-dismissed')
      if (!dismissed || Date.now() - parseInt(dismissed) > 7 * 24 * 60 * 60 * 1000) {
        setShowInstallPrompt(true)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      setShowInstallPrompt(false)
      setDeferredPrompt(null)
      console.log('[PWA] App installed successfully')
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const registerServiceWorker = async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      })
      setRegistration(reg)

      // Check for updates
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setShowUpdatePrompt(true)
            }
          })
        }
      })

      console.log('[PWA] Service Worker registered')
    } catch (error) {
      console.error('[PWA] Service Worker registration failed:', error)
    }
  }

  const handleInstall = async () => {
    if (!deferredPrompt) return

    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('[PWA] User accepted install prompt')
    } else {
      console.log('[PWA] User dismissed install prompt')
      localStorage.setItem('pwa-install-dismissed', Date.now().toString())
    }

    setDeferredPrompt(null)
    setShowInstallPrompt(false)
  }

  const handleDismissInstall = () => {
    setShowInstallPrompt(false)
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }

  const handleUpdate = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      window.location.reload()
    }
  }

  return (
    <>
      {children}

      {/* Install Prompt */}
      {showInstallPrompt && (
        <div 
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-[#1a1a1a] border border-white/10 rounded-2xl p-4 shadow-2xl z-50 animate-in slide-in-from-bottom duration-300"
          role="dialog"
          aria-label="Alkalmazás telepítése"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
              <Download className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white mb-1">
                Telepítsd a NEXU appot
              </h3>
              <p className="text-sm text-gray-400 mb-3">
                Gyorsabb hozzáférés és offline böngészés
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleInstall}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Telepítés
                </button>
                <button
                  onClick={handleDismissInstall}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Később
                </button>
              </div>
            </div>
            <button
              onClick={handleDismissInstall}
              className="p-1 text-gray-400 hover:text-white transition-colors"
              aria-label="Bezárás"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Update Prompt */}
      {showUpdatePrompt && (
        <div 
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-[#1a1a1a] border border-green-500/30 rounded-2xl p-4 shadow-2xl z-50 animate-in slide-in-from-bottom duration-300"
          role="dialog"
          aria-label="Frissítés elérhető"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center flex-shrink-0">
              <RefreshCw className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white mb-1">
                Frissítés elérhető
              </h3>
              <p className="text-sm text-gray-400 mb-3">
                Újdonságok és hibajavítások érkeztek
              </p>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Frissítés most
              </button>
            </div>
            <button
              onClick={() => setShowUpdatePrompt(false)}
              className="p-1 text-gray-400 hover:text-white transition-colors"
              aria-label="Bezárás"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}

/**
 * Hook to check if app is installed as PWA
 */
export function useIsPWA() {
  const [isPWA, setIsPWA] = useState(false)

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true

    setIsPWA(isStandalone)
  }, [])

  return isPWA
}

/**
 * Hook to check online status
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}

export default PWAProvider
