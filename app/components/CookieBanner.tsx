'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Cookie, X, Settings, Check } from 'lucide-react'

const COOKIE_CONSENT_KEY = 'nexu-cookie-consent'

type ConsentSettings = {
  necessary: boolean
  functional: boolean
  analytics: boolean
}

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState<ConsentSettings>({
    necessary: true, // Always required
    functional: true,
    analytics: false,
  })

  useEffect(() => {
    // Check if consent was already given
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!consent) {
      // Small delay for better UX
      const timer = setTimeout(() => setShowBanner(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const acceptAll = () => {
    const fullConsent: ConsentSettings = {
      necessary: true,
      functional: true,
      analytics: true,
    }
    saveConsent(fullConsent)
  }

  const acceptSelected = () => {
    saveConsent(settings)
  }

  const rejectOptional = () => {
    const minimalConsent: ConsentSettings = {
      necessary: true,
      functional: false,
      analytics: false,
    }
    saveConsent(minimalConsent)
  }

  const saveConsent = (consent: ConsentSettings) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      ...consent,
      timestamp: new Date().toISOString(),
    }))
    setShowBanner(false)
    setShowSettings(false)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6 animate-in slide-in-from-bottom duration-500">
      <div className="max-w-4xl mx-auto bg-[#121212] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
        {!showSettings ? (
          // Main Banner
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="hidden sm:flex w-12 h-12 bg-purple-500/20 rounded-xl items-center justify-center flex-shrink-0">
                <Cookie className="text-purple-400" size={24} />
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-2">
                  🍪 Cookie beállítások
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  Weboldalunk sütiket használ a legjobb felhasználói élmény biztosításához.
                  A &quot;Minden elfogadása&quot; gombra kattintva Ön hozzájárul az összes süti használatához.
                  Részletesebb beállításokért kattintson a &quot;Beállítások&quot; gombra.{' '}
                  <Link href="/privacy#cookies" className="text-purple-400 hover:underline">
                    Tudj meg többet
                  </Link>
                </p>
                
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={acceptAll}
                    className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-colors flex items-center gap-2"
                  >
                    <Check size={18} />
                    Minden elfogadása
                  </button>
                  <button
                    onClick={rejectOptional}
                    className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors"
                  >
                    Csak a szükségesek
                  </button>
                  <button
                    onClick={() => setShowSettings(true)}
                    className="px-6 py-2.5 text-gray-400 hover:text-white font-medium rounded-xl transition-colors flex items-center gap-2"
                  >
                    <Settings size={18} />
                    Beállítások
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Settings Panel
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Settings size={20} />
                Cookie beállítások
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {/* Necessary Cookies */}
              <div className="flex items-start justify-between gap-4 p-4 bg-white/5 rounded-xl">
                <div>
                  <h4 className="font-bold text-white mb-1">Feltétlenül szükséges sütik</h4>
                  <p className="text-sm text-gray-400">
                    Ezek a sütik elengedhetetlenek a weboldal működéséhez. Nem kapcsolhatók ki.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-12 h-7 bg-purple-600 rounded-full relative">
                    <span className="absolute right-1 top-1 w-5 h-5 bg-white rounded-full" />
                  </div>
                </div>
              </div>

              {/* Functional Cookies */}
              <div className="flex items-start justify-between gap-4 p-4 bg-white/5 rounded-xl">
                <div>
                  <h4 className="font-bold text-white mb-1">Funkcionális sütik</h4>
                  <p className="text-sm text-gray-400">
                    Javítják a felhasználói élményt (kedvencek, előzmények mentése).
                  </p>
                </div>
                <button
                  onClick={() => setSettings(s => ({ ...s, functional: !s.functional }))}
                  className={`flex-shrink-0 w-12 h-7 rounded-full relative transition-colors ${
                    settings.functional ? 'bg-purple-600' : 'bg-white/20'
                  }`}
                >
                  <span className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${
                    settings.functional ? 'right-1' : 'left-1'
                  }`} />
                </button>
              </div>

              {/* Analytics Cookies */}
              <div className="flex items-start justify-between gap-4 p-4 bg-white/5 rounded-xl">
                <div>
                  <h4 className="font-bold text-white mb-1">Analitikai sütik</h4>
                  <p className="text-sm text-gray-400">
                    Segítenek megérteni, hogyan használják látogatóink a weboldalt.
                  </p>
                </div>
                <button
                  onClick={() => setSettings(s => ({ ...s, analytics: !s.analytics }))}
                  className={`flex-shrink-0 w-12 h-7 rounded-full relative transition-colors ${
                    settings.analytics ? 'bg-purple-600' : 'bg-white/20'
                  }`}
                >
                  <span className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${
                    settings.analytics ? 'right-1' : 'left-1'
                  }`} />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={acceptSelected}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-colors"
              >
                Kiválasztottak mentése
              </button>
              <button
                onClick={acceptAll}
                className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors"
              >
                Minden elfogadása
              </button>
            </div>

            <p className="mt-4 text-xs text-gray-500">
              További információ:{' '}
              <Link href="/privacy#cookies" className="text-purple-400 hover:underline">
                Cookie szabályzat
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
