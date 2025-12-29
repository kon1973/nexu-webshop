'use client'

import { X, ShoppingCart, Star } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import Link from 'next/link'
import type { Product } from '@prisma/client'

interface QuickViewModalProps {
  product: Product & { variants?: { id: string }[] }
  isOpen: boolean
  onClose: () => void
}

export default function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const { addToCart } = useCart()
  const hasVariants = product.variants && product.variants.length > 0

  const now = new Date()
  const isOnSale = product.salePrice && 
    (!product.saleStartDate || new Date(product.saleStartDate) <= now) && 
    (!product.saleEndDate || new Date(product.saleEndDate) >= now)
  
  const currentPrice = isOnSale ? product.salePrice! : product.price

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-[#121212] border border-white/10 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
          <div className="bg-[#0a0a0a] rounded-2xl p-8 flex items-center justify-center relative group">
            <div className="text-9xl drop-shadow-2xl transition-transform duration-500 group-hover:scale-110">
              {product.image}
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <div className="mb-4">
              <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-purple-500/30">
                {product.category}
              </span>
            </div>

            <h2 className="text-3xl font-bold mb-2">{product.name}</h2>
            
            <div className="flex items-center gap-2 mb-4">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    fill={i < Math.floor(product.rating) ? 'currentColor' : 'none'}
                    className={i < Math.floor(product.rating) ? '' : 'text-gray-600'}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-400">({product.rating})</span>
            </div>

            <p className="text-gray-400 mb-6 line-clamp-3">
              {product.description}
            </p>

            <div className="text-3xl font-bold text-purple-400 mb-8 flex items-center gap-3">
              {isOnSale ? (
                <>
                  <span className="text-gray-500 line-through text-xl">{product.price.toLocaleString('hu-HU')} Ft</span>
                  <span>{currentPrice.toLocaleString('hu-HU')} Ft</span>
                </>
              ) : (
                <span>{product.price.toLocaleString('hu-HU')} Ft</span>
              )}
            </div>

            <div className="flex gap-4">
              {hasVariants ? (
                <Link
                  href={`/shop/${product.id}`}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={20} />
                  Opciók választása
                </Link>
              ) : (
                <button
                  onClick={() => {
                    addToCart({
                      id: product.id,
                      name: product.name,
                      price: currentPrice,
                      originalPrice: isOnSale ? product.price : undefined,
                      image: product.image,
                      category: product.category,
                    })
                    onClose()
                  }}
                  disabled={product.stock <= 0}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={20} />
                  {product.stock > 0 ? 'Kosárba' : 'Elfogyott'}
                </button>
              )}
              
              <Link
                href={`/shop/${product.id}`}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold transition-colors"
              >
                Részletek
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Close on backdrop click */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  )
}
