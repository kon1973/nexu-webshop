'use client'

import { Search, Filter, X } from 'lucide-react'
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
  categories?: { name: string }[]
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
}: Props) {
  const [isOpen, setIsOpen] = useState(false)
  // Removed internal categories fetching


  return (
    <>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden sticky top-[72px] z-30 bg-[#0a0a0a]/80 backdrop-blur-xl pb-4 pt-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-center gap-2 bg-white text-black p-4 rounded-xl font-bold shadow-lg shadow-white/5 hover:bg-gray-200 transition-all active:scale-[0.98]"
        >
          <Filter size={20} /> 
          Szűrők és rendezés
          {(category || searchTerm || minPrice > 0 || maxPrice < maxLimit || showFavoritesOnly) && (
            <span className="w-2 h-2 bg-purple-600 rounded-full animate-pulse" />
          )}
        </button>
      </div>

      {/* Mobile Filter Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-full max-w-xs bg-[#121212] border-l border-white/10 p-6 overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-white">Szűrők</h2>
              <button onClick={() => setIsOpen(false)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <FilterContent 
              {...{ searchTerm, setSearchTerm, category, setCategory, sort, setSort, minPrice, setMinPrice, maxPrice, setMaxPrice, maxLimit, showFavoritesOnly, toggleFavoritesOnly, favoritesCount, onReset, categories }} 
            />
          </div>
        </div>
      )}

      {/* Desktop Filter Panel */}
      <div className="hidden lg:block bg-[#121212] p-6 rounded-3xl border border-white/5 space-y-8 shadow-xl sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
        <FilterContent 
          {...{ searchTerm, setSearchTerm, category, setCategory, sort, setSort, minPrice, setMinPrice, maxPrice, setMaxPrice, maxLimit, showFavoritesOnly, toggleFavoritesOnly, favoritesCount, onReset, categories }} 
        />
      </div>
    </>
  )
}

function FilterContent({
  searchTerm, setSearchTerm, category, setCategory, sort, setSort, minPrice, setMinPrice, maxPrice, setMaxPrice, maxLimit, showFavoritesOnly, toggleFavoritesOnly, favoritesCount, onReset, categories
}: any) {
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

          {categories.map((cat: { name: string }) => (
            <button
              key={cat.name}
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
