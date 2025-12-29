'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Save, Edit, X } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

type Attribute = {
  id: string
  name: string
  values: string[]
}

export default function AttributesPage() {
  const [attributes, setAttributes] = useState<Attribute[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [newValues, setNewValues] = useState('')
  
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    fetchAttributes()
  }, [])

  const fetchAttributes = async () => {
    try {
      const res = await fetch('/api/attributes')
      if (res.ok) {
        const data = await res.json()
        setAttributes(data)
      }
    } catch (error) {
      toast.error('Hiba a betöltéskor')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName || !newValues) return

    const valuesArray = newValues.split(',').map((v) => v.trim()).filter(Boolean)

    try {
      const url = editingId ? `/api/attributes/${editingId}` : '/api/attributes'
      const method = editingId ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, values: valuesArray }),
      })

      if (res.ok) {
        toast.success(editingId ? 'Attribútum frissítve' : 'Attribútum létrehozva')
        resetForm()
        fetchAttributes()
      } else {
        toast.error('Hiba történt')
      }
    } catch (error) {
      toast.error('Hálózati hiba')
    }
  }

  const handleEdit = (attr: Attribute) => {
    setEditingId(attr.id)
    setNewName(attr.name)
    setNewValues(attr.values.join(', '))
  }

  const resetForm = () => {
    setEditingId(null)
    setNewName('')
    setNewValues('')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Biztosan törölni szeretnéd?')) return

    try {
      const res = await fetch(`/api/attributes/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast.success('Törölve')
        fetchAttributes()
      } else {
        toast.error('Hiba a törléskor')
      }
    } catch (error) {
      toast.error('Hálózati hiba')
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-12 font-sans">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Termékjellemzők (Attribútumok)</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Create/Edit Form */}
          <div className="bg-[#121212] border border-white/5 rounded-2xl p-6 h-fit">
            <h2 className="text-xl font-bold mb-4 flex justify-between items-center">
              {editingId ? 'Szerkesztés' : 'Új jellemző'}
              {editingId && (
                <button onClick={resetForm} className="text-gray-500 hover:text-white">
                  <X size={18} />
                </button>
              )}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2">Név</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Pl. Szín, Méret, Tárhely"
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2">Értékek (vesszővel elválasztva)</label>
                <textarea
                  value={newValues}
                  onChange={(e) => setNewValues(e.target.value)}
                  placeholder="Pl. Piros, Kék, Zöld"
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 outline-none min-h-[100px]"
                  required
                />
              </div>
              <button
                type="submit"
                className={`w-full font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
                  editingId 
                    ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                    : 'bg-purple-600 hover:bg-purple-500 text-white'
                }`}
              >
                {editingId ? <Save size={18} /> : <Plus size={18} />}
                {editingId ? 'Mentés' : 'Létrehozás'}
              </button>
            </form>
          </div>

          {/* List */}
          <div className="md:col-span-2 space-y-4">
            {isLoading ? (
              <div className="text-center text-gray-500 py-8">Betöltés...</div>
            ) : attributes.length === 0 ? (
              <div className="text-center text-gray-500 py-8">Még nincsenek jellemzők.</div>
            ) : (
              attributes.map((attr) => (
                <div
                  key={attr.id}
                  className={`bg-[#121212] border rounded-xl p-4 group transition-all ${
                    editingId === attr.id ? 'border-blue-500/50 bg-blue-500/5' : 'border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{attr.name}</h3>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(attr)}
                        className="p-2 text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                        title="Szerkesztés"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(attr.id)}
                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Törlés"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {attr.values.map((val, i) => (
                      <span key={i} className="bg-white/5 px-2 py-1 rounded text-xs text-gray-300 border border-white/5">
                        {val}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
