'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, GripVertical, Save } from 'lucide-react'
import { toast } from 'sonner'

interface Brand {
  id: string
  name: string
  logo: string | null
  isVisible: boolean
  order: number
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [newBrandName, setNewBrandName] = useState('')

  const fetchBrands = async () => {
    try {
      const res = await fetch('/api/brands')
      if (res.ok) {
        const data = await res.json()
        setBrands(data)
      }
    } catch (error) {
      toast.error('Hiba a márkák betöltésekor')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBrands()
  }, [])

  const handleAddBrand = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBrandName.trim()) return

    try {
      const res = await fetch('/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newBrandName, order: brands.length }),
      })

      if (res.ok) {
        toast.success('Márka hozzáadva')
        setNewBrandName('')
        fetchBrands()
      } else {
        toast.error('Hiba a hozzáadáskor')
      }
    } catch (error) {
      toast.error('Hiba történt')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Biztosan törölni szeretnéd?')) return

    try {
      const res = await fetch(`/api/brands?id=${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast.success('Márka törölve')
        setBrands(brands.filter(b => b.id !== id))
      } else {
        toast.error('Hiba a törléskor')
      }
    } catch (error) {
      toast.error('Hiba történt')
    }
  }

  return (
    <div className="p-6 pt-24 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Márkák kezelése</h1>
          <p className="text-gray-400">A főoldali márka sáv tartalmának szerkesztése</p>
        </div>
      </div>

      <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Új márka hozzáadása</h2>
        <form onSubmit={handleAddBrand} className="flex gap-4">
          <input
            type="text"
            placeholder="Márka neve (pl. Samsung)"
            value={newBrandName}
            onChange={(e) => setNewBrandName(e.target.value)}
            className="flex-1 bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            Hozzáadás
          </button>
        </form>
      </div>

      <div className="bg-[#1a1a1a] border border-white/5 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/5 bg-white/[0.02]">
          <h3 className="font-bold text-gray-400">Jelenlegi márkák</h3>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-gray-500">Betöltés...</div>
        ) : brands.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Nincs megjeleníthető márka</div>
        ) : (
          <div className="divide-y divide-white/5">
            {brands.map((brand) => (
              <div key={brand.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] group">
                <div className="flex items-center gap-4">
                  <div className="cursor-move text-gray-600 hover:text-gray-400">
                    <GripVertical size={20} />
                  </div>
                  <span className="text-lg font-medium text-white">{brand.name}</span>
                </div>
                <button
                  onClick={() => handleDelete(brand.id)}
                  className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
