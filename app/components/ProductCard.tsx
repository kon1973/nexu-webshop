'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Star, Eye, ArrowLeftRight, Package, ShoppingCart, Plus } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useCompare } from '@/context/CompareContext'
import FavoriteButton from './FavoriteButton'
import dynamic from 'next/dynamic'
import type { Product } from '@prisma/client'
import { toast } from 'sonner'
import { useState, useMemo, useCallback, memo, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { getImageUrl } from '@/lib/image'

// Lazy load QuickViewModal - only needed when user clicks quick view
const QuickViewModal = dynamic(() => import('./QuickViewModal'), {
  loading: () => null,
  ssr: false,
})

interface ProductCardProps {
  product: Product & { 
    variants?: { id: string }[]
    _count?: { reviews: number }
    slug?: string | null
  }
  priority?: boolean
}

const ProductCard = memo(function ProductCard({ product, priority = false }: ProductCardProps) {
  // Use slug for SEO-friendly URLs, fallback to ID
  const productUrl = `/shop/${product.slug || product.id}`
  const { addToCart, openCart } = useCart()
  const { addToCompare, removeFromCompare, isInCompare } = useCompare()
  const router = useRouter()
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false)
  
  // Memoize computed values
  const { isOutOfStock, isNew, hasVariants, reviewsCount, isOnSale, currentPrice, discountPercentage, imageUrl } = useMemo(() => {
    const outOfStock = product.stock <= 0
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
        className="group relative bg-[#0a0a0a] rounded-2xl md:rounded-3xl border border-white/5 hover:border-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 overflow-hidden flex flex-col h-full md:hover:-translate-y-2"
        aria-label={`${product.name} - ${currentPrice?.toLocaleString('hu-HU')} Ft`}
      >
        <Link href={productUrl} className="block relative" aria-label={`${product.name} részletei`}>
          <div className="relative aspect-square bg-gradient-to-br from-[#1a1a1a] to-[#050505] flex items-center justify-center overflow-hidden p-3 md:p-8 group-hover:from-[#222] group-hover:to-[#0a0a0a] transition-colors duration-500">
            
            <div className="w-full h-full flex items-center justify-center transform group-hover:scale-110 transition-all duration-500 drop-shadow-2xl filter group-hover:brightness-110">
              {imageUrl ? (
                <div className="relative w-full h-full">
                  <Image
                    src={imageUrl}
                    alt={product.name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={priority}
                  />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600">
                  {product.image === '\u{1f4e6}' ? (
                    <span className="text-7xl">{product.image}</span>
                  ) : (
                    <Package size={64} strokeWidth={1} />
                  )}
                </div>
              )}
            </div>

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />

            {/* Overlay Actions - Slide Up */}
            <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20 flex justify-center gap-2">
               <button
                 onClick={handleAddToCart}
                 disabled={isOutOfStock}
                 className="flex-1 bg-white text-black font-bold py-3 rounded-xl shadow-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 {hasVariants ? (
                   <>
                     <Eye size={18} />
                     <span className="text-sm">Megtekintés</span>
                   </>
                 ) : (
                   <>
                     <ShoppingCart size={18} />
                     <span className="text-sm">{isOutOfStock ? 'Elfogyott' : 'Kosárba'}</span>
                   </>
                 )}
               </button>
            </div>

            <div className="absolute top-2 md:top-4 left-2 md:left-4 flex flex-wrap gap-1 md:gap-2 z-20 items-start max-w-[calc(100%-1rem)] md:max-w-[calc(100%-2rem)]">
              {isNew && (
                <span className="px-2 md:px-3 py-0.5 md:py-1 bg-purple-600 text-white text-[8px] md:text-[10px] font-bold uppercase tracking-wider rounded-full shadow-lg shadow-purple-500/30">
                  Új
                </span>
              )}
              {currentPrice && currentPrice >= 20000 && (
                <div className="hidden md:flex bg-green-500/20 backdrop-blur-md border border-green-500/30 text-green-400 text-[10px] font-bold px-2 py-1 rounded-full items-center gap-1 shadow-lg shadow-green-500/10">
                  <Package size={10} />
                  INGYEN SZÁLLÍTÁS
                </div>
              )}
              {isOnSale && (
                <>
                  {discountPercentage > 0 && (
                    <span className="px-2 md:px-3 py-0.5 md:py-1 bg-red-600 text-white text-[8px] md:text-[10px] font-bold uppercase tracking-wider rounded-full shadow-lg shadow-red-500/30">
                      -{discountPercentage}%
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Mobile: Show favorite button always, Desktop: Show all on hover */}
            <div className="absolute top-2 md:top-4 right-2 md:right-4 flex flex-col gap-1.5 md:gap-2 z-20">
              {/* Favorite - always visible */}
              <div className="transform transition-transform duration-300 hover:scale-110">
                <FavoriteButton product={product} size="sm" />
              </div>
              {/* Quick view - hidden on mobile, show on hover desktop */}
              <button
                onClick={handleQuickView}
                className="hidden md:flex w-10 h-10 items-center justify-center bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-white hover:bg-purple-600 hover:border-purple-500 transition-all duration-300 shadow-lg translate-x-20 group-hover:translate-x-0"
                title="Gyorsnézet"
                aria-label={`${product.name} gyorsnézet`}
              >
                <Eye size={18} aria-hidden="true" />
              </button>
              {/* Compare - hidden on mobile, show on hover desktop */}
              <button
                onClick={handleCompare}
                className={`hidden md:flex w-10 h-10 items-center justify-center backdrop-blur-md border rounded-full transition-all duration-300 shadow-lg translate-x-20 group-hover:translate-x-0 ${
                  isCompared 
                    ? 'bg-purple-600 border-purple-500 text-white !translate-x-0' 
                    : 'bg-white/10 border-white/10 text-white hover:bg-purple-600 hover:border-purple-500'
                }`}
                title={isCompared ? "Eltávolítás az összehasonlításból" : "Összehasonlítás"}
                aria-label={isCompared ? `${product.name} eltávolítása az összehasonlításból` : `${product.name} összehasonlítása`}
                aria-pressed={isCompared}
              >
                <ArrowLeftRight size={18} aria-hidden="true" />
              </button>
            </div>
          </div>
        </Link>

        <div className="p-3 md:p-6 flex flex-col flex-grow relative z-10">
          {/* Category & Rating row */}
          <div className="mb-1 md:mb-2 flex items-center justify-between">
            <Link 
              href={`/shop?category=${encodeURIComponent(product.category)}`}
              className="text-[10px] md:text-xs font-medium text-purple-400 uppercase tracking-wider truncate max-w-[60%] hover:text-purple-300 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {product.category}
            </Link>
            <div className="flex items-center gap-0.5 md:gap-1 flex-shrink-0">
              <Star size={10} className="md:w-3 md:h-3 text-yellow-400 fill-yellow-400" />
              <span className="text-[10px] md:text-xs font-bold text-white">{product.rating.toFixed(1)}</span>
              <span className="hidden md:inline text-[10px] text-gray-500">({reviewsCount})</span>
            </div>
          </div>

          {/* Product name */}
          <Link href={productUrl} className="group-hover:text-purple-400 transition-colors duration-300">
            <h3 className="text-sm md:text-lg font-bold text-white mb-1 md:mb-2 line-clamp-2 leading-tight">{product.name}</h3>
          </Link>
          
          {/* Description - hidden on mobile */}
          <p className="hidden md:block text-sm text-gray-400 line-clamp-2 mb-4 flex-grow">{product.description}</p>

          {/* Price section */}
          <div className="mt-auto pt-2 md:pt-4 border-t border-white/5 flex items-center justify-between gap-2">
            <div className="flex flex-col">
              {isOnSale && (
                <span className="text-[10px] md:text-xs text-gray-500 line-through decoration-red-500/50">
                  {product.price.toLocaleString('hu-HU')} Ft
                </span>
              )}
              <span className={`text-sm md:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${isOnSale ? 'from-red-500 to-orange-500' : 'from-white to-gray-400'}`}>
                {currentPrice?.toLocaleString('hu-HU')} Ft
              </span>
            </div>
            {/* Mobile add to cart button */}
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="md:hidden w-9 h-9 flex items-center justify-center bg-purple-600 hover:bg-purple-500 rounded-full text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label={hasVariants ? 'Megtekintés' : 'Kosárba'}
            >
              {hasVariants ? <Eye size={16} /> : <Plus size={18} />}
            </button>
          </div>
        </div>
        {/* Only render QuickViewModal when needed to reduce bundle size */}
        {isQuickViewOpen && (
          <QuickViewModal 
            product={product} 
            isOpen={isQuickViewOpen} 
            onClose={() => setIsQuickViewOpen(false)} 
          />
        )}
      </article>
    </>
  )
})

export default ProductCard
