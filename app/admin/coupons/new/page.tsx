'use client'

import { useState, useEffect, useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { createCoupon } from '../actions'

type Category = {
  id: string
  name: string
}

type Product = {
  id: number
  name: string
}

const initialState = {
  message: '',
  errors: {}
}

export default function NewCouponPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])
  
  const [state, formAction, isPending] = useActionState(createCoupon, initialState)

  useEffect(() => {
    if (state.message) {
      toast.error(state.message)
    }
  }, [state])

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(() => toast.error('Nem sikerült betölteni a kategóriákat'))

    fetch('/api/products?limit=1000') // Simple fetch for now
      .then((res) => res.json())
      .then((data) => {
        if (data.products) setProducts(data.products)
      })
      .catch(() => toast.error('Nem sikerült betölteni a termékeket'))
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8 font-sans pt-24">
      <div className="max-w-2xl mx-auto">
        <Link href="/admin/coupons" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8">
          <ArrowLeft size={20} /> Vissza a kuponokhoz
        </Link>

        <h1 className="text-3xl font-bold mb-8">Új kupon létrehozása</h1>

        <form action={formAction} className="space-y-6 bg-[#121212] p-8 rounded-2xl border border-white/5">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Kupon kód</label>
            <input
              name="code"
              type="text"
              required
              placeholder="PL. TELI2025"
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 uppercase"
            />
            {state.errors?.code && <p className="text-red-500 text-sm mt-1">{state.errors.code[0]}</p>}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Típus</label>
              <select
                name="discountType"
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
              >
                <option value="PERCENTAGE">Százalékos (%)</option>
                <option value="FIXED">Fix összeg (Ft)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Érték</label>
              <input
                name="discountValue"
                type="number"
                required
                min="1"
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
              />
              {state.errors?.discountValue && <p className="text-red-500 text-sm mt-1">{state.errors.discountValue[0]}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Minimális rendelési érték (opcionális)</label>
              <input
                name="minOrderValue"
                type="number"
                min="0"
                placeholder="Pl. 5000"
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Kategória korlátozás (opcionális)</label>
              <select
                name="categoryId"
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
              >
                <option value="">Nincs korlátozás</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Termék korlátozás (opcionális)</label>
            <select
              multiple
              name="productIds"
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 h-32"
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, option => option.value)
                setSelectedProductIds(selected)
              }}
            >
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Tartsd lenyomva a Ctrl gombot több termék kiválasztásához.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Használati limit (opcionális)</label>
            <input
              name="usageLimit"
              type="number"
              min="1"
              placeholder="Pl. 100"
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Lejárat dátuma (opcionális)</label>
            <input
              name="expiresAt"
              type="datetime-local"
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50"
          >
            {isPending ? 'Mentés...' : 'Kupon létrehozása'}
          </button>
        </form>
      </div>
    </div>
  )
}
