'use client'

import Link from 'next/link'
import { WifiOff, RefreshCw, Home, ShoppingCart } from 'lucide-react'

export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center">
          <WifiOff className="w-12 h-12 text-purple-400" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-white mb-4">
          Offline módban vagy
        </h1>

        {/* Description */}
        <p className="text-gray-400 mb-8 leading-relaxed">
          Úgy tűnik, nincs internetkapcsolatod. Néhány funkció korlátozottan érhető el, 
          de a korábban megtekintett oldalak elérhetőek lehetnek.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Újratöltés
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors"
          >
            <Home className="w-5 h-5" />
            Főoldal
          </Link>
        </div>

        {/* Offline Features */}
        <div className="bg-white/5 rounded-2xl p-6 text-left">
          <h2 className="text-lg font-semibold text-white mb-4">
            Elérhető offline módban:
          </h2>
          <ul className="space-y-3 text-gray-400">
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              Korábban megtekintett oldalak
            </li>
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              A kosarad megtekintése
            </li>
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 bg-yellow-500 rounded-full" />
              Kedvencek listája (helyben tárolva)
            </li>
          </ul>
        </div>

        {/* Cart shortcut */}
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 mt-6 text-purple-400 hover:text-purple-300 transition-colors"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Kosár megtekintése</span>
        </Link>
      </div>
    </main>
  )
}
