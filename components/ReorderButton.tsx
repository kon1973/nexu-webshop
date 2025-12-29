'use client'

import { useCart } from '@/context/CartContext'
import { RefreshCw, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

type ReorderItem = {
  productId: number | null
  variantId: string | null
  name: string | null
  price: number
  quantity: number
  selectedOptions: any
  product: {
    image: string
    category: string
    stock: number
  } | null
}

export default function ReorderButton({ items }: { items: ReorderItem[] }) {
  const { addToCart, openCart } = useCart()
  const [isLoading, setIsLoading] = useState(false)

  const handleReorder = async () => {
    setIsLoading(true)
    let addedCount = 0

    try {
      for (const item of items) {
        if (!item.productId || !item.product) continue

        // Construct the product object expected by addToCart
        const productToAdd = {
          id: item.productId,
          variantId: item.variantId || undefined,
          name: item.name || 'Termék',
          price: item.price,
          image: item.product.image,
          category: item.product.category,
          stock: item.product.stock, // Note: This might be outdated if not fetched fresh
        }

        addToCart(
          productToAdd,
          item.quantity,
          item.selectedOptions as Record<string, string>
        )
        addedCount++
      }

      if (addedCount > 0) {
        toast.success(`${addedCount} termék a kosárba került!`)
        openCart()
      } else {
        toast.error('Egyik termék sem elérhető már.')
      }
    } catch (error) {
      toast.error('Hiba történt az újrarendelés során.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleReorder}
      disabled={isLoading}
      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 text-sm"
    >
      {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
      Újrarendelés
    </button>
  )
}
