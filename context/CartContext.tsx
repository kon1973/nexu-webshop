'use client'

import React, { createContext, useContext, useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { useSession } from 'next-auth/react'

export type CartItem = {
  id: number
  variantId?: string
  name: string
  price: number
  originalPrice?: number
  image: string
  category: string
  quantity: number
  stock?: number
  selectedOptions?: Record<string, string>
}

export type CartProduct = {
  id: number
  variantId?: string
  name: string
  price: number
  originalPrice?: number
  image?: string | null
  category: string
  stock?: number | null
}

export type Coupon = {
  code: string
  discountType: 'PERCENTAGE' | 'FIXED'
  discountValue: number
}

type CartContextType = {
  cart: CartItem[]
  itemCount: number
  coupon: Coupon | null
  applyCoupon: (coupon: Coupon) => void
  removeCoupon: () => void
  addToCart: (product: CartProduct, quantity?: number, selectedOptions?: Record<string, string>) => number
  removeFromCart: (id: number, variantId?: string, selectedOptions?: Record<string, string>) => void
  clearCart: () => void
  updateQuantity: (id: number, quantity: number, variantId?: string, selectedOptions?: Record<string, string>) => void
  isCartOpen: boolean
  openCart: () => void
  closeCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const STORAGE_KEY = 'nexu-cart'
const COUPON_KEY = 'nexu-coupon'

function normalizeQuantity(value: unknown, fallback: number) {
  const parsed = Math.floor(Number(value))
  if (!Number.isFinite(parsed)) return fallback
  return parsed
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const [cart, setCart] = useState<CartItem[]>([])
  const [coupon, setCoupon] = useState<Coupon | null>(null)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const itemCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart])
  const isInitialMount = useRef(true)

  // Load from LocalStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(STORAGE_KEY)
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart) as unknown
        if (Array.isArray(parsed)) {
          setCart(parsed as CartItem[])
        }
      } catch (error) {
        console.error('Hiba a kosár betöltésekor:', error)
      }
    }

    const savedCoupon = localStorage.getItem(COUPON_KEY)
    if (savedCoupon) {
      try {
        const parsed = JSON.parse(savedCoupon)
        setCoupon(parsed)
      } catch (error) {
        console.error('Hiba a kupon betöltésekor:', error)
      }
    }
  }, [])

  // Sync with Server on Login
  useEffect(() => {
    if (session?.user) {
      fetch('/api/cart/sync')
        .then(res => res.json())
        .then(data => {
          if (data.items && Array.isArray(data.items)) {
            const serverItems = data.items as CartItem[]

            setCart(prevLocalCart => {
              // If server has items, use server cart (authoritative source)
              if (serverItems.length > 0) {
                return serverItems
              }
              
              // If server is empty but local has items, keep local and sync to server
              if (prevLocalCart.length > 0) {
                // Sync local cart to server
                fetch('/api/cart/sync', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ items: prevLocalCart }),
                }).catch(console.error)
                return prevLocalCart
              }

              // Both empty
              return []
            })
          }
        })
        .catch(console.error)
    }
  }, [session])

  // Save to LocalStorage and Server
  useEffect(() => {
    // Skip initial render to avoid overwriting server data with empty local data
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart))

    if (session?.user) {
      const timer = setTimeout(() => {
        fetch('/api/cart/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: cart }),
        }).catch(console.error)
      }, 1000) // Debounce 1s

      return () => clearTimeout(timer)
    }
  }, [cart, session])

  useEffect(() => {
    if (coupon) {
      localStorage.setItem(COUPON_KEY, JSON.stringify(coupon))
    } else {
      localStorage.removeItem(COUPON_KEY)
    }
  }, [coupon])

  const applyCoupon = useCallback((c: Coupon) => setCoupon(c), [])
  const removeCoupon = useCallback(() => setCoupon(null), [])

  const areOptionsEqual = useCallback((a?: Record<string, string>, b?: Record<string, string>) => {
    if (!a && !b) return true
    if (!a || !b) return false
    const keysA = Object.keys(a).sort()
    const keysB = Object.keys(b).sort()
    if (keysA.length !== keysB.length) return false
    return keysA.every((key) => a[key] === b[key])
  }, [])

  const areItemsEqual = useCallback((item: CartItem, id: number, variantId?: string, selectedOptions?: Record<string, string>) => {
    if (item.id !== id) return false
    if (variantId && item.variantId) return item.variantId === variantId
    return areOptionsEqual(item.selectedOptions, selectedOptions)
  }, [areOptionsEqual])

  const addToCart = (product: CartProduct, quantity?: number, selectedOptions?: Record<string, string>) => {
    const requested = Math.max(0, normalizeQuantity(quantity ?? 1, 1))
    if (requested === 0) return 0

    const maxQuantity =
      typeof product.stock === 'number' && Number.isFinite(product.stock) ? Math.max(0, product.stock) : Infinity

    let addedQuantity = 0

    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (item) => areItemsEqual(item, product.id, product.variantId, selectedOptions)
      )

      if (existingItemIndex > -1) {
        const existingItem = prevCart[existingItemIndex]
        const nextQuantity = Math.min(existingItem.quantity + requested, maxQuantity)
        addedQuantity = Math.max(0, nextQuantity - existingItem.quantity)
        if (addedQuantity === 0) return prevCart

        const newCart = [...prevCart]
        newCart[existingItemIndex] = {
          ...existingItem,
          quantity: nextQuantity,
          stock: product.stock ?? existingItem.stock,
        }
        return newCart
      }

      const initialQuantity = Math.min(requested, maxQuantity)
      if (initialQuantity <= 0) return prevCart

      addedQuantity = initialQuantity

      const nextItem: CartItem = {
        id: product.id,
        variantId: product.variantId,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image || '\u{1f6d2}',
        category: product.category,
        quantity: initialQuantity,
        stock: typeof product.stock === 'number' ? product.stock : undefined,
        selectedOptions,
      }

      return [...prevCart, nextItem]
    })

    if (addedQuantity > 0) setIsCartOpen(true)
    return addedQuantity
  }

  const removeFromCart = useCallback((id: number, variantId?: string, selectedOptions?: Record<string, string>) => {
    setCart((prevCart) =>
      prevCart.filter((item) => !areItemsEqual(item, id, variantId, selectedOptions))
    )
  }, [areItemsEqual])

  const clearCart = useCallback(() => {
    setCart([])
    setCoupon(null)
  }, [])

  const updateQuantity = useCallback((id: number, newQuantity: number, variantId?: string, selectedOptions?: Record<string, string>) => {
    const requested = normalizeQuantity(newQuantity, 1)
    if (requested < 1) return

    setCart((prevCart) =>
      prevCart.map((item) => {
        if (!areItemsEqual(item, id, variantId, selectedOptions)) return item

        const maxQuantity =
          typeof item.stock === 'number' && Number.isFinite(item.stock) ? Math.max(1, item.stock) : requested
        return { ...item, quantity: Math.min(requested, maxQuantity) }
      })
    )
  }, [areItemsEqual])

  const openCart = useCallback(() => setIsCartOpen(true), [])
  const closeCart = useCallback(() => setIsCartOpen(false), [])

  const contextValue = useMemo(() => ({
    cart,
    itemCount,
    coupon,
    applyCoupon,
    removeCoupon,
    addToCart,
    removeFromCart,
    clearCart,
    updateQuantity,
    isCartOpen,
    openCart,
    closeCart,
  }), [cart, itemCount, coupon, applyCoupon, removeCoupon, addToCart, removeFromCart, clearCart, updateQuantity, isCartOpen, openCart, closeCart])

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

