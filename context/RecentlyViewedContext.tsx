'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

type RecentlyViewedContextType = {
  viewedIds: number[]
  addProductToHistory: (id: number) => void
}

const RecentlyViewedContext = createContext<RecentlyViewedContextType | undefined>(undefined)

export function RecentlyViewedProvider({ children }: { children: React.ReactNode }) {
  const [viewedIds, setViewedIds] = useState<number[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('nexu-recently-viewed')
    if (stored) {
      try {
        setViewedIds(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to parse recently viewed history', e)
      }
    }
  }, [])

  const addProductToHistory = useCallback((id: number) => {
    setViewedIds((prev) => {
      if (prev[0] === id) return prev
      const newIds = [id, ...prev.filter((pid) => pid !== id)].slice(0, 10) // Keep last 10
      localStorage.setItem('nexu-recently-viewed', JSON.stringify(newIds))
      return newIds
    })
  }, [])

  return (
    <RecentlyViewedContext.Provider value={{ viewedIds, addProductToHistory }}>
      {children}
    </RecentlyViewedContext.Provider>
  )
}

export function useRecentlyViewed() {
  const context = useContext(RecentlyViewedContext)
  if (context === undefined) {
    throw new Error('useRecentlyViewed must be used within a RecentlyViewedProvider')
  }
  return context
}
