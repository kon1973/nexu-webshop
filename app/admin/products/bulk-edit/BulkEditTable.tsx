'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Save, Loader2, Search, Filter, ChevronRight, ChevronDown, Calculator } from 'lucide-react'

type Variant = {
  id: string
  sku: string | null
  price: number
  salePrice: number | null
  stock: number
  attributes: any
  isActive: boolean
}

type Product = {
  id: number
  name: string
  price: number
  salePrice: number | null
  stock: number
  category: string
  image: string
  variants: Variant[]
  isArchived: boolean
}

type Category = {
  id: string
  name: string
}

type DiscountType = 'percent' | 'fixed' | 'minus'

export default function BulkEditTable({ initialProducts, categories }: { initialProducts: any[], categories: Category[] }) {
  const router = useRouter()
  // Cast initialProducts to our type (assuming Prisma returns compatible structure)
  const [products, setProducts] = useState<Product[]>(initialProducts as Product[])
  
  const [editedProducts, setEditedProducts] = useState<Set<number>>(new Set())
  const [editedVariants, setEditedVariants] = useState<Set<string>>(new Set())
  
  const [expandedProducts, setExpandedProducts] = useState<Set<number>>(new Set())
  
  const [isSaving, setIsSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  const toggleExpand = (id: number) => {
    const newExpanded = new Set(expandedProducts)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedProducts(newExpanded)
  }

  const handleProductChange = (id: number, field: keyof Product, value: any) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, [field]: value }
      }
      return p
    }))
    setEditedProducts(prev => new Set(prev).add(id))
  }

  const handleVariantChange = (productId: number, variantId: string, field: keyof Variant, value: any) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const updatedVariants = p.variants.map(v => {
            if (v.id === variantId) {
              return { ...v, [field]: value }
            }
            return v
          })
        
        let newStock = p.stock
        if (field === 'stock') {
             newStock = updatedVariants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0)
        }

        return {
          ...p,
          stock: newStock,
          variants: updatedVariants
        }
      }
      return p
    }))
    setEditedVariants(prev => new Set(prev).add(variantId))
    if (field === 'stock') {
        setEditedProducts(prev => new Set(prev).add(productId))
    }
  }

  const applyDiscount = (
    type: 'product' | 'variant',
    id: number | string,
    parentId: number | null, // for variant
    basePrice: number,
    discountValue: number,
    discountType: DiscountType
  ) => {
    let newSalePrice: number | null = null
    
    if (discountValue > 0) {
      if (discountType === 'percent') {
        newSalePrice = Math.round(basePrice * (1 - discountValue / 100))
      } else if (discountType === 'minus') {
        newSalePrice = Math.max(0, basePrice - discountValue)
      } else {
        newSalePrice = discountValue
      }
    } else {
        if (discountType === 'fixed') newSalePrice = 0
    }

    if (type === 'product') {
      handleProductChange(id as number, 'salePrice', newSalePrice)
    } else {
      handleVariantChange(parentId!, id as string, 'salePrice', newSalePrice)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const productUpdates = products
        .filter(p => editedProducts.has(p.id))
        .map(p => ({
          id: p.id,
          price: Number(p.price),
          salePrice: p.salePrice !== null ? Number(p.salePrice) : null,
          stock: Number(p.stock)
        }))

      const variantUpdates: any[] = []
      products.forEach(p => {
        p.variants.forEach(v => {
          if (editedVariants.has(v.id)) {
            variantUpdates.push({
              id: v.id,
              price: Number(v.price),
              salePrice: v.salePrice !== null ? Number(v.salePrice) : null,
              stock: Number(v.stock),
              isActive: v.isActive
            })
          }
        })
      })

      if (productUpdates.length === 0 && variantUpdates.length === 0) {
        toast.info('Nincs mentendő változás')
        setIsSaving(false)
        return
      }

      const res = await fetch('/api/admin/products/bulk-update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productUpdates, variantUpdates }),
      })

      if (!res.ok) throw new Error('Hiba a mentés során')

      toast.success(`${productUpdates.length + variantUpdates.length} elem frissítve!`)
      setEditedProducts(new Set())
      setEditedVariants(new Set())
      router.refresh()
    } catch (error) {
      toast.error('Nem sikerült menteni a változásokat')
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = selectedCategory ? p.category === selectedCategory : true
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#121212] p-4 rounded-xl border border-white/10">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Keresés név alapján..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-purple-500"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none bg-black/20 border border-white/10 rounded-lg pl-10 pr-8 py-2 focus:outline-none focus:border-purple-500"
            >
              <option value="">Összes kategória</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving || (editedProducts.size === 0 && editedVariants.size === 0)}
          className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-purple-500/20"
        >
          {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          Mentés ({editedProducts.size + editedVariants.size})
        </button>
      </div>

      <div className="bg-[#121212] rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-gray-400 text-sm">
                <th className="p-4 w-12"></th>
                <th className="p-4">Termék</th>
                <th className="p-4 w-32">Ár (Ft)</th>
                <th className="p-4 w-32">Akciós ár (Ft)</th>
                <th className="p-4 w-64">Akció beállítása</th>
                <th className="p-4 w-24">Aktív</th>
                <th className="p-4 w-24">Készlet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredProducts.map(product => {
                const hasVariants = product.variants && product.variants.length > 0
                const isExpanded = expandedProducts.has(product.id)

                return (
                  <React.Fragment key={product.id}>
                    {/* Product Row */}
                    <tr className={`hover:bg-white/5 transition-colors ${editedProducts.has(product.id) ? 'bg-purple-500/10' : ''}`}>
                      <td className="p-4">
                        {hasVariants && (
                          <button 
                            onClick={() => toggleExpand(product.id)}
                            className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"
                          >
                            {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                          </button>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center text-xl overflow-hidden">
                            {product.image && product.image.startsWith('http') ? (
                                <img src={product.image} alt="" className="w-full h-full object-cover" />
                            ) : (
                                product.image || '📦'
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-xs text-gray-500">{product.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <input
                          type="number"
                          value={product.price}
                          onChange={(e) => handleProductChange(product.id, 'price', Number(e.target.value))}
                          className="w-full bg-black/20 border border-white/10 rounded px-2 py-1 text-sm focus:border-purple-500 outline-none"
                        />
                      </td>
                      <td className="p-4">
                        <input
                          type="number"
                          value={product.salePrice ?? ''}
                          placeholder="-"
                          onChange={(e) => handleProductChange(product.id, 'salePrice', e.target.value ? Number(e.target.value) : null)}
                          className="w-full bg-black/20 border border-white/10 rounded px-2 py-1 text-sm focus:border-purple-500 outline-none text-purple-400"
                        />
                      </td>
                      <td className="p-4">
                        <DiscountCalculator 
                          basePrice={product.price} 
                          onApply={(val, type) => applyDiscount('product', product.id, null, product.price, val, type)} 
                        />
                      </td>
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={!product.isArchived}
                          onChange={(e) => handleProductChange(product.id, 'isArchived', !e.target.checked)}
                          className="w-4 h-4 rounded border-white/10 bg-black/20 text-purple-600 focus:ring-purple-500"
                        />
                      </td>
                      <td className="p-4">
                        <input
                          type="number"
                          value={product.stock}
                          onChange={(e) => handleProductChange(product.id, 'stock', Number(e.target.value))}
                          className={`w-full bg-black/20 border border-white/10 rounded px-2 py-1 text-sm focus:border-purple-500 outline-none ${product.stock === 0 ? 'text-red-500' : ''}`}
                        />
                      </td>
                    </tr>

                    {/* Variant Rows */}
                    {hasVariants && isExpanded && product.variants.map(variant => (
                      <tr key={variant.id} className={`bg-white/[0.02] hover:bg-white/5 transition-colors ${editedVariants.has(variant.id) ? 'bg-purple-500/10' : ''}`}>
                        <td className="p-4"></td>
                        <td className="p-4 pl-12">
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <div className="w-1 h-1 rounded-full bg-gray-600"></div>
                            {Object.entries(variant.attributes || {}).map(([k, v]) => (
                              <span key={k} className="bg-white/5 px-2 py-0.5 rounded text-xs">
                                {k}: {String(v)}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-4">
                          <input
                            type="number"
                            value={variant.price}
                            onChange={(e) => handleVariantChange(product.id, variant.id, 'price', Number(e.target.value))}
                            className="w-full bg-black/20 border border-white/10 rounded px-2 py-1 text-sm focus:border-purple-500 outline-none"
                          />
                        </td>
                        <td className="p-4">
                          <input
                            type="number"
                            value={variant.salePrice ?? ''}
                            placeholder="-"
                            onChange={(e) => handleVariantChange(product.id, variant.id, 'salePrice', e.target.value ? Number(e.target.value) : null)}
                            className="w-full bg-black/20 border border-white/10 rounded px-2 py-1 text-sm focus:border-purple-500 outline-none text-purple-400"
                          />
                        </td>
                        <td className="p-4">
                          <DiscountCalculator 
                            basePrice={variant.price} 
                            onApply={(val, type) => applyDiscount('variant', variant.id, product.id, variant.price, val, type)} 
                          />
                        </td>
                        <td className="p-4 text-center">
                          <input
                            type="checkbox"
                            checked={variant.isActive ?? true}
                            onChange={(e) => handleVariantChange(product.id, variant.id, 'isActive', e.target.checked)}
                            className="w-4 h-4 rounded border-white/10 bg-black/20 text-purple-600 focus:ring-purple-500"
                          />
                        </td>
                        <td className="p-4">
                          <input
                            type="number"
                            value={variant.stock}
                            onChange={(e) => handleVariantChange(product.id, variant.id, 'stock', Number(e.target.value))}
                            className={`w-full bg-black/20 border border-white/10 rounded px-2 py-1 text-sm focus:border-purple-500 outline-none ${variant.stock === 0 ? 'text-red-500' : ''}`}
                          />
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function DiscountCalculator({ basePrice, onApply }: { basePrice: number, onApply: (val: number, type: DiscountType) => void }) {
  const [value, setValue] = useState('')
  const [type, setType] = useState<DiscountType>('percent')

  const handleApply = () => {
    if (!value) return
    onApply(Number(value), type)
    setValue('') // Reset after apply
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Érték"
        className="w-20 bg-black/20 border border-white/10 rounded px-2 py-1 text-sm focus:border-purple-500 outline-none"
      />
      <select
        value={type}
        onChange={(e) => setType(e.target.value as DiscountType)}
        className="bg-black/20 border border-white/10 rounded px-2 py-1 text-sm focus:border-purple-500 outline-none"
      >
        <option value="percent">%</option>
        <option value="minus">- Ft</option>
        <option value="fixed">= Ft</option>
      </select>
      <button 
        onClick={handleApply}
        disabled={!value}
        className="p-1 hover:bg-purple-500/20 text-purple-400 rounded transition-colors disabled:opacity-50"
        title="Alkalmaz"
      >
        <Calculator size={16} />
      </button>
    </div>
  )
}
