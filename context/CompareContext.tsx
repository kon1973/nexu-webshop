'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import type { Product } from '@prisma/client'
import { toast } from 'sonner'

type CompareContextType = {
  compareList: Product[]
  addToCompare: (product: Product) => void
  removeFromCompare: (productId: number) => void
  clearCompare: () => void
  isInCompare: (productId: number) => boolean
}

const CompareContext = createContext<CompareContextType | undefined>(undefined)

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [compareList, setCompareList] = useState<Product[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('nexu-compare')
    if (saved) {
      try {
        setCompareList(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse compare list', e)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('nexu-compare', JSON.stringify(compareList))
  }, [compareList])

  const addToCompare = (product: Product) => {
    if (compareList.length >= 4) {
      toast.error('Maximum 4 terméket hasonlíthatsz össze egyszerre.')
      return
    }
    if (compareList.some((p) => p.id === product.id)) {
      toast.info('Ez a termék már az összehasonlításban van.')
      return
    }
    setCompareList((prev) => [...prev, product])
    toast.success('Hozzáadva az összehasonlításhoz')
  }

  const removeFromCompare = (productId: number) => {
    setCompareList((prev) => prev.filter((p) => p.id !== productId))
    toast.success('Eltávolítva az összehasonlításból')
  }

  const clearCompare = () => {
    setCompareList([])
    toast.success('Összehasonlítás törölve')
  }

  const isInCompare = (productId: number) => {
    return compareList.some((p) => p.id === productId)
  }

  return (
    <CompareContext.Provider value={{ compareList, addToCompare, removeFromCompare, clearCompare, isInCompare }}>
      {children}
    </CompareContext.Provider>
  )
}

export function useCompare() {
  const context = useContext(CompareContext)
  if (context === undefined) {
    throw new Error('useCompare must be used within a CompareProvider')
  }
  return context
}
