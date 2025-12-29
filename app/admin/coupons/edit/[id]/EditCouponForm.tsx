'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'
import type { Coupon } from '@prisma/client'

type Category = {
  id: string
  name: string
}

type Product = {
  id: number
  name: string
}

export default function EditCouponForm({ coupon }: { coupon: Coupon & { products?: { id: number }[] } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(
    coupon.products?.map((p: { id: number }) => String(p.id)) || []
  )

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(() => toast.error('Nem sikerült betölteni a kategóriákat'))

    fetch('/api/products?limit=1000')
      .then((res) => res.json())
      .then((data) => {
        if (data.products) setProducts(data.products)
      })
      .catch(() => toast.error('Nem sikerült betölteni a termékeket'))
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      code: formData.get('code'),
      discountType: formData.get('discountType'),
      discountValue: Number(formData.get('discountValue')),
      usageLimit: formData.get('usageLimit') ? Number(formData.get('usageLimit')) : null,
      expiresAt: formData.get('expiresAt') || null,
      isActive: formData.get('isActive') === 'on',
      minOrderValue: formData.get('minOrderValue') ? Number(formData.get('minOrderValue')) : null,
      categoryId: formData.get('categoryId') || null,
      productIds: selectedProductIds
    }

    try {
      const res = await fetch(`/api/coupons/${coupon.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        toast.success('Kupon frissítve!')
        router.push('/admin/coupons')
        router.refresh()
      } else {
        const error = await res.json()
        toast.error(error.error || 'Hiba történt')
      }
    } catch (error) {
      toast.error('Hiba történt')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8 font-sans pt-24">
      <div className="max-w-2xl mx-auto">
        <Link href="/admin/coupons" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8">
          <ArrowLeft size={20} /> Vissza a kuponokhoz
        </Link>

        <h1 className="text-3xl font-bold mb-8">Kupon szerkesztése</h1>

        <form onSubmit={handleSubmit} className="space-y-6 bg-[#121212] p-8 rounded-2xl border border-white/5">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Kupon kód</label>
            <input
              name="code"
              type="text"
              required
              defaultValue={coupon.code}
              placeholder="PL. TELI2025"
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 uppercase"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Típus</label>
              <select
                name="discountType"
                defaultValue={coupon.discountType}
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
                defaultValue={coupon.discountValue}
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Minimális rendelési érték (opcionális)</label>
              <input
                name="minOrderValue"
                type="number"
                min="0"
                defaultValue={coupon.minOrderValue || ''}
                placeholder="Pl. 5000"
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Kategória korlátozás (opcionális)</label>
              <select
                name="categoryId"
                defaultValue={coupon.categoryId || ''}
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
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 h-32"
              value={selectedProductIds}
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
              defaultValue={coupon.usageLimit || ''}
              placeholder="Pl. 100"
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Lejárat (opcionális)</label>
            <input
              name="expiresAt"
              type="datetime-local"
              defaultValue={coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().slice(0, 16) : ''}
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 [color-scheme:dark]"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isActive"
              id="isActive"
              defaultChecked={coupon.isActive}
              className="w-5 h-5 rounded border-gray-600 text-purple-600 focus:ring-purple-500 bg-[#1a1a1a]"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-300">
              Aktív
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            Mentés
          </button>
        </form>
      </div>
    </div>
  )
}
