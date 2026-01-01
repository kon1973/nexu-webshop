'use client'

import { useState, useEffect } from 'react'
import FilterPanel from './FilterPanel'
import { useFavorites } from '@/context/FavoritesContext'
import ProductCard from '@/app/components/ProductCard'
import BannerCarousel from '@/app/components/BannerCarousel'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import type { Product, Banner, Category } from '@prisma/client'
import { SearchX, X, ChevronLeft, ChevronRight } from 'lucide-react'
import RecentlyViewed from '@/app/components/RecentlyViewed'

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
  globalMaxPrice,
  currentCategory
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const { favorites } = useFavorites()

  // Local state for UI inputs (debouncing etc)
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  
  // Sync local state with URL
  useEffect(() => {
    setSearchTerm(searchParams.get('search') || '')
  }, [searchParams])

  const updateFilter = (key: string, value: string | number | null) => {
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

    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

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

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-purple-500/30">
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
              className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed prose prose-invert prose-p:text-gray-400 prose-headings:text-white"
              dangerouslySetInnerHTML={{ __html: currentCategory.description }}
            />
          ) : (
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Fedezd fel a legújabb technológiai innovációkat. Prémium minőség, villámgyors szállítás és szakértő támogatás.
            </p>
          )}
        </div>
      </div>

      {banners.length > 0 && (
        <div className="container mx-auto px-4 -mt-12 relative z-20 mb-16">
          <div className="rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/10 border border-white/10">
            <BannerCarousel banners={banners} />
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 pb-24 pt-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-72 flex-shrink-0">
            <div className="sticky top-24 space-y-8">
              <div className="lg:hidden">
                 {/* Mobile Filter Toggle Placeholder - handled in FilterPanel */}
              </div>
              <FilterPanel
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm} // Local state update
                category={selectedCategorySlug}
                setCategory={(val) => updateFilter('category', val)}
                sort={currentSort}
                setSort={(val) => updateFilter('sort', val)}
                minPrice={currentMinPrice}
                setMinPrice={(val) => updateFilter('minPrice', val)}
                maxPrice={currentMaxPrice}
                setMaxPrice={(val) => updateFilter('maxPrice', val)}
                maxLimit={globalMaxPrice}
                showFavoritesOnly={false} // Disabled
                toggleFavoritesOnly={() => router.push('/favorites')} // Redirect to favorites page
                favoritesCount={favorites.length}
                onReset={handleReset}
                categories={categories} // Pass categories
              />
            </div>
          </aside>

          <main className="flex-grow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                {currentCategory?.name || 'Összes termék'}
                <span className="text-sm font-normal text-gray-500 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                  {totalCount} termék
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-3 md:gap-6">
              {products.map((product, index) => (
                <ProductCard key={product.id} product={product} priority={index < 4} />
              ))}

              {products.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-24 text-center bg-[#121212] rounded-3xl border border-white/5 border-dashed">
                  <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <SearchX size={48} className="text-gray-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">Nincs találat</h3>
                  <p className="text-gray-400 max-w-md mb-8 text-lg">
                    Sajnos nem találtunk a keresési feltételeknek megfelelő terméket.
                    Próbáld meg módosítani a szűrőket.
                  </p>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all hover:scale-105"
                  >
                    <X size={20} /> Szűrők törlése
                  </button>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-16 gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="p-3 rounded-xl border border-white/10 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Show limited pages if too many
                  if (totalPages > 7) {
                    if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                       // show page
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                       return <span key={page} className="px-2 py-2 text-gray-500">...</span>
                    } else {
                       return null
                    }
                  }
                  
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-10 h-10 rounded-xl font-bold transition-all ${
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
                  className="p-3 rounded-xl border border-white/10 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </main>
        </div>
        
        <RecentlyViewed />
      </div>
    </div>
  )
}
