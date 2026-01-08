'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'
import type { Product } from '@prisma/client'
import { getFavorites, addToFavorites, removeFromFavorites, syncFavorites } from '@/lib/actions/user-actions'

export type FavoriteProduct = Product & {
  variants?: { id: string }[]
}

type FavoritesContextType = {
  favorites: FavoriteProduct[]
  toggleFavorite: (product: FavoriteProduct) => void
  isFavorite: (id: number) => boolean
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

const STORAGE_KEY = 'nexu-favorites'

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([])
  const { data: session, status } = useSession()

  useEffect(() => {
    const loadFavorites = async () => {
      if (status === 'authenticated') {
        // 1. Check for local favorites to sync
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
          try {
            const localFavorites = JSON.parse(saved) as FavoriteProduct[]
            if (Array.isArray(localFavorites) && localFavorites.length > 0) {
              const productIds = localFavorites.map(p => p.id)
              
              // Sync with server
              await syncFavorites(productIds)
              
              // Clear local storage after sync
              localStorage.removeItem(STORAGE_KEY)
            }
          } catch (error) {
            console.error('Error syncing local favorites:', error)
          }
        }

        // 2. Fetch merged favorites from server
        const result = await getFavorites()
        if (result.success && Array.isArray(result.favorites)) {
          setFavorites(result.favorites as FavoriteProduct[])
        }
      } else if (status === 'unauthenticated') {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (!saved) return

        try {
          const parsed = JSON.parse(saved) as unknown
          if (!Array.isArray(parsed)) return
          setFavorites(parsed as FavoriteProduct[])
        } catch (error) {
          console.error('Hiba a kedvencek betöltésekor:', error)
        }
      }
    }

    loadFavorites()
  }, [status])

  useEffect(() => {
    if (status === 'unauthenticated') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
    }
  }, [favorites, status])

  const isFavorite = useCallback((id: number) => favorites.some((item) => item.id === id), [favorites])

  const toggleFavorite = useCallback(async (product: FavoriteProduct) => {
    const isFav = favorites.some((item) => item.id === product.id)

    // Optimistic update
    if (isFav) {
      setFavorites((prev) => prev.filter((item) => item.id !== product.id))
      toast.info(`${product.name} eltávolítva a kedvencek közül.`)
    } else {
      setFavorites((prev) => [...prev, product])
      toast.success(`${product.name} hozzáadva a kedvencekhez!`)
    }

    if (status === 'authenticated') {
      try {
        if (isFav) {
          await removeFromFavorites(product.id)
        } else {
          await addToFavorites(product.id)
        }
      } catch (error) {
        console.error('Failed to sync favorite', error)
        toast.error('Nem sikerült szinkronizálni a szerverrel.')
      }
    }
  }, [favorites, status])

  const contextValue = useMemo(() => ({ 
    favorites, 
    toggleFavorite, 
    isFavorite 
  }), [favorites, toggleFavorite, isFavorite])

  return <FavoritesContext.Provider value={contextValue}>{children}</FavoritesContext.Provider>
}

export const useFavorites = () => {
  const context = useContext(FavoritesContext)
  if (!context) throw new Error('useFavorites must be used within a FavoritesProvider')
  return context
}

