'use client'

import { Search, Filter, X, Star, Zap, Package, Sparkles, Check } from 'lucide-react'
import { useState, useEffect } from 'react'

type Props = {
  searchTerm: string
  setSearchTerm: (value: string) => void
  category: string
  setCategory: (value: string) => void
  sort: string
  setSort: (value: string) => void
  minPrice: number
  setMinPrice: (value: number) => void
  maxPrice: number
  setMaxPrice: (value: number) => void
  maxLimit?: number
  showFavoritesOnly: boolean
  toggleFavoritesOnly: () => void
  favoritesCount: number
  onReset: () => void
  categories?: { name: string; slug: string }[]
  // New filters
  inStock?: boolean
  setInStock?: (value: boolean) => void
  onSale?: boolean
  setOnSale?: (value: boolean) => void
  minRating?: number
  setMinRating?: (value: number) => void
  isNew?: boolean
  setIsNew?: (value: boolean) => void
}

export default function FilterPanel({
  searchTerm,
  setSearchTerm,
  category,
  setCategory,
  sort,
  setSort,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  maxLimit = 2000000,
  showFavoritesOnly,
  toggleFavoritesOnly,
  favoritesCount,
  onReset,
  categories = [],
  inStock,
  setInStock,
  onSale,
  setOnSale,
  minRating,
  setMinRating,
  isNew,
  setIsNew,
}: Props) {
  const [isOpen, setIsOpen] = useState(false)
  
  // Count active filters
  const activeFilterCount = [
    category,
    searchTerm,
    minPrice > 0,
    maxPrice < maxLimit,
    showFavoritesOnly,
    inStock,
    onSale,
    minRating && minRating > 0,
    isNew,
  ].filter(Boolean).length


  return (
    <>
      {/* Mobile Filter Toggle - Fixed at bottom */}
      <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-2xl font-bold shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-all active:scale-[0.98]"
        >
          <Filter size={20} /> 
          <span>Szűrők</span>
          {activeFilterCount > 0 && (
            <span className="px-2.5 py-0.5 bg-white/20 rounded-full text-sm font-bold">{activeFilterCount}</span>
          )}
        </button>
      </div>

      {/* Mobile Filter Overlay - Full screen bottom sheet */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setIsOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] bg-[#0a0a0a] border-t border-white/10 rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300 flex flex-col">
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-white/20 rounded-full" />
            </div>
            
            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-4 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">Szűrők és rendezés</h2>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-2.5 bg-white/10 rounded-full hover:bg-white/20 text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-5 pb-24">
              <FilterContent 
                {...{ searchTerm, setSearchTerm, category, setCategory, sort, setSort, minPrice, setMinPrice, maxPrice, setMaxPrice, maxLimit, showFavoritesOnly, toggleFavoritesOnly, favoritesCount, onReset, categories, inStock, setInStock, onSale, setOnSale, minRating, setMinRating, isNew, setIsNew }} 
              />
            </div>
            
            {/* Fixed apply button */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a] to-transparent pt-8">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-2xl shadow-lg shadow-purple-500/30"
              >
                Szűrők alkalmazása
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Filter Panel */}
      <div className="hidden lg:block bg-[#121212] p-6 rounded-3xl border border-white/5 space-y-8 shadow-xl sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
        <FilterContent 
          {...{ searchTerm, setSearchTerm, category, setCategory, sort, setSort, minPrice, setMinPrice, maxPrice, setMaxPrice, maxLimit, showFavoritesOnly, toggleFavoritesOnly, favoritesCount, onReset, categories, inStock, setInStock, onSale, setOnSale, minRating, setMinRating, isNew, setIsNew }} 
        />
      </div>
    </>
  )
}

type FilterContentProps = {
  searchTerm: string
  setSearchTerm: (value: string) => void
  category: string
  setCategory: (value: string) => void
  sort: string
  setSort: (value: string) => void
  minPrice: number
  setMinPrice: (value: number) => void
  maxPrice: number
  setMaxPrice: (value: number) => void
  maxLimit: number
  showFavoritesOnly: boolean
  toggleFavoritesOnly: () => void
  favoritesCount: number
  onReset: () => void
  categories: { name: string; slug: string }[]
  inStock?: boolean
  setInStock?: (value: boolean) => void
  onSale?: boolean
  setOnSale?: (value: boolean) => void
  minRating?: number
  setMinRating?: (value: number) => void
  isNew?: boolean
  setIsNew?: (value: boolean) => void
}

function FilterContent({
  searchTerm, setSearchTerm, category, setCategory, sort, setSort, minPrice, setMinPrice, maxPrice, setMaxPrice, maxLimit, showFavoritesOnly, toggleFavoritesOnly, favoritesCount, onReset, categories, inStock, setInStock, onSale, setOnSale, minRating, setMinRating, isNew, setIsNew
}: FilterContentProps) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Search size={14} /> Keresés
        </h3>
        <div className="relative group">
          <input
            type="text"
            placeholder="Termék neve..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 pl-10 text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder-gray-600 group-hover:border-white/20"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-500 transition-colors">
            <Search size={16} />
          </span>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Filter size={14} /> Rendezés
        </h3>
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 cursor-pointer appearance-none hover:border-white/20 transition-all"
          >
            <option value="newest">Legújabb elöl</option>
            <option value="price-asc">Olcsóbb elöl</option>
            <option value="price-desc">Drágább elöl</option>
            <option value="rating">Legjobb értékelés</option>
            <option value="name-asc">Név szerint (A-Z)</option>
            <option value="name-desc">Név szerint (Z-A)</option>
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      <div className="p-4 bg-[#0a0a0a] rounded-xl border border-white/5 hover:border-purple-500/20 transition-colors group cursor-pointer" onClick={toggleFavoritesOnly}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">Kedvencek</h3>
            <p className="text-xs text-gray-500">Csak a mentett termékek</p>
          </div>
          <div className={`w-12 h-7 rounded-full transition-all relative ${showFavoritesOnly ? 'bg-purple-600' : 'bg-white/10'}`}>
            <span className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-sm ${showFavoritesOnly ? 'right-1' : 'left-1'}`} />
          </div>
        </div>
      </div>

      <hr className="border-white/5" />

      <div>
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Kategóriák</h3>
        <div className="space-y-1 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          <button
            type="button"
            onClick={() => setCategory('')}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all flex items-center justify-between group ${
              category === ''
                ? 'bg-purple-600 text-white font-bold shadow-lg shadow-purple-500/20'
                : 'text-gray-400 hover:bg-[#0a0a0a] hover:text-white'
            }`}
          >
            <span>Összes termék</span>
            {category === '' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
          </button>

          {categories.map((cat) => (
            <button
              key={cat.slug || cat.name}
              type="button"
              onClick={() => setCategory(cat.name)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all flex items-center justify-between group ${
                category === cat.name
                  ? 'bg-purple-600 text-white font-bold shadow-lg shadow-purple-500/20'
                  : 'text-gray-400 hover:bg-[#0a0a0a] hover:text-white'
              }`}
            >
              <span>{cat.name}</span>
              {category === cat.name && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Ársáv</h3>
        <div className="space-y-6 bg-[#0a0a0a] p-4 rounded-xl border border-white/5">
          <div>
            <div className="flex justify-between text-xs font-medium text-gray-400 mb-2">
              <span>Minimum ár</span>
              <span className="text-white">{minPrice.toLocaleString('hu-HU')} Ft</span>
            </div>
            <input
              type="range"
              min="0"
              max={maxLimit}
              step="5000"
              value={minPrice}
              onChange={(e) => setMinPrice(Number(e.target.value))}
              className="w-full h-1.5 bg-[#1a1a1a] rounded-lg appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium text-gray-400 mb-2">
              <span>Maximum ár</span>
              <span className="text-white">{maxPrice.toLocaleString('hu-HU')} Ft</span>
            </div>
            <input
              type="range"
              min="0"
              max={maxLimit}
              step="5000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full h-1.5 bg-[#1a1a1a] rounded-lg appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400"
            />
          </div>
        </div>
      </div>

      {/* Quick Filters */}
      <div>
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Zap size={14} /> Gyors szűrők
        </h3>
        <div className="space-y-2">
          {/* In Stock Toggle */}
          {setInStock && (
            <div 
              className={`p-3 rounded-xl border transition-all cursor-pointer group ${
                inStock 
                  ? 'bg-green-500/10 border-green-500/30' 
                  : 'bg-[#0a0a0a] border-white/5 hover:border-white/20'
              }`}
              onClick={() => setInStock(!inStock)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${inStock ? 'bg-green-500/20' : 'bg-white/5'}`}>
                    <Package size={16} className={inStock ? 'text-green-400' : 'text-gray-500'} />
                  </div>
                  <div>
                    <span className={`text-sm font-medium ${inStock ? 'text-green-400' : 'text-gray-300'}`}>Készleten</span>
                    <p className="text-xs text-gray-500">Csak elérhető termékek</p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                  inStock ? 'bg-green-500 border-green-500' : 'border-white/20'
                }`}>
                  {inStock && <Check size={12} className="text-white" />}
                </div>
              </div>
            </div>
          )}

          {/* On Sale Toggle */}
          {setOnSale && (
            <div 
              className={`p-3 rounded-xl border transition-all cursor-pointer group ${
                onSale 
                  ? 'bg-red-500/10 border-red-500/30' 
                  : 'bg-[#0a0a0a] border-white/5 hover:border-white/20'
              }`}
              onClick={() => setOnSale(!onSale)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${onSale ? 'bg-red-500/20' : 'bg-white/5'}`}>
                    <Zap size={16} className={onSale ? 'text-red-400' : 'text-gray-500'} />
                  </div>
                  <div>
                    <span className={`text-sm font-medium ${onSale ? 'text-red-400' : 'text-gray-300'}`}>Akciós</span>
                    <p className="text-xs text-gray-500">Leárazott termékek</p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                  onSale ? 'bg-red-500 border-red-500' : 'border-white/20'
                }`}>
                  {onSale && <Check size={12} className="text-white" />}
                </div>
              </div>
            </div>
          )}

          {/* New Products Toggle */}
          {setIsNew && (
            <div 
              className={`p-3 rounded-xl border transition-all cursor-pointer group ${
                isNew 
                  ? 'bg-blue-500/10 border-blue-500/30' 
                  : 'bg-[#0a0a0a] border-white/5 hover:border-white/20'
              }`}
              onClick={() => setIsNew(!isNew)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isNew ? 'bg-blue-500/20' : 'bg-white/5'}`}>
                    <Sparkles size={16} className={isNew ? 'text-blue-400' : 'text-gray-500'} />
                  </div>
                  <div>
                    <span className={`text-sm font-medium ${isNew ? 'text-blue-400' : 'text-gray-300'}`}>Új termék</span>
                    <p className="text-xs text-gray-500">Elmúlt 30 nap</p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                  isNew ? 'bg-blue-500 border-blue-500' : 'border-white/20'
                }`}>
                  {isNew && <Check size={12} className="text-white" />}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rating Filter */}
      {setMinRating && (
        <div>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Star size={14} /> Minimum értékelés
          </h3>
          <div className="space-y-2">
            {[4, 3, 2, 1].map((rating) => (
              <div 
                key={rating}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  minRating === rating 
                    ? 'bg-yellow-500/10 border-yellow-500/30' 
                    : 'bg-[#0a0a0a] border-white/5 hover:border-white/20'
                }`}
                onClick={() => setMinRating(minRating === rating ? 0 : rating)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        size={16} 
                        className={star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'} 
                      />
                    ))}
                    <span className="text-xs text-gray-500 ml-2">és több</span>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                    minRating === rating ? 'bg-yellow-500 border-yellow-500' : 'border-white/20'
                  }`}>
                    {minRating === rating && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <hr className="border-white/5" />

      <button
        type="button"
        onClick={onReset}
        className="w-full py-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-bold text-gray-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
      >
        Szűrők alaphelyzetbe
      </button>
    </div>
  )
}
