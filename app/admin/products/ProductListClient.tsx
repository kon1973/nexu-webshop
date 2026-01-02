'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Edit, Plus, Search, Filter, ChevronLeft, ChevronRight, Package } from 'lucide-react'
import DeleteButton from './DeleteButton'
import VisibilityToggle from './VisibilityToggle'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import type { Product, Category } from '@prisma/client'
import { getImageUrl } from '@/lib/image'

type Props = {
  products: Product[]
  categories: Category[]
  totalCount: number
  currentPage: number
  totalPages: number
}

export default function ProductListClient({ products, categories, totalCount, currentPage, totalPages }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Local state for inputs
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')

  useEffect(() => {
    setSearchTerm(searchParams.get('search') || '')
  }, [searchParams])

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (!value || value === 'all') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    if (key !== 'page') params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

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
  }

  const currentCategory = searchParams.get('category') || ''
  const currentStock = searchParams.get('stock') || 'all'

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-12 font-sans selection:bg-purple-500/30">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col lg:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold">
            Termékek kezelése ({totalCount})
          </h1>
          
          <div className="flex flex-col md:flex-row gap-3 w-full lg:w-auto items-center">
            <Link
              href="/admin/products/bulk-edit"
              className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 text-sm border border-white/10 whitespace-nowrap"
            >
              <Edit size={18} /> Tömeges szerkesztés
            </Link>
            <Link
              href="/admin/add-product"
              className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 text-sm shadow-lg shadow-purple-500/20 whitespace-nowrap"
            >
              <Plus size={18} /> Új termék
            </Link>

            <select
              value={currentCategory}
              onChange={(e) => updateFilter('category', e.target.value)}
              className="bg-[#121212] border border-white/10 rounded-xl px-3 py-2 text-white focus:border-purple-500 outline-none transition-colors text-sm w-full md:w-auto"
            >
              <option value="">Összes kategória</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>

            <select
              value={currentStock}
              onChange={(e) => updateFilter('stock', e.target.value)}
              className="bg-[#121212] border border-white/10 rounded-xl px-3 py-2 text-white focus:border-purple-500 outline-none transition-colors text-sm w-full md:w-auto"
            >
              <option value="all">Minden készlet</option>
              <option value="low">Kevés (5 alatt)</option>
              <option value="out">Elfogyott (0)</option>
            </select>

            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Keresés..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#121212] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white focus:border-purple-500 outline-none transition-colors"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            </div>
          </div>
        </div>

        <div className="bg-[#121212] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1a1a1a] text-gray-400 text-sm border-b border-white/5">
                <th className="p-4 font-medium">Kép</th>
                <th className="p-4 font-medium">Név</th>
                <th className="p-4 font-medium">Kategória</th>
                <th className="p-4 font-medium">Ár</th>
                <th className="p-4 font-medium">Készlet</th>
                <th className="p-4 font-medium text-right">Műveletek</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center text-2xl overflow-hidden relative">
                      {getImageUrl(product.image) ? (
                        <Image 
                          src={getImageUrl(product.image)!} 
                          alt={product.name} 
                          fill
                          sizes="48px"
                          className="object-cover" 
                        />
                      ) : product.image === '\u{1f4e6}' ? (
                        product.image
                      ) : (
                        <Package size={24} className="text-gray-500" />
                      )}
                    </div>
                  </td>
                  <td className="p-4 font-bold text-white">{product.name}</td>
                  <td className="p-4 text-gray-400">
                    <span className="bg-white/5 px-2 py-1 rounded text-xs border border-white/10">
                      {product.category}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-purple-400 font-bold">
                    {product.price.toLocaleString('hu-HU')} Ft
                  </td>
                  <td className="p-4">
                    <span className={`font-bold ${product.stock === 0 ? 'text-red-600' : product.stock < 5 ? 'text-orange-500' : 'text-green-500'}`}>
                      {product.stock} db
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <VisibilityToggle 
                        id={product.id} 
                        initialIsArchived={(product as any).isArchived || false} 
                        product={product}
                      />
                      <Link
                        href={`/admin/edit-product/${product.id}`}
                        className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors"
                        title="Szerkesztés"
                      >
                        <Edit size={18} />
                      </Link>
                      <DeleteButton id={product.id} />
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-500">
                    Nincs találat.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8 gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-2 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="flex items-center px-4 text-gray-400 text-sm">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="p-2 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
