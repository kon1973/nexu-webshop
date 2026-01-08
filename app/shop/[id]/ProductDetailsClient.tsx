'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { useRecentlyViewed } from '@/context/RecentlyViewedContext'
import { useCompare } from '@/context/CompareContext'
import { Check, Minus, Plus, ShoppingCart, Star, Heart, Share2, ArrowLeftRight, X, User, Package, ShieldCheck, Truck, CreditCard, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import FavoriteButton from '@/app/components/FavoriteButton'
import ShareButton from '@/app/components/ShareButton'
import ReviewForm from '@/app/components/ReviewForm'
import CountdownTimer from '@/app/components/CountdownTimer'
import type { Product, Review } from '@prisma/client'
import { getImageUrl } from '@/lib/image'
import { createPortal } from 'react-dom'

type ProductOption = {
  id: string
  name: string
  values: string[]
  productId: number
}

type ProductVariant = {
  id: string
  attributes: any
  price: number
  salePrice?: number | null
  salePercentage?: number | null
  saleStartDate?: Date | string | null
  saleEndDate?: Date | string | null
  stock: number
  images: string[]
  sku?: string | null
  description?: string | null
}

type ProductWithDetails = Product & {
  options: ProductOption[]
  variants: ProductVariant[]
  reviews?: Review[]
  specifications?: any
}

const colorMap: Record<string, string> = {
  // Basic colors
  'Fekete': '#1a1a1a',
  'Fehér': '#ffffff',
  'Ezüst': '#e0e0e0',
  'Arany': '#ffd700',
  'Kék': '#3b82f6',
  'Piros': '#ef4444',
  'Zöld': '#22c55e',
  'Sárga': '#eab308',
  'Szürke': '#6b7280',
  'Rózsaszín': '#ec4899',
  'Lila': '#a855f7',
  'Barna': '#78350f',
  'Narancs': '#f97316',
  // Brand-specific colors
  'Éjfekete': '#1e293b',
  'Csillagfény': '#f8fafc',
  'Asztroszürke': '#4b5563',
  'Grafit': '#374151',
  'Sierra kék': '#93c5fd',
  'Alpesi zöld': '#166534',
  // iPhone/Apple colors
  'Titánszürke': '#8E8E93',
  'Titánfekete': '#3A3A3C',
  'Természetes titán': '#9A9A9D',
  'Sivatagi titán': '#C2B59B',
  'Kék titán': '#4A6E8B',
  'Éjkék': '#1d3557',
  'Mélylila': '#5B21B6',
  'Korallpiros': '#FF6B6B',
  'Mentazöld': '#10B981',
  // Samsung colors
  'Fantomfekete': '#1C1C1E',
  'Fantomfehér': '#F5F5F7',
  'Fantomezüst': '#D1D1D6',
  'Krémfehér': '#FFF8E7',
  'Levendula': '#E6E6FA',
  'Borostyán sárga': '#FFB000',
  'Olívazöld': '#708238',
  'Ködszürke': '#B0B0B0',
  'Tengerkék': '#006994',
  // Generic tech colors
  'Kozmoszfekete': '#0D0D0D',
  'Holdezüst': '#C0C0C0',
  'Rózsaarany': '#B76E79',
  'Gyöngyház': '#EAE0C8',
}

export default function ProductDetailsClient({ product, url }: { product: ProductWithDetails; url: string }) {
  const router = useRouter()
  const { addToCart, openCart } = useCart()
  const { addProductToHistory } = useRecentlyViewed()
  const { addToCompare, removeFromCompare, isInCompare } = useCompare()
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(product.image)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description')
  const [showStickyBar, setShowStickyBar] = useState(false)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const addToCartRef = useRef<HTMLDivElement>(null)

  const isCompared = isInCompare(product.id)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show bar when element is not intersecting and is above the viewport (top < 0)
        setShowStickyBar(!entry.isIntersecting && entry.boundingClientRect.top < 0)
      },
      { threshold: 0 }
    )

    if (addToCartRef.current) {
      observer.observe(addToCartRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const handleCompare = () => {
    if (isCompared) {
      removeFromCompare(product.id)
      toast.info('Eltávolítva az összehasonlításból')
    } else {
      addToCompare(product)
      toast.success('Hozzáadva az összehasonlításhoz')
    }
  }

  useEffect(() => {
    addProductToHistory(product.id)
  }, [product.id, addProductToHistory])

  // Derive attributes from variants if options are empty (new system)
  const attributes = useMemo(() => {
    if (product.options && product.options.length > 0) return product.options
    
    if (!product.variants || product.variants.length === 0) return []

    const attrs: Record<string, Set<string>> = {}
    product.variants.forEach((v: ProductVariant) => {
      const vAttrs = v.attributes as Record<string, string>
      if (vAttrs) {
        Object.entries(vAttrs).forEach(([key, val]) => {
          if (!attrs[key]) attrs[key] = new Set()
          attrs[key].add(val)
        })
      }
    })

    return Object.entries(attrs).map(([name, values]) => ({
      id: name,
      name,
      values: Array.from(values),
      productId: product.id
    }))
  }, [product.options, product.variants, product.id])

  // Find matching variant
  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) return null
    
    // Only try to find variant if we have selected all attributes
    const allSelected = attributes.every((attr: ProductOption) => selectedOptions[attr.name])
    if (!allSelected) return null

    return product.variants.find((v: ProductVariant) => {
      const vAttrs = v.attributes as Record<string, string>
      return Object.entries(selectedOptions).every(([key, val]) => vAttrs[key] === val)
    })
  }, [product.variants, selectedOptions, attributes])

  // Get available values for each option based on current selections
  const getAvailableValues = useMemo(() => {
    if (!product.variants || product.variants.length === 0) return {}
    
    const availability: Record<string, Record<string, { available: boolean; inStock: boolean; priceRange?: { min: number; max: number }; image?: string }>> = {}
    
    attributes.forEach((attr: ProductOption) => {
      availability[attr.name] = {}
      attr.values.forEach(val => {
        // Check if this value is available given other selections
        const otherSelections = Object.entries(selectedOptions).filter(([k]) => k !== attr.name)
        
        const matchingVariants = product.variants.filter((v: ProductVariant) => {
          const vAttrs = v.attributes as Record<string, string>
          // Must match this value
          if (vAttrs[attr.name] !== val) return false
          // Must match all other selections
          return otherSelections.every(([k, selectedVal]) => vAttrs[k] === selectedVal)
        })
        
        const hasStock = matchingVariants.some((v: ProductVariant) => v.stock > 0)
        const prices = matchingVariants.map((v: ProductVariant) => v.salePrice || v.price)
        const image = matchingVariants[0]?.images?.[0]
        
        availability[attr.name][val] = {
          available: matchingVariants.length > 0,
          inStock: hasStock,
          priceRange: prices.length > 0 ? { min: Math.min(...prices), max: Math.max(...prices) } : undefined,
          image: image
        }
      })
    })
    
    return availability
  }, [product.variants, selectedOptions, attributes])

  const now = new Date()
  
  const isProductOnSale = product.salePrice && 
    (!product.saleStartDate || new Date(product.saleStartDate) <= now) && 
    (!product.saleEndDate || new Date(product.saleEndDate) >= now)

  const isVariantOnSale = selectedVariant && selectedVariant.salePrice &&
    (!selectedVariant.saleStartDate || new Date(selectedVariant.saleStartDate) <= now) &&
    (!selectedVariant.saleEndDate || new Date(selectedVariant.saleEndDate) >= now)

  const isOnSale = selectedVariant ? isVariantOnSale : isProductOnSale

  // Update displayed price and stock
  const currentPrice = selectedVariant 
    ? (isVariantOnSale ? selectedVariant.salePrice : selectedVariant.price)
    : (isProductOnSale ? product.salePrice : product.price)

  const currentSaleEndDate = selectedVariant 
    ? (isVariantOnSale ? selectedVariant.saleEndDate : null)
    : (isProductOnSale ? product.saleEndDate : null)
    
  const originalPrice = selectedVariant
    ? (isVariantOnSale ? selectedVariant.price : null)
    : (isProductOnSale ? product.price : null)

  const currentStock = selectedVariant ? selectedVariant.stock : product.stock

  const stockPercentage = Math.min(100, Math.max(0, (currentStock / 50) * 100))
  const stockColor = stockPercentage < 20 ? 'bg-red-500' : stockPercentage < 50 ? 'bg-yellow-500' : 'bg-green-500'

  // Calculate discount percentage
  let discountPercentage = 0
  if (isOnSale && currentPrice && originalPrice) {
    if (selectedVariant && selectedVariant.salePercentage) {
      discountPercentage = selectedVariant.salePercentage
    } else if (!selectedVariant && product.salePercentage) {
      discountPercentage = product.salePercentage
    } else {
      discountPercentage = Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    }
  }
  
  // Update image when variant changes
  useEffect(() => {
    if (selectedVariant && selectedVariant.images && selectedVariant.images.length > 0) {
      setSelectedImage(selectedVariant.images[0])
    } else if (!selectedVariant && product.image) {
      // Optional: reset to main image if no variant selected? 
      // Or keep user selection. Let's keep user selection unless variant forces it.
    }
  }, [selectedVariant, product.image])

  const maxQuantity = Math.max(0, currentStock)
  const isOutOfStock = maxQuantity <= 0

  const allOptionsSelected = attributes.every((opt: ProductOption) => selectedOptions[opt.name])

  const handleOptionSelect = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionName]: value,
    }))
  }

  const handleAddToCart = () => {
    if (!allOptionsSelected) {
      toast.error('Kérlek válassz minden opcióból!')
      return
    }

    if (product.variants.length > 0 && !selectedVariant) {
       toast.error('Ez a variáció jelenleg nem elérhető.')
       return
    }

    const added = addToCart(
      {
        id: product.id,
        name: product.name,
        price: currentPrice!,
        originalPrice: originalPrice || undefined,
        image: selectedImage,
        category: product.category,
        stock: currentStock,
        variantId: selectedVariant?.id
      },
      quantity,
      selectedOptions
    )

    if (added <= 0) {
      if (currentStock <= 0) {
        toast.error('Sajnos ez a termék elfogyott.')
      } else {
        toast.info('Ebből a termékből ennyit már betettél a kosárba.')
      }
      return
    }

    toast.success(`${product.name} kosárba került!`, {
      description: `+${added} db hozzáadva`,
      action: {
        label: 'Megtekintés',
        onClick: () => openCart()
      }
    })
  }

  const handleBuyNow = () => {
    if (!allOptionsSelected) {
      toast.error('Kérlek válassz minden opcióból!')
      return
    }

    if (product.variants.length > 0 && !selectedVariant) {
       toast.error('Ez a variáció jelenleg nem elérhető.')
       return
    }

    addToCart(
      {
        id: product.id,
        name: product.name,
        price: currentPrice!,
        originalPrice: originalPrice || undefined,
        image: selectedImage,
        category: product.category,
        stock: currentStock,
        variantId: selectedVariant?.id
      },
      quantity,
      selectedOptions
    )
    
    router.push('/checkout')
  }

  const allImages = useMemo(() => {
    const imgs = [product.image, ...product.images].filter(Boolean)
    // Deduplicate
    return Array.from(new Set(imgs))
  }, [product.image, product.images])

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    const currentIndex = allImages.indexOf(selectedImage || allImages[0])
    const nextIndex = (currentIndex + 1) % allImages.length
    setSelectedImage(allImages[nextIndex])
  }

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    const currentIndex = allImages.indexOf(selectedImage || allImages[0])
    const prevIndex = (currentIndex - 1 + allImages.length) % allImages.length
    setSelectedImage(allImages[prevIndex])
  }

  return (
    <div className="space-y-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Left Column: Images */}
      <div className="space-y-4 lg:sticky lg:top-24 h-fit">
        <div 
          className="bg-[#121212] border border-white/5 rounded-3xl p-8 md:p-12 flex items-center justify-center relative group aspect-square overflow-hidden shadow-2xl shadow-black/50 cursor-zoom-in"
          onClick={() => setIsLightboxOpen(true)}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Display selected image */}
          {getImageUrl(selectedImage) ? (
            <div className="relative w-full h-full z-10">
              <Image
                src={getImageUrl(selectedImage)!}
                alt={product.name}
                fill
                className="object-contain animate-in zoom-in duration-500 group-hover:scale-105 transition-transform"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          ) : (
            <Package size={128} className="text-gray-500 animate-in zoom-in duration-500 group-hover:scale-110 transition-transform relative z-10" />
          )}

          <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-black/50 backdrop-blur-md p-2 rounded-full text-white">
              <ZoomIn size={20} />
            </div>
          </div>

          {allImages.length > 1 && (
            <>
              <button 
                onClick={handlePrevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={handleNextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          {product.images.length > 0 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedImage(img)
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    selectedImage === img ? 'bg-purple-500 w-6' : 'bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {allImages.length > 1 && (
          <div className="grid grid-cols-4 gap-4">
            {allImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(img)}
                className={`aspect-square rounded-xl border-2 overflow-hidden transition-all relative ${
                  selectedImage === img ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-transparent opacity-50 hover:opacity-100'
                }`}
              >
                {getImageUrl(img) ? (
                  <Image src={getImageUrl(img)!} alt={`${product.name} - ${idx + 1}. kép`} fill className="object-cover" sizes="100px" />
                ) : (
                  <div className="w-full h-full bg-[#121212] flex items-center justify-center text-2xl">
                    <Package size={24} className="text-gray-500" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
        
        <div className="flex justify-center">
            <button
                onClick={handleCompare}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors ${
                  isCompared
                    ? 'bg-purple-600 border-purple-500 text-white'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <ArrowLeftRight size={16} />
                <span className="text-sm font-medium">{isCompared ? "Eltávolítás az összehasonlításból" : "Összehasonlítás"}</span>
            </button>
        </div>
      </div>

      {/* Right Column: Details */}
      <div className="space-y-8">
        <div>
          <div className="flex items-center justify-between mb-4">
            <a 
              href={`/shop?category=${encodeURIComponent(product.category)}`}
              className="text-purple-400 text-sm font-bold tracking-wider uppercase bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20 hover:bg-purple-500/20 transition-colors"
            >
              {product.category}
            </a>
            <div className="flex gap-2">
              <ShareButton url={url} title={product.name} text={product.description || product.name} />
              <FavoriteButton product={product} />
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            {product.name}
          </h1>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-1 text-yellow-400">
              <Star className="fill-yellow-400" size={20} />
              <span className="font-bold text-lg">{product.rating.toFixed(1)}</span>
            </div>
            <span className="text-gray-600">|</span>
            <span className="text-gray-400">{product.reviews?.length || 0} értékelés</span>
          </div>

          <div className="mb-6">
            <div className="text-3xl font-bold text-white flex items-baseline gap-2 mb-2">
              {currentPrice?.toLocaleString('hu-HU')} Ft
              {originalPrice && (
                <>
                  <span className="text-lg text-gray-500 line-through font-normal decoration-red-500/50 ml-2">
                    {originalPrice.toLocaleString('hu-HU')} Ft
                  </span>
                  {discountPercentage > 0 && (
                    <span className="ml-2 px-2 py-1 bg-red-500/20 text-red-400 text-sm font-bold rounded-lg border border-red-500/20">
                      -{discountPercentage}%
                    </span>
                  )}
                </>
              )}
              {selectedVariant && selectedVariant.price !== product.price && !originalPrice && !isVariantOnSale && (
                <span className="text-sm text-gray-500 line-through font-normal">
                  {product.price.toLocaleString('hu-HU')} Ft
                </span>
              )}
            </div>
            
            {isOnSale && currentSaleEndDate && (
              <CountdownTimer targetDate={currentSaleEndDate} />
            )}

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isOutOfStock ? 'bg-red-500' : currentStock < 5 ? 'bg-yellow-500' : 'bg-green-500'}`} />
              <span className={`text-sm font-medium ${isOutOfStock ? 'text-red-400' : currentStock < 5 ? 'text-yellow-400' : 'text-green-400'}`}>
                {isOutOfStock 
                  ? 'Nincs készleten' 
                  : currentStock < 5 
                    ? `Utolsó darabok! (${currentStock} db)` 
                    : 'Raktáron'}
              </span>
            </div>
          </div>

          <p className="text-gray-400 leading-relaxed text-lg">
            {selectedVariant?.description || product.description}
          </p>
        </div>

        {/* Options / Variants */}
        {attributes.length > 0 && (
          <div data-variant-section className="space-y-6 border-t border-white/10 pt-6">
            {attributes.map((opt: ProductOption, optIndex: number) => {
              const isColor = opt.name.toLowerCase() === 'szín' || opt.name.toLowerCase() === 'color'
              const isSize = opt.name.toLowerCase() === 'méret' || opt.name.toLowerCase() === 'size' || opt.name.toLowerCase() === 'tárhely' || opt.name.toLowerCase() === 'storage'
              const optAvailability = getAvailableValues[opt.name] || {}
              
              return (
                <div key={opt.id} className="animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: `${optIndex * 100}ms` }}>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">{opt.name}</h3>
                      {!selectedOptions[opt.name] && (
                        <span className="text-xs text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full border border-yellow-500/20">
                          Válassz!
                        </span>
                      )}
                    </div>
                    {selectedOptions[opt.name] && (
                      <span className="text-sm font-medium px-3 py-1 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/20">
                        {selectedOptions[opt.name]}
                      </span>
                    )}
                  </div>
                  
                  {/* Color swatches with enhanced UI */}
                  {isColor ? (
                    <div className="flex flex-wrap gap-3">
                      {opt.values.map((val) => {
                        const isSelected = selectedOptions[opt.name] === val
                        const colorHex = colorMap[val] || '#808080'
                        const availability = optAvailability[val]
                        const isAvailable = availability?.available !== false
                        const isInStock = availability?.inStock !== false
                        
                        return (
                          <div key={val} className="relative group">
                            <button
                              onClick={() => isAvailable && handleOptionSelect(opt.name, val)}
                              disabled={!isAvailable}
                              className={`w-12 h-12 rounded-full border-2 transition-all relative ${
                                isSelected
                                  ? 'border-purple-500 scale-110 shadow-[0_0_15px_rgba(168,85,247,0.5)] ring-2 ring-purple-500/30 ring-offset-2 ring-offset-[#0a0a0a]'
                                  : isAvailable
                                    ? 'border-white/20 hover:border-white/50 hover:scale-105'
                                    : 'border-white/5 opacity-30 cursor-not-allowed'
                              }`}
                              style={{ backgroundColor: colorHex }}
                            >
                              {(val === 'Fehér' || val === 'Csillagfény') && (
                                <div className="absolute inset-0 rounded-full border border-black/10" />
                              )}
                              {isSelected && (
                                <div className={`absolute inset-0 flex items-center justify-center ${val === 'Fehér' || val === 'Csillagfény' ? 'text-black' : 'text-white'}`}>
                                  <Check size={18} strokeWidth={3} />
                                </div>
                              )}
                              {!isInStock && isAvailable && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-full h-0.5 bg-red-500 rotate-45 absolute" />
                                </div>
                              )}
                            </button>
                            
                            {/* Tooltip with name, price, and preview */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-20">
                              <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-3 shadow-xl min-w-[120px] text-center">
                                {availability?.image && (
                                  <div className="w-16 h-16 mx-auto mb-2 rounded-lg overflow-hidden bg-[#0a0a0a]">
                                    <Image 
                                      src={getImageUrl(availability.image) || ''} 
                                      alt={val} 
                                      width={64} 
                                      height={64} 
                                      className="object-contain w-full h-full"
                                    />
                                  </div>
                                )}
                                <p className="text-white font-medium text-sm">{val}</p>
                                {!isInStock && isAvailable && (
                                  <p className="text-red-400 text-xs mt-1">Nincs készleten</p>
                                )}
                                {availability?.priceRange && (
                                  <p className="text-gray-400 text-xs mt-1">
                                    {availability.priceRange.min === availability.priceRange.max 
                                      ? `${availability.priceRange.min.toLocaleString('hu-HU')} Ft`
                                      : `${availability.priceRange.min.toLocaleString('hu-HU')} - ${availability.priceRange.max.toLocaleString('hu-HU')} Ft`
                                    }
                                  </p>
                                )}
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full">
                                  <div className="border-8 border-transparent border-t-[#1a1a1a]" />
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : isSize ? (
                    /* Size/Storage grid layout */
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {opt.values.map((val) => {
                        const isSelected = selectedOptions[opt.name] === val
                        const availability = optAvailability[val]
                        const isAvailable = availability?.available !== false
                        const isInStock = availability?.inStock !== false
                        const price = availability?.priceRange?.min
                        
                        return (
                          <button
                            key={val}
                            onClick={() => isAvailable && handleOptionSelect(opt.name, val)}
                            disabled={!isAvailable}
                            className={`relative p-3 rounded-xl border-2 font-medium transition-all text-left ${
                              isSelected
                                ? 'border-purple-500 bg-purple-500/10 shadow-[0_0_20px_rgba(168,85,247,0.3)] ring-1 ring-purple-500/30'
                                : isAvailable
                                  ? isInStock
                                    ? 'border-white/10 hover:border-white/30 bg-white/5 hover:bg-white/10'
                                    : 'border-white/5 bg-white/[0.02] hover:border-white/10'
                                  : 'border-white/5 bg-white/[0.02] opacity-40 cursor-not-allowed'
                            }`}
                          >
                            <div className="flex flex-col gap-1">
                              <span className={`font-bold ${isSelected ? 'text-white' : isAvailable ? 'text-gray-200' : 'text-gray-500'}`}>
                                {val}
                              </span>
                              {price && price !== product.price && (
                                <span className={`text-xs ${price > product.price ? 'text-amber-400' : 'text-green-400'}`}>
                                  {price > product.price ? '+' : ''}{(price - product.price).toLocaleString('hu-HU')} Ft
                                </span>
                              )}
                              {!isInStock && isAvailable && (
                                <span className="text-xs text-red-400">Elfogyott</span>
                              )}
                            </div>
                            {isSelected && (
                              <div className="absolute top-2 right-2">
                                <Check size={16} className="text-purple-400" />
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    /* Default button layout for other options */
                    <div className="flex flex-wrap gap-2">
                      {opt.values.map((val) => {
                        const isSelected = selectedOptions[opt.name] === val
                        const availability = optAvailability[val]
                        const isAvailable = availability?.available !== false
                        const isInStock = availability?.inStock !== false
                        
                        return (
                          <button
                            key={val}
                            onClick={() => isAvailable && handleOptionSelect(opt.name, val)}
                            disabled={!isAvailable}
                            className={`px-5 py-2.5 rounded-xl border-2 font-medium transition-all flex items-center gap-2 ${
                              isSelected
                                ? 'border-purple-500 bg-purple-500/10 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                                : isAvailable
                                  ? isInStock
                                    ? 'border-white/10 text-gray-300 hover:border-white/30 hover:text-white bg-white/5'
                                    : 'border-white/5 text-gray-500 bg-white/[0.02]'
                                  : 'border-white/5 text-gray-600 bg-white/[0.02] opacity-40 cursor-not-allowed line-through'
                            }`}
                          >
                            {val}
                            {!isInStock && isAvailable && (
                              <span className="text-xs text-red-400 font-normal">(0 db)</span>
                            )}
                            {isSelected && <Check size={14} className="text-purple-400" />}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
            
            {/* Selected variant summary */}
            {selectedVariant && (
              <div className="mt-4 p-4 bg-gradient-to-r from-purple-500/5 to-blue-500/5 border border-white/10 rounded-xl animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {selectedVariant.images?.[0] && (
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#121212] border border-white/10">
                        <Image 
                          src={getImageUrl(selectedVariant.images[0]) || ''} 
                          alt="Kiválasztott variáció" 
                          width={48} 
                          height={48} 
                          className="object-contain w-full h-full"
                        />
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-400">Kiválasztott variáció</p>
                      <p className="text-white font-medium">
                        {Object.values(selectedOptions).join(' / ')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-white">
                      {currentPrice?.toLocaleString('hu-HU')} Ft
                    </p>
                    <p className={`text-sm ${selectedVariant.stock > 0 ? selectedVariant.stock < 5 ? 'text-yellow-400' : 'text-green-400' : 'text-red-400'}`}>
                      {selectedVariant.stock > 0 ? `${selectedVariant.stock} db készleten` : 'Nincs készleten'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Add to Cart */}
        <div ref={addToCartRef} className="border-t border-white/10 pt-8 space-y-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center bg-[#121212] border border-white/10 rounded-xl p-1">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-3 hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50"
                disabled={quantity <= 1 || isOutOfStock}
              >
                <Minus size={18} />
              </button>
              <span className="w-12 text-center font-bold text-lg">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                className="p-3 hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50"
                disabled={quantity >= maxQuantity || isOutOfStock}
              >
                <Plus size={18} />
              </button>
            </div>

            <div className="flex-1 flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || (attributes.length > 0 && !allOptionsSelected)}
                className="flex-1 bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
              >
                <ShoppingCart size={20} />
                {isOutOfStock ? 'Elfogyott' : 'Kosárba'}
              </button>
              
              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock || (attributes.length > 0 && !allOptionsSelected)}
                className="flex-1 bg-purple-600 text-white font-bold py-4 rounded-xl hover:bg-purple-500 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_30px_rgba(147,51,234,0.5)]"
              >
                <CreditCard size={20} />
                Vásárlás
              </button>
            </div>
          </div>
          
          {attributes.length > 0 && !allOptionsSelected && !isOutOfStock && (
             <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl">
               <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                 <Package className="text-amber-400" size={20} />
               </div>
               <div>
                 <p className="text-amber-400 font-medium">Válassz variációt!</p>
                 <p className="text-amber-400/70 text-sm">
                   {attributes.filter((a: ProductOption) => !selectedOptions[a.name]).map((a: ProductOption) => a.name).join(', ')} opció(k) kiválasztása szükséges
                 </p>
               </div>
             </div>
          )}
          
          {isOutOfStock && (
            <p className="text-red-400 text-sm text-center font-medium">
              Jelenleg nincs készleten ebből a variációból.
            </p>
          )}
          
          {currentStock > 0 && (
             <div className="space-y-2">
               <div className="flex justify-between text-xs font-medium">
                 <span className={`${currentStock < 5 ? 'text-red-400' : 'text-green-400'}`}>
                   {currentStock < 5 ? `Már csak ${currentStock} db maradt!` : 'Készleten'}
                 </span>
               </div>
               <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                 <div 
                   className={`h-full ${stockColor} transition-all duration-500`} 
                   style={{ width: `${stockPercentage}%` }}
                 />
               </div>
             </div>
          )}
        </div>

        {/* Features / Trust Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-white/10">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 flex-shrink-0">
              <Truck size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-400">Szállítás</p>
              <p className="text-sm font-bold text-white">Ingyenes 20e Ft+</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 flex-shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-400">Garancia</p>
              <p className="text-sm font-bold text-white">2 év garancia</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 flex-shrink-0">
              <CreditCard size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-400">Fizetés</p>
              <p className="text-sm font-bold text-white">Biztonságos</p>
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* Tabs Section */}
      <div className="col-span-1 lg:col-span-2 mt-12">
        <div className="bg-[#121212] border border-white/5 rounded-3xl overflow-hidden">
          {/* Tab Headers */}
          <div className="flex border-b border-white/5 overflow-x-auto">
            <button 
              onClick={() => setActiveTab('description')}
              className={`flex-1 min-w-[120px] py-6 text-lg font-bold transition-colors relative ${activeTab === 'description' ? 'text-white bg-white/5' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
            >
              Leírás
              {activeTab === 'description' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-500" />}
            </button>
            <button 
              onClick={() => setActiveTab('specs')}
              className={`flex-1 min-w-[120px] py-6 text-lg font-bold transition-colors relative ${activeTab === 'specs' ? 'text-white bg-white/5' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
            >
              Specifikációk
              {activeTab === 'specs' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-500" />}
            </button>
            <button 
              onClick={() => setActiveTab('reviews')}
              className={`flex-1 min-w-[120px] py-6 text-lg font-bold transition-colors relative ${activeTab === 'reviews' ? 'text-white bg-white/5' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
            >
              Vélemények ({product.reviews?.length || 0})
              {activeTab === 'reviews' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-500" />}
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-8 md:p-12 min-h-[400px]">
            {activeTab === 'description' && (
              <div className="prose prose-invert prose-lg max-w-none">
                {product.fullDescription ? (
                  <div dangerouslySetInnerHTML={{ __html: product.fullDescription }} />
                ) : (
                  <p className="text-gray-400 leading-relaxed text-lg">{product.description}</p>
                )}
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="max-w-4xl mx-auto">
                {product.specifications && Array.isArray(product.specifications) && product.specifications.length > 0 ? (
                  <table className="w-full text-left border-collapse">
                    <tbody>
                      {(product.specifications as any[]).map((spec, idx) => {
                        if (spec.type === 'header') {
                          return (
                            <tr key={idx}>
                              <td colSpan={2} className="pt-12 pb-4">
                                <h4 className="text-xl font-bold text-purple-400 uppercase tracking-wider border-b border-purple-500/20 pb-2 flex items-center gap-3">
                                  <span className="w-2 h-8 bg-purple-500 rounded-full"></span>
                                  {spec.key}
                                </h4>
                              </td>
                            </tr>
                          )
                        }

                        return (
                          <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                            <td className="py-4 pr-4 text-gray-400 font-medium w-1/3 align-top group-hover:text-gray-200 transition-colors">{spec.key}</td>
                            <td className="py-4 text-white align-top font-medium">
                              {spec.type === 'boolean' ? (
                                spec.value ? (
                                  <div className="flex items-center gap-2 text-green-400 bg-green-400/10 w-fit px-3 py-1 rounded-full">
                                    <Check size={16} />
                                    <span className="text-sm">Igen</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 text-red-400 bg-red-400/10 w-fit px-3 py-1 rounded-full">
                                    <X size={16} />
                                    <span className="text-sm">Nem</span>
                                  </div>
                                )
                              ) : (
                                spec.value
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">Ehhez a termékhez nincsenek részletes specifikációk megadva.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                  <div className="md:col-span-1 space-y-8">
                    {/* Rating Distribution */}
                    {product.reviews && product.reviews.length > 0 && (
                      <div className="bg-[#121212] p-6 rounded-2xl border border-white/5">
                        <div className="text-center mb-6">
                          <div className="text-5xl font-bold text-white mb-2">{product.rating.toFixed(1)}</div>
                          <div className="flex justify-center gap-1 text-yellow-400 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={20} fill={i < Math.round(product.rating) ? 'currentColor' : 'none'} />
                            ))}
                          </div>
                          <p className="text-sm text-gray-400">{product.reviews.length} értékelés alapján</p>
                        </div>
                        
                        <div className="space-y-2">
                          {[5, 4, 3, 2, 1].map((star) => {
                            const count = product.reviews!.filter(r => r.rating === star).length
                            const percentage = (count / product.reviews!.length) * 100
                            return (
                              <div key={star} className="flex items-center gap-3 text-sm">
                                <span className="w-3 font-bold text-white">{star}</span>
                                <Star size={12} className="text-gray-500" />
                                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-yellow-400 rounded-full" 
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                <span className="w-8 text-right text-gray-500">{count}</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    <div>
                      <h3 className="text-xl font-bold text-white mb-4">Írd meg a véleményed</h3>
                      <ReviewForm productId={product.id} />
                    </div>
                  </div>
                  
                  <div className="md:col-span-2 space-y-6">
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                      Vásárlói értékelések
                      <span className="text-sm bg-white/10 px-2 py-1 rounded-full text-gray-400 border border-white/5">
                        {product.reviews?.length || 0} db
                      </span>
                    </h3>

                    {!product.reviews || product.reviews.length === 0 ? (
                      <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/5">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500">
                          <Star size={32} />
                        </div>
                        <p className="text-lg font-medium text-white">Még nem érkezett értékelés.</p>
                        <p className="text-gray-400">Légy Te az első, aki értékeli ezt a terméket!</p>
                      </div>
                    ) : (
                      product.reviews.map((review: Review) => (
                        <div
                          key={review.id}
                          className="bg-[#121212] border border-white/5 rounded-2xl p-6 hover:border-purple-500/30 transition-all hover:shadow-lg hover:shadow-purple-500/5"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center text-white border border-white/10">
                                <User size={20} />
                              </div>
                              <div>
                                <p className="font-bold text-white leading-tight">{review.userName}</p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {new Date(review.createdAt).toLocaleDateString('hu-HU', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                  })}
                                </p>
                              </div>
                            </div>

                            <div className="flex gap-0.5 text-yellow-500 bg-yellow-500/5 px-2 py-1 rounded-lg border border-yellow-500/10">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={14}
                                  fill={i < review.rating ? 'currentColor' : 'none'}
                                  className={i < review.rating ? '' : 'text-gray-700 opacity-30'}
                                />
                              ))}
                            </div>
                          </div>

                          <p className="text-gray-300 leading-relaxed">{review.text}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Add to Cart Bar */}
      <div className={`fixed bottom-0 left-0 w-full bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/10 p-4 z-50 transition-transform duration-300 ${showStickyBar ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="container mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-lg bg-white p-1 relative overflow-hidden">
               <Image 
                 src={getImageUrl(selectedImage) || '/placeholder.png'} 
                 alt={product.name} 
                 fill
                 sizes="48px"
                 className="object-contain" 
               />
             </div>
             <div className="hidden md:block">
               <h3 className="font-bold text-white line-clamp-1">{product.name}</h3>
               <div className="flex items-center gap-2">
                 <p className="text-purple-400 font-bold">{(currentPrice ?? 0).toLocaleString('hu-HU')} Ft</p>
                 {attributes.length > 0 && !allOptionsSelected && (
                   <span className="text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                     Válassz variációt
                   </span>
                 )}
                 {selectedVariant && (
                   <span className="text-xs text-gray-400">
                     {Object.values(selectedOptions).join(' · ')}
                   </span>
                 )}
               </div>
             </div>
          </div>
          
          <div className="flex items-center gap-4">
             {/* Show mini variant selector on mobile if not all selected */}
             {attributes.length > 0 && !allOptionsSelected && (
               <button
                 onClick={() => {
                   // Scroll to variants section
                   const variantSection = document.querySelector('[data-variant-section]')
                   variantSection?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                 }}
                 className="sm:hidden flex items-center gap-2 px-3 py-2 bg-amber-500/20 border border-amber-500/30 rounded-lg text-amber-400 text-sm font-medium"
               >
                 <Package size={16} />
                 Válassz
               </button>
             )}
             
             <div className="hidden sm:flex items-center bg-[#121212] border border-white/10 rounded-lg p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-white/5 rounded-md transition-colors disabled:opacity-50"
                  disabled={quantity <= 1 || isOutOfStock}
                >
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center font-bold text-sm">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                  className="p-2 hover:bg-white/5 rounded-md transition-colors disabled:opacity-50"
                  disabled={quantity >= maxQuantity || isOutOfStock}
                >
                  <Plus size={14} />
                </button>
             </div>

             <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || (attributes.length > 0 && !allOptionsSelected)}
                className="bg-white text-black font-bold px-6 py-3 rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart size={18} />
                <span className="hidden sm:inline">Kosárba</span>
              </button>
          </div>
        </div>
      </div>
      {/* Lightbox Modal */}
      {isLightboxOpen && createPortal(
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center animate-in fade-in duration-200">
          <button 
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 p-2 text-white/50 hover:text-white transition-colors z-50"
          >
            <X size={32} />
          </button>

          <div className="relative w-full h-full max-w-7xl max-h-[90vh] p-4 flex items-center justify-center">
             {getImageUrl(selectedImage) && (
               <div className="relative w-full h-full">
                 <Image
                   src={getImageUrl(selectedImage)!}
                   alt={product.name}
                   fill
                   className="object-contain"
                   priority
                   sizes="100vw"
                 />
               </div>
             )}
             
             {allImages.length > 1 && (
               <>
                 <button 
                   onClick={handlePrevImage}
                   className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full backdrop-blur-md transition-all"
                 >
                   <ChevronLeft size={32} />
                 </button>
                 <button 
                   onClick={handleNextImage}
                   className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full backdrop-blur-md transition-all"
                 >
                   <ChevronRight size={32} />
                 </button>
               </>
             )}

             <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-full px-4 py-2">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedImage(img)
                    }}
                    className={`w-16 h-16 relative rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                      selectedImage === img ? 'border-purple-500 opacity-100' : 'border-transparent opacity-50 hover:opacity-100'
                    }`}
                  >
                    <Image src={getImageUrl(img)!} alt={`${product.name} - ${idx + 1}. kép`} fill className="object-cover" />
                  </button>
                ))}
             </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
