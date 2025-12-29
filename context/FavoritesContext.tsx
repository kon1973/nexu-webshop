'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'
import type { Product } from '@prisma/client'

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
    const syncFavorites = async () => {
      if (status === 'authenticated') {
        // 1. Check for local favorites to sync
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
          try {
            const localFavorites = JSON.parse(saved) as FavoriteProduct[]
            if (Array.isArray(localFavorites) && localFavorites.length > 0) {
              const productIds = localFavorites.map(p => p.id)
              
              // Send to server
              await fetch('/api/user/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productIds }),
              })
              
              // Clear local storage after sync
              localStorage.removeItem(STORAGE_KEY)
            }
          } catch (error) {
            console.error('Error syncing local favorites:', error)
          }
        }

        // 2. Fetch merged favorites from server
        fetch('/api/user/favorites')
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data)) setFavorites(data)
          })
          .catch(console.error)
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

    syncFavorites()
  }, [status])

  useEffect(() => {
    if (status === 'unauthenticated') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
    }
  }, [favorites, status])

  const isFavorite = (id: number) => favorites.some((item) => item.id === id)

  const toggleFavorite = async (product: FavoriteProduct) => {
    const isFav = isFavorite(product.id)

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
          await fetch(`/api/user/favorites/${product.id}`, { method: 'DELETE' })
        } else {
          await fetch('/api/user/favorites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: product.id }),
          })
        }
      } catch (error) {
        console.error('Failed to sync favorite', error)
        toast.error('Nem sikerült szinkronizálni a szerverrel.')
      }
    }
  }

  return <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>{children}</FavoritesContext.Provider>
}

export const useFavorites = () => {
  const context = useContext(FavoritesContext)
  if (!context) throw new Error('useFavorites must be used within a FavoritesProvider')
  return context
}

