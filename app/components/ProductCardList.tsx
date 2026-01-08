'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Star, Eye, ArrowLeftRight, Package, ShoppingCart, Check, AlertTriangle } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useCompare } from '@/context/CompareContext'
import FavoriteButton from './FavoriteButton'
import dynamic from 'next/dynamic'
import type { Product } from '@prisma/client'
import { toast } from 'sonner'
import { useState, useMemo, useCallback, memo } from 'react'
import { useRouter } from 'next/navigation'
import { getImageUrl } from '@/lib/image'

const QuickViewModal = dynamic(() => import('./QuickViewModal'), {
  loading: () => null,
  ssr: false,
})

interface ProductCardListProps {
  product: Product & { 
    variants?: { id: string }[]
    _count?: { reviews: number }
    slug?: string | null
  }
  priority?: boolean
}

const ProductCardList = memo(function ProductCardList({ product, priority = false }: ProductCardListProps) {
  const productUrl = `/shop/${product.slug || product.id}`
  const { addToCart, openCart } = useCart()
  const { addToCompare, removeFromCompare, isInCompare } = useCompare()
  const router = useRouter()
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false)
  
  const { isOutOfStock, isLowStock, isNew, hasVariants, reviewsCount, isOnSale, currentPrice, discountPercentage, imageUrl } = useMemo(() => {
    const outOfStock = product.stock <= 0
    const lowStock = product.stock > 0 && product.stock <= 5
    const productIsNew = new Date(product.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
    const variants = product.variants && product.variants.length > 0
    const reviews = product._count?.reviews || 0
    
    const now = new Date()
    const onSale = product.salePrice && 
      (!product.saleStartDate || new Date(product.saleStartDate) <= now) && 
      (!product.saleEndDate || new Date(product.saleEndDate) >= now)
    
    const price = onSale ? product.salePrice : product.price
    
    let discount = 0
    if (onSale && product.salePrice) {
      if (product.salePercentage) {
        discount = product.salePercentage
      } else {
        discount = Math.round(((product.price - product.salePrice) / product.price) * 100)
      }
    }
    
    return {
      isOutOfStock: outOfStock,
      isLowStock: lowStock,
      isNew: productIsNew,
      hasVariants: variants,
      reviewsCount: reviews,
      isOnSale: onSale,
      currentPrice: price,
      discountPercentage: discount,
      imageUrl: getImageUrl(product.image)
    }
  }, [product])
  
  const isCompared = isInCompare(product.id)

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
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
  }, [hasVariants, isOutOfStock, isOnSale, currentPrice, product, router, addToCart, openCart])

  const handleQuickView = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsQuickViewOpen(true)
  }, [])

  const handleCompare = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isCompared) {
      removeFromCompare(product.id)
      toast.info('Eltávolítva az összehasonlításból')
    } else {
      addToCompare(product)
      toast.success('Hozzáadva az összehasonlításhoz')
    }
  }, [isCompared, product, removeFromCompare, addToCompare])

  return (
    <>
      <article 
        className="group relative bg-[#0a0a0a] rounded-xl md:rounded-2xl border border-white/5 hover:border-purple-500/30 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 overflow-hidden"
        aria-label={`${product.name} - ${currentPrice?.toLocaleString('hu-HU')} Ft`}
      >
        <div className="flex flex-col sm:flex-row gap-4 p-3 md:p-4">
          {/* Image */}
          <Link href={productUrl} className="block relative flex-shrink-0">
            <div className="relative w-full sm:w-40 md:w-48 aspect-square sm:aspect-auto sm:h-40 md:h-48 bg-gradient-to-br from-[#1a1a1a] to-[#050505] rounded-xl overflow-hidden">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={product.name}
                  fill
                  className="object-contain p-2"
                  sizes="(max-width: 640px) 100vw, 200px"
                  priority={priority}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600">
                  <Package size={48} strokeWidth={1} />
                </div>
              )}
              
              {/* Badges */}
              <div className="absolute top-2 left-2 flex flex-wrap gap-1 z-10">
                {isNew && (
                  <span className="px-2 py-0.5 bg-purple-600 text-white text-[9px] font-bold uppercase rounded-full">
                    Új
                  </span>
                )}
                {isOnSale && discountPercentage > 0 && (
                  <span className="px-2 py-0.5 bg-red-600 text-white text-[9px] font-bold rounded-full">
                    -{discountPercentage}%
                  </span>
                )}
              </div>
            </div>
          </Link>

          {/* Content */}
          <div className="flex-grow flex flex-col min-w-0">
            {/* Header row */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0">
                <Link 
                  href={`/shop?category=${encodeURIComponent(product.category)}`}
                  className="text-[10px] md:text-xs font-medium text-purple-400 uppercase tracking-wider hover:text-purple-300 transition-colors"
                >
                  {product.category}
                </Link>
                <Link href={productUrl} className="block group-hover:text-purple-400 transition-colors">
                  <h3 className="text-sm md:text-base lg:text-lg font-bold text-white line-clamp-2 leading-tight">{product.name}</h3>
                </Link>
              </div>
              
              {/* Rating */}
              <div className="flex items-center gap-1 flex-shrink-0 bg-white/5 px-2 py-1 rounded-full">
                <Star size={12} className="text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-bold text-white">{product.rating.toFixed(1)}</span>
                <span className="text-[10px] text-gray-500">({reviewsCount})</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs md:text-sm text-gray-400 line-clamp-2 mb-3 flex-grow">{product.description}</p>

            {/* Stock indicator */}
            <div className="mb-3">
              {isOutOfStock ? (
                <span className="inline-flex items-center gap-1 text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded-full">
                  <AlertTriangle size={12} />
                  Elfogyott
                </span>
              ) : isLowStock ? (
                <span className="inline-flex items-center gap-1 text-xs text-orange-400 bg-orange-500/10 px-2 py-1 rounded-full">
                  <AlertTriangle size={12} />
                  Csak {product.stock} db
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
                  <Check size={12} />
                  Készleten ({product.stock} db)
                </span>
              )}
              {currentPrice && currentPrice >= 20000 && (
                <span className="inline-flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-full ml-2">
                  <Package size={12} />
                  Ingyenes szállítás
                </span>
              )}
            </div>

            {/* Bottom row: Price + Actions */}
            <div className="flex items-center justify-between gap-4 pt-3 border-t border-white/5">
              {/* Price */}
              <div className="flex items-baseline gap-2">
                <span className={`text-lg md:text-xl lg:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${isOnSale ? 'from-red-500 to-orange-500' : 'from-white to-gray-400'}`}>
                  {currentPrice?.toLocaleString('hu-HU')} Ft
                </span>
                {isOnSale && (
                  <span className="text-xs md:text-sm text-gray-500 line-through">
                    {product.price.toLocaleString('hu-HU')} Ft
                  </span>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleQuickView}
                  className="hidden sm:flex w-9 h-9 items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-all"
                  title="Gyorsnézet"
                >
                  <Eye size={16} />
                </button>
                
                <button
                  onClick={handleCompare}
                  className={`hidden sm:flex w-9 h-9 items-center justify-center border rounded-lg transition-all ${
                    isCompared 
                      ? 'bg-purple-600 border-purple-500 text-white' 
                      : 'bg-white/5 hover:bg-white/10 border-white/10 text-gray-400 hover:text-white'
                  }`}
                  title={isCompared ? "Eltávolítás az összehasonlításból" : "Összehasonlítás"}
                >
                  <ArrowLeftRight size={16} />
                </button>
                
                <div className="transform transition-transform hover:scale-105">
                  <FavoriteButton product={product} size="sm" />
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {hasVariants ? (
                    <>
                      <Eye size={16} />
                      <span className="hidden md:inline">Megtekintés</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={16} />
                      <span className="hidden md:inline">{isOutOfStock ? 'Elfogyott' : 'Kosárba'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>
      
      {isQuickViewOpen && (
        <QuickViewModal 
          product={product} 
          isOpen={isQuickViewOpen} 
          onClose={() => setIsQuickViewOpen(false)} 
        />
      )}
    </>
  )
})

export default ProductCardList
