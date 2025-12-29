'use client'

import { useMemo, useState } from 'react'
import { useCart } from '@/context/CartContext'
import { Check, Minus, Plus, ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'
import type { Product } from '@prisma/client'

export default function AddToCartButton({ product }: { product: Product }) {
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [isAdded, setIsAdded] = useState(false)

  const maxQuantity = useMemo(() => Math.max(0, product.stock), [product.stock])
  const isOutOfStock = maxQuantity <= 0

  const handleAdd = () => {
    const added = addToCart(product, quantity)

    if (added <= 0) {
      if (product.stock <= 0) {
        toast.error('Sajnos ez a termék elfogyott.')
      } else {
        toast.info('Ebből a termékből ennyit már betettél a kosárba.')
      }
      return
    }

    toast.success(`${product.name} kosárba került! (+${added} db)`)

    if (added < quantity) {
      toast.info('A kért mennyiség egy részét nem tudtuk hozzáadni a készlet miatt.')
    }

    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2000)
  }

  return (
    <div className="space-y-3">
      <div className="bg-[#121212] border border-white/5 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Mennyiség</p>
          <p className="text-[11px] text-gray-400">
            {isOutOfStock ? 'Jelenleg nincs készleten.' : `Készleten: ${maxQuantity} db`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={isOutOfStock || quantity <= 1}
            className="w-9 h-9 rounded-xl bg-[#0a0a0a] border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 transition disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Mennyiség csökkentése"
          >
            <Minus size={16} className="mx-auto" />
          </button>

          <span className="w-10 text-center font-mono text-white">{quantity}</span>

          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
            disabled={isOutOfStock || quantity >= maxQuantity}
            className="w-9 h-9 rounded-xl bg-[#0a0a0a] border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 transition disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Mennyiség növelése"
          >
            <Plus size={16} className="mx-auto" />
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={handleAdd}
        disabled={isOutOfStock || isAdded}
        className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed
          ${
            isOutOfStock
              ? 'bg-white/10 text-gray-300'
              : isAdded
                ? 'bg-green-500 text-white scale-105'
                : 'bg-white text-black hover:bg-purple-500 hover:text-white hover:scale-[1.02] active:scale-[0.98]'
          }
        `}
      >
        {isOutOfStock ? (
          <>
            <ShoppingCart size={24} />
            Elfogyott
          </>
        ) : isAdded ? (
          <>
            <Check size={24} />
            Hozzáadva!
          </>
        ) : (
          <>
            <ShoppingCart size={24} />
            Kosárba
          </>
        )}
      </button>
    </div>
  )
}

