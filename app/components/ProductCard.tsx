'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Star, Eye, ArrowLeftRight } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useCompare } from '@/context/CompareContext'
import FavoriteButton from './FavoriteButton'
import QuickViewModal from './QuickViewModal'
import type { Product } from '@prisma/client'
import { toast } from 'sonner'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ProductCardProps {
  product: Product & { 
    variants?: { id: string }[]
    _count?: { reviews: number }
  }
  priority?: boolean
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const { addToCart, openCart } = useCart()
  const { addToCompare, removeFromCompare, isInCompare } = useCompare()
  const router = useRouter()
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false)
  const isOutOfStock = product.stock <= 0
  const availabilityLabel = isOutOfStock ? 'Elfogyott' : 'Készleten'
  const isNew = new Date(product.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
  const hasVariants = product.variants && product.variants.length > 0
  const isCompared = isInCompare(product.id)
  const reviewsCount = product._count?.reviews || 0

  const now = new Date()
  const isOnSale = product.salePrice && 
    (!product.saleStartDate || new Date(product.saleStartDate) <= now) && 
    (!product.saleEndDate || new Date(product.saleEndDate) >= now)
  
  const currentPrice = isOnSale ? product.salePrice : product.price
  
  // Calculate discount percentage
  let discountPercentage = 0
  if (isOnSale && product.salePrice) {
    if (product.salePercentage) {
      discountPercentage = product.salePercentage
    } else {
      discountPercentage = Math.round(((product.price - product.salePrice) / product.price) * 100)
    }
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (hasVariants) {
      router.push(`/shop/${product.id}`)
      return
    }

    if (isOutOfStock) return
    addToCart({
      ...product,
      price: currentPrice!,
      originalPrice: isOnSale ? product.price : undefined
    })
    openCart()
    toast.success(`${product.name} a kosárba került`)
  }

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsQuickViewOpen(true)
  }

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isCompared) {
      removeFromCompare(product.id)
      toast.info('Eltávolítva az összehasonlításból')
    } else {
      addToCompare(product)
      toast.success('Hozzáadva az összehasonlításhoz')
    }
  }

  return (
    <>
      <div className="group relative bg-[#0a0a0a] rounded-3xl border border-white/5 hover:border-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 overflow-hidden flex flex-col h-full hover:-translate-y-2">
        <Link href={`/shop/${product.id}`} className="block relative">
          <div className="relative aspect-square bg-gradient-to-br from-[#1a1a1a] to-[#050505] flex items-center justify-center overflow-hidden p-8 group-hover:from-[#222] group-hover:to-[#0a0a0a] transition-colors duration-500">
            <div className="w-full h-full flex items-center justify-center transform group-hover:scale-110 transition-all duration-500 drop-shadow-2xl filter group-hover:brightness-110">
              {product.image.startsWith('http') || product.image.startsWith('/') ? (
                <div className="relative w-full h-full">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={priority}
                  />
                </div>
              ) : (
                <span className="text-7xl">{product.image}</span>
              )}
            </div>

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />

            <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
              {isNew && (
                <span className="px-3 py-1 bg-purple-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-lg shadow-purple-500/30 animate-in fade-in zoom-in duration-300">
                  Új
                </span>
              )}
              {isOnSale && (
                <>
                  <span className="px-3 py-1 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-lg shadow-red-500/30 animate-in fade-in zoom-in duration-300">
                    Akció
                  </span>
                  {discountPercentage > 0 && (
                    <span className="px-3 py-1 bg-yellow-500 text-black text-[10px] font-bold uppercase tracking-wider rounded-full shadow-lg shadow-yellow-500/30 animate-in fade-in zoom-in duration-300">
                      -{discountPercentage}%
                    </span>
                  )}
                </>
              )}
            </div>

            <div className="absolute top-4 right-4 flex flex-col gap-2 z-20 translate-x-20 group-hover:translate-x-0 transition-transform duration-500 ease-out">
              <div className="transform transition-transform duration-300 hover:scale-110">
                <FavoriteButton product={product} />
              </div>
              <button
                onClick={handleQuickView}
                className="w-10 h-10 flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-white hover:bg-purple-600 hover:border-purple-500 transition-all duration-300 shadow-lg"
                title="Gyorsnézet"
              >
                <Eye size={18} />
              </button>
              <button
                onClick={handleCompare}
                className={`w-10 h-10 flex items-center justify-center backdrop-blur-md border rounded-full transition-all duration-300 shadow-lg ${
                  isCompared 
                    ? 'bg-purple-600 border-purple-500 text-white' 
                    : 'bg-white/10 border-white/10 text-white hover:bg-purple-600 hover:border-purple-500'
                }`}
                title={isCompared ? "Eltávolítás az összehasonlításból" : "Összehasonlítás"}
              >
                <ArrowLeftRight size={18} />
              </button>
            </div>
          </div>
        </Link>

        <div className="p-6 flex flex-col flex-grow relative z-10">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-purple-400 uppercase tracking-wider">{product.category}</span>
            <div className="flex items-center gap-1">
              <Star size={12} className="text-yellow-400 fill-yellow-400" />
              <span className="text-xs font-bold text-white">{product.rating.toFixed(1)}</span>
              <span className="text-[10px] text-gray-500">({reviewsCount})</span>
            </div>
          </div>

          <Link href={`/shop/${product.id}`} className="group-hover:text-purple-400 transition-colors duration-300">
            <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 leading-tight">{product.name}</h3>
          </Link>
          
          <p className="text-sm text-gray-400 line-clamp-2 mb-4 flex-grow">{product.description}</p>

          <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between gap-4">
            <div className="flex flex-col">
              {isOnSale && (
                <span className="text-xs text-gray-500 line-through decoration-red-500/50">
                  {product.price.toLocaleString('hu-HU')} Ft
                </span>
              )}
              <span className={`text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${isOnSale ? 'from-red-500 to-orange-500' : 'from-white to-gray-400'}`}>
                {currentPrice?.toLocaleString('hu-HU')} Ft
              </span>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 shadow-lg transform active:scale-95 ${
                isOutOfStock
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-white/5'
                  : hasVariants
                    ? 'bg-white text-black hover:bg-gray-200 hover:shadow-white/10'
                    : 'bg-purple-600 text-white hover:bg-purple-500 hover:shadow-purple-500/25'
              }`}
            >
              {isOutOfStock 
                ? 'Elfogyott' 
                : hasVariants 
                  ? 'Részletek' 
                  : 'Kosárba'}
            </button>
          </div>
        </div>
        <QuickViewModal 
          product={product} 
          isOpen={isQuickViewOpen} 
          onClose={() => setIsQuickViewOpen(false)} 
        />
      </div>
    </>
  )
}
