'use client'

import { useState, useEffect, useTransition, useCallback, useMemo, memo } from 'react'
import FilterPanel from './FilterPanel'
import { useFavorites } from '@/context/FavoritesContext'
import ProductCard from '@/app/components/ProductCard'
import ProductCardList from '@/app/components/ProductCardList'
import BannerCarousel from '@/app/components/BannerCarousel'
import AISearchSuggestions from '@/app/components/AISearchSuggestions'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import type { Product, Banner, Category, Brand } from '@prisma/client'
import { SearchX, X, ChevronLeft, ChevronRight, Loader2, LayoutGrid, List } from 'lucide-react'
import RecentlyViewed from '@/app/components/RecentlyViewed'
import type { SelectedSpec } from './SpecificationFilters'
import { getSiteUrl } from '@/lib/site'

type ProductWithVariants = Product & {
  variants: { id: string }[]
  _count: { reviews: number }
}

type Props = {
  products: ProductWithVariants[]
  banners: Banner[]
  totalCount: number
  currentPage: number
  totalPages: number
  categories: Category[]
  brands: Brand[]
  globalMaxPrice: number
  currentCategory?: Category | null
}

export default function ShopClient({ 
  products, 
  banners, 
  totalCount, 
  currentPage, 
  totalPages,
  categories,
  brands,
  globalMaxPrice,
  currentCategory
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  
  const { favorites } = useFavorites()

  // View mode state (grid or list)
  type ViewMode = 'grid' | 'list'
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('nexu-view-mode') as ViewMode) || 'grid'
    }
    return 'grid'
  })

  // Save view mode to localStorage
  useEffect(() => {
    localStorage.setItem('nexu-view-mode', viewMode)
  }, [viewMode])

  // Local state for UI inputs (debouncing etc)
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  
  // Sync local state with URL
  useEffect(() => {
    setSearchTerm(searchParams.get('search') || '')
  }, [searchParams])

  const updateFilter = useCallback((key: string, value: string | number | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === null || value === '' || value === 0) {
      params.delete(key)
    } else {
      params.set(key, String(value))
    }
    
    // Reset page when filtering
    if (key !== 'page') {
      params.delete('page')
    }

    // Use startTransition for non-blocking navigation
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    })
  }, [searchParams, pathname, router])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      const current = searchParams.get('search') || ''
      if (searchTerm !== current) {
        updateFilter('search', searchTerm)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(page))
    router.push(`${pathname}?${params.toString()}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleReset = () => {
    router.push(pathname)
    setSearchTerm('')
  }

  // Derived state for FilterPanel
  const selectedCategorySlug = searchParams.get('category') || ''
  const currentSort = searchParams.get('sort') || 'newest'
  const currentMinPrice = Number(searchParams.get('minPrice')) || 0
  const currentMaxPrice = Number(searchParams.get('maxPrice')) || globalMaxPrice
  
  // New filter states from URL
  const inStock = searchParams.get('inStock') === 'true'
  const onSale = searchParams.get('onSale') === 'true'
  const isNew = searchParams.get('isNew') === 'true'
  const minRating = Number(searchParams.get('minRating')) || 0
  const selectedBrand = searchParams.get('brand') || ''
  
  // Specification filters from URL
  // Format: specs=key1:value1,value2;key2:value3 (text/range specs)
  // Format: boolSpecs=key1:true;key2:false (boolean specs)
  const parseSpecs = (specString: string | null, boolSpecString: string | null): SelectedSpec[] => {
    const result: SelectedSpec[] = []
    
    // Parse text/range specs
    if (specString) {
      try {
        const textSpecs = specString.split(';').filter(Boolean).map(part => {
          const [key, valuesStr] = part.split(':')
          return { 
            key: decodeURIComponent(key), 
            values: valuesStr?.split(',').map(v => decodeURIComponent(v)) || [],
            type: 'text' as const
          }
        }).filter(s => s.key && s.values && s.values.length > 0)
        result.push(...textSpecs)
      } catch {
        // ignore parse errors
      }
    }
    
    // Parse boolean specs
    if (boolSpecString) {
      try {
        const boolSpecs = boolSpecString.split(';').filter(Boolean).map(part => {
          const [key, valueStr] = part.split(':')
          return { 
            key: decodeURIComponent(key), 
            boolValue: valueStr === 'true',
            type: 'boolean' as const
          }
        }).filter(s => s.key)
        result.push(...boolSpecs)
      } catch {
        // ignore parse errors
      }
    }
    
    return result
  }
  
  const selectedSpecs = parseSpecs(searchParams.get('specs'), searchParams.get('boolSpecs'))
  
  const updateSpecs = (newSpecs: SelectedSpec[]) => {
    const params = new URLSearchParams(searchParams.toString())
    
    // Separate text/range specs and boolean specs
    const textSpecs = newSpecs.filter(s => s.type !== 'boolean' && s.values && s.values.length > 0)
    const boolSpecs = newSpecs.filter(s => s.type === 'boolean' && s.boolValue !== undefined)
    
    // Update text specs
    if (textSpecs.length === 0) {
      params.delete('specs')
    } else {
      const specString = textSpecs
        .map(s => `${encodeURIComponent(s.key)}:${s.values!.map(v => encodeURIComponent(v)).join(',')}`)
        .join(';')
      params.set('specs', specString)
    }
    
    // Update boolean specs
    if (boolSpecs.length === 0) {
      params.delete('boolSpecs')
    } else {
      const boolSpecString = boolSpecs
        .map(s => `${encodeURIComponent(s.key)}:${s.boolValue}`)
        .join(';')
      params.set('boolSpecs', boolSpecString)
    }
    
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  // Generate structured data for product listing
  const siteUrl = getSiteUrl()
  
  // CollectionPage schema for category/search results
  const collectionJsonLd = useMemo(() => {
    const pageUrl = currentCategory 
      ? `${siteUrl}/shop?category=${currentCategory.slug}`
      : `${siteUrl}/shop`
    
    return {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: currentCategory?.name || 'Összes termék',
      description: currentCategory?.description || 'Böngéssz a NEXU Store termékei között',
      url: pageUrl,
      isPartOf: {
        '@type': 'WebSite',
        name: 'NEXU Store',
        url: siteUrl
      },
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: totalCount,
        itemListElement: products.slice(0, 20).map((product, index) => ({
          '@type': 'ListItem',
          position: (currentPage - 1) * 24 + index + 1,
          item: {
            '@type': 'Product',
            name: product.name,
            url: `${siteUrl}/shop/${product.slug || product.id}`,
            image: product.images?.[0]?.startsWith('http') 
              ? product.images[0] 
              : `${siteUrl}${product.images?.[0] || ''}`,
            ...(product.gtin && { gtin: product.gtin }),
            ...(product.sku && { sku: product.sku }),
            offers: {
              '@type': 'Offer',
              priceCurrency: 'HUF',
              price: product.salePrice || product.price,
              availability: product.stock > 0 
                ? 'https://schema.org/InStock' 
                : 'https://schema.org/OutOfStock'
            },
            ...(product.rating > 0 && {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: product.rating,
                reviewCount: product._count?.reviews || 0
              }
            })
          }
        }))
      }
    }
  }, [products, currentCategory, currentPage, totalCount, siteUrl])

  // Breadcrumb for shop/category pages
  const breadcrumbJsonLd = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Kezdőlap', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Termékek', item: `${siteUrl}/shop` },
      ...(currentCategory ? [{
        '@type': 'ListItem',
        position: 3,
        name: currentCategory.name,
        item: `${siteUrl}/shop?category=${currentCategory.slug}`
      }] : [])
    ]
  }), [currentCategory, siteUrl])

  // Event schema for current sales / promotions (when sale-priced items exist)
  const saleEventJsonLd = useMemo(() => {
    const now = new Date()
    const saleProducts = products.filter(p => p.salePrice && (!p.saleStartDate || new Date(p.saleStartDate) <= now) && (!p.saleEndDate || new Date(p.saleEndDate) >= now))
    if (!saleProducts || saleProducts.length === 0) return null

    const startDates = saleProducts.map(p => p.saleStartDate).filter(Boolean).map((d: any) => new Date(d))
    const endDates = saleProducts.map(p => p.saleEndDate).filter(Boolean).map((d: any) => new Date(d))

    const startDate = startDates.length ? new Date(Math.min(...startDates.map(d => d.getTime()))).toISOString() : undefined
    const endDate = endDates.length ? new Date(Math.max(...endDates.map(d => d.getTime()))).toISOString() : undefined

    return {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: 'NEXU Akciók',
      description: 'Kedvezményes ajánlatok és leárazások a NEXU Store-ban.',
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      location: { '@type': 'Place', name: 'NEXU Webshop', url: siteUrl },
      eventStatus: 'https://schema.org/EventScheduled',
      offers: saleProducts.slice(0, 5).map(p => ({
        '@type': 'Offer',
        url: `${siteUrl}/shop/${p.slug || p.id}`,
        price: p.salePrice || p.price,
        priceCurrency: 'HUF'
      }))
    }
  }, [products, siteUrl])

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-purple-500/30">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }} />
      {saleEventJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(saleEventJsonLd) }} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-[#0a0a0a] border-b border-white/5">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 blur-3xl" />
        
        <div className="container mx-auto px-4 py-24 relative z-10 text-center">
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter mb-6">
            {currentCategory ? (
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                {currentCategory.name}
              </span>
            ) : (
              <>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                  NEXU
                </span>{' '}
                <span className="text-white/20">Store</span>
              </>
            )}
          </h1>
          
          {currentCategory?.description ? (
            <div 
              className="text-sm md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed prose prose-invert prose-p:text-gray-400 prose-headings:text-white"
              dangerouslySetInnerHTML={{ __html: currentCategory.description }}
            />
          ) : (
            <p className="text-sm md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed hidden md:block">
              Fedezd fel a legújabb technológiai innovációkat. Prémium minőség, villámgyors szállítás és szakértő támogatás.
            </p>
          )}
        </div>
      </div>

      {banners.length > 0 && (
        <div className="container mx-auto px-4 -mt-6 md:-mt-12 relative z-20 mb-8 md:mb-16">
          <div className="rounded-xl md:rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/10 border border-white/10">
            <BannerCarousel banners={banners} />
          </div>
        </div>
      )}

      <div className="container mx-auto px-3 md:px-4 pb-24 lg:pb-24 pt-4 md:pt-8">
        <div className="flex flex-col lg:flex-row gap-4 md:gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className="w-full lg:w-72 flex-shrink-0 hidden lg:block">
            <div className="sticky top-24 space-y-8">
              <FilterPanel
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                category={selectedCategorySlug}
                setCategory={(val) => updateFilter('category', val)}
                sort={currentSort}
                setSort={(val) => updateFilter('sort', val)}
                minPrice={currentMinPrice}
                setMinPrice={(val) => updateFilter('minPrice', val)}
                maxPrice={currentMaxPrice}
                setMaxPrice={(val) => updateFilter('maxPrice', val)}
                maxLimit={globalMaxPrice}
                showFavoritesOnly={false}
                toggleFavoritesOnly={() => router.push('/favorites')}
                favoritesCount={favorites.length}
                onReset={handleReset}
                categories={categories}
                inStock={inStock}
                setInStock={(val) => updateFilter('inStock', val ? 'true' : '')}
                onSale={onSale}
                setOnSale={(val) => updateFilter('onSale', val ? 'true' : '')}
                isNew={isNew}
                setIsNew={(val) => updateFilter('isNew', val ? 'true' : '')}
                minRating={minRating}
                setMinRating={(val) => updateFilter('minRating', val)}
                brands={brands}
                selectedBrand={selectedBrand}
                setSelectedBrand={(val) => updateFilter('brand', val)}
                selectedSpecs={selectedSpecs}
                setSelectedSpecs={updateSpecs}
              />
            </div>
          </aside>

          <main className="flex-grow">
            {/* Header with category, count and view switcher */}
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-lg md:text-2xl font-bold text-white flex items-center gap-2 md:gap-3 flex-wrap">
                {currentCategory?.name || 'Összes termék'}
                <span className="text-xs md:text-sm font-normal text-gray-500 bg-white/5 px-2 md:px-3 py-1 rounded-full border border-white/5">
                  {totalCount} termék
                </span>
              </h2>
              
              {/* View Mode Switcher */}
              <div className="hidden sm:flex items-center gap-1 bg-white/5 rounded-lg p-1 border border-white/10">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === 'grid'
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                  aria-label="Rácsnézet"
                  title="Rácsnézet"
                >
                  <LayoutGrid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === 'list'
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                  aria-label="Listanézet"
                  title="Listanézet"
                >
                  <List size={18} />
                </button>
              </div>
            </div>

            {/* Active filters on mobile */}
            {(selectedCategorySlug || searchTerm || currentMinPrice > 0 || currentMaxPrice < globalMaxPrice || inStock || onSale || isNew || minRating > 0 || selectedBrand || selectedSpecs.length > 0) && (
              <div className="flex flex-wrap gap-2 mb-4 lg:hidden">
                {selectedCategorySlug && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/20 text-purple-400 text-xs font-medium rounded-full">
                    {selectedCategorySlug}
                    <button onClick={() => updateFilter('category', '')} className="hover:text-white">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {selectedBrand && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full">
                    {brands.find(b => b.id === selectedBrand)?.name || 'Márka'}
                    <button onClick={() => updateFilter('brand', '')} className="hover:text-white">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {searchTerm && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full">
                    "{searchTerm}"
                    <button onClick={() => { setSearchTerm(''); updateFilter('search', ''); }} className="hover:text-white">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {inStock && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
                    Készleten
                    <button onClick={() => updateFilter('inStock', '')} className="hover:text-white">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {onSale && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 text-red-400 text-xs font-medium rounded-full">
                    Akciós
                    <button onClick={() => updateFilter('onSale', '')} className="hover:text-white">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {isNew && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full">
                    Új termék
                    <button onClick={() => updateFilter('isNew', '')} className="hover:text-white">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {minRating > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/20 text-yellow-400 text-xs font-medium rounded-full">
                    {minRating}+ ★
                    <button onClick={() => updateFilter('minRating', 0)} className="hover:text-white">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {/* Text/Range specs */}
                {selectedSpecs.filter(s => s.type !== 'boolean').map(spec => (spec.values || []).map(value => (
                  <span key={`${spec.key}-${value}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/20 text-purple-400 text-xs font-medium rounded-full">
                    {spec.key}: {value}
                    <button 
                      onClick={() => {
                        const newSpecs = selectedSpecs.map(s => {
                          if (s.key === spec.key) {
                            return { ...s, values: (s.values || []).filter(v => v !== value) }
                          }
                          return s
                        }).filter(s => (s.values && s.values.length > 0) || s.type === 'boolean')
                        updateSpecs(newSpecs)
                      }} 
                      className="hover:text-white"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )))}
                {/* Boolean specs */}
                {selectedSpecs.filter(s => s.type === 'boolean').map(spec => (
                  <span key={`bool-${spec.key}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
                    {spec.key}: {spec.boolValue ? 'Igen' : 'Nem'}
                    <button 
                      onClick={() => {
                        const newSpecs = selectedSpecs.filter(s => s.key !== spec.key)
                        updateSpecs(newSpecs)
                      }} 
                      className="hover:text-white"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
                {(currentMinPrice > 0 || currentMaxPrice < globalMaxPrice) && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
                    {currentMinPrice.toLocaleString('hu-HU')} - {currentMaxPrice.toLocaleString('hu-HU')} Ft
                    <button onClick={() => { updateFilter('minPrice', 0); updateFilter('maxPrice', globalMaxPrice); }} className="hover:text-white">
                      <X size={12} />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Product Grid with Loading Overlay */}
            <div className="relative">
              {/* AI Search Suggestions */}
              {searchTerm && searchTerm.length >= 2 && (
                <AISearchSuggestions query={searchTerm} />
              )}

              {/* Loading overlay */}
              {isPending && (
                <div className="absolute inset-0 bg-[#0a0a0a]/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
                  <div className="flex items-center gap-3 bg-[#1a1a1a] px-6 py-4 rounded-xl border border-white/10 shadow-xl">
                    <Loader2 className="animate-spin text-purple-500" size={24} />
                    <span className="text-white font-medium">Betöltés...</span>
                  </div>
                </div>
              )}
              
              {/* Grid View */}
              {viewMode === 'grid' && (
                <div className={`grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-1.5 sm:gap-2 md:gap-6 transition-opacity duration-200 ${isPending ? 'opacity-50' : 'opacity-100'}`}>
                  {products.map((product, index) => (
                    <ProductCard key={product.id} product={product} priority={index < 4} />
                  ))}

                  {products.length === 0 && !isPending && (
                    <div className="col-span-full flex flex-col items-center justify-center py-16 md:py-24 text-center bg-[#121212] rounded-2xl md:rounded-3xl border border-white/5 border-dashed">
                      <div className="w-16 md:w-24 h-16 md:h-24 bg-white/5 rounded-full flex items-center justify-center mb-4 md:mb-6 animate-pulse">
                        <SearchX size={32} className="md:w-12 md:h-12 text-gray-500" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold text-white mb-2 md:mb-3">Nincs találat</h3>
                      <p className="text-sm md:text-lg text-gray-400 max-w-md mb-6 md:mb-8 px-4">
                        Sajnos nem találtunk a keresési feltételeknek megfelelő terméket.
                      </p>
                      <button
                        onClick={handleReset}
                        className="flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all text-sm md:text-base"
                      >
                        <X size={18} /> Szűrők törlése
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* List View */}
              {viewMode === 'list' && (
                <div className={`flex flex-col gap-3 md:gap-4 transition-opacity duration-200 ${isPending ? 'opacity-50' : 'opacity-100'}`}>
                  {products.map((product, index) => (
                    <ProductCardList key={product.id} product={product} priority={index < 4} />
                  ))}

                  {products.length === 0 && !isPending && (
                    <div className="flex flex-col items-center justify-center py-16 md:py-24 text-center bg-[#121212] rounded-2xl md:rounded-3xl border border-white/5 border-dashed">
                      <div className="w-16 md:w-24 h-16 md:h-24 bg-white/5 rounded-full flex items-center justify-center mb-4 md:mb-6 animate-pulse">
                        <SearchX size={32} className="md:w-12 md:h-12 text-gray-500" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold text-white mb-2 md:mb-3">Nincs találat</h3>
                      <p className="text-sm md:text-lg text-gray-400 max-w-md mb-6 md:mb-8 px-4">
                        Sajnos nem találtunk a keresési feltételeknek megfelelő terméket.
                      </p>
                      <button
                        onClick={handleReset}
                        className="flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all text-sm md:text-base"
                      >
                        <X size={18} /> Szűrők törlése
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8 md:mt-16 gap-1 md:gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  aria-label="Előző oldal"
                  className="p-2 md:p-3 rounded-xl border border-white/10 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={18} className="md:w-5 md:h-5" />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  if (totalPages > 7) {
                    const showPage = page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)
                    const showEllipsis = page === currentPage - 2 || page === currentPage + 2
                    
                    if (!showPage && !showEllipsis) {
                      return null
                    }
                    
                    if (showEllipsis) {
                      return <span key={page} className="px-1.5 md:px-2 py-2 text-gray-500 text-sm" aria-hidden="true">...</span>
                    }
                  }
                  
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      aria-label={`${page}. oldal`}
                      aria-current={currentPage === page ? 'page' : undefined}
                      className={`w-8 h-8 md:w-10 md:h-10 rounded-xl font-bold text-sm md:text-base transition-all ${
                        currentPage === page
                          ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                          : 'bg-[#121212] border border-white/10 hover:bg-white/5 text-gray-400'
                      }`}
                    >
                      {page}
                    </button>
                  )
                })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  aria-label="Következő oldal"
                  className="p-2 md:p-3 rounded-xl border border-white/10 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={18} className="md:w-5 md:h-5" />
                </button>
              </div>
            )}
          </main>
        </div>
        
        {/* Mobile Filter Panel */}
        <div className="lg:hidden">
          <FilterPanel
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            category={selectedCategorySlug}
            setCategory={(val) => updateFilter('category', val)}
            sort={currentSort}
            setSort={(val) => updateFilter('sort', val)}
            minPrice={currentMinPrice}
            setMinPrice={(val) => updateFilter('minPrice', val)}
            maxPrice={currentMaxPrice}
            setMaxPrice={(val) => updateFilter('maxPrice', val)}
            maxLimit={globalMaxPrice}
            showFavoritesOnly={false}
            toggleFavoritesOnly={() => router.push('/favorites')}
            favoritesCount={favorites.length}
            onReset={handleReset}
            categories={categories}
            inStock={inStock}
            setInStock={(val) => updateFilter('inStock', val ? 'true' : '')}
            onSale={onSale}
            setOnSale={(val) => updateFilter('onSale', val ? 'true' : '')}
            isNew={isNew}
            setIsNew={(val) => updateFilter('isNew', val ? 'true' : '')}
            minRating={minRating}
            setMinRating={(val) => updateFilter('minRating', val)}
            brands={brands}
            selectedBrand={selectedBrand}
            setSelectedBrand={(val) => updateFilter('brand', val)}
            selectedSpecs={selectedSpecs}
            setSelectedSpecs={updateSpecs}
          />
        </div>
        
        <RecentlyViewed />
      </div>
    </div>
  )
}
