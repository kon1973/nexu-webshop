'use client'

import { SessionProvider } from "next-auth/react"
import { CartProvider } from '@/context/CartContext'
import { FavoritesProvider } from '@/context/FavoritesContext'
import { RecentlyViewedProvider } from '@/context/RecentlyViewedContext'
import { CompareProvider } from '@/context/CompareContext'
import { SettingsProvider } from '@/context/SettingsContext'

export function Providers({ 
  children,
  settings
}: { 
  children: React.ReactNode
  settings: Record<string, string>
}) {
  return (
    <SessionProvider>
      <SettingsProvider initialSettings={settings}>
        <CartProvider>
          <FavoritesProvider>
            <RecentlyViewedProvider>
              <CompareProvider>
                {children}
              </CompareProvider>
            </RecentlyViewedProvider>
          </FavoritesProvider>
        </CartProvider>
      </SettingsProvider>
    </SessionProvider>
  )
}
