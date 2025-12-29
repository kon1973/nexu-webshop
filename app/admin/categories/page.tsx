'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Tag, Edit, Save, X } from 'lucide-react'
import { toast } from 'sonner'
import { RichTextEditor } from '../components/RichTextEditor'

type Category = {
  id: string
  name: string
  slug: string
  icon?: string | null
  color?: string | null
  description?: string | null
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [newIcon, setNewIcon] = useState('')
  const [newColor, setNewColor] = useState('')
  const [newDescription, setNewDescription] = useState('')
  
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      if (res.ok) {
        const data = await res.json()
        setCategories(data)
      }
    } catch (error) {
      toast.error('Hiba a betöltéskor')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName) return

    try {
      const url = editingId ? `/api/categories/${editingId}` : '/api/categories'
      const method = editingId ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newName,
          icon: newIcon,
          color: newColor,
          description: newDescription
        }),
      })

      if (res.ok) {
        toast.success(editingId ? 'Kategória frissítve' : 'Kategória létrehozva')
        resetForm()
        fetchCategories()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Hiba történt')
      }
    } catch (error) {
      toast.error('Hálózati hiba')
    }
  }

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id)
    setNewName(cat.name)
    setNewIcon(cat.icon || '')
    setNewColor(cat.color || '')
    setNewDescription(cat.description || '')
  }

  const resetForm = () => {
    setEditingId(null)
    setNewName('')
    setNewIcon('')
    setNewColor('')
    setNewDescription('')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Biztosan törölni szeretnéd?')) return

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast.success('Törölve')
        fetchCategories()
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
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <Tag className="text-purple-500" />
          Kategóriák kezelése
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Create/Edit Form */}
          <div className="bg-[#121212] border border-white/5 rounded-2xl p-6 h-fit">
            <h2 className="text-xl font-bold mb-4 flex justify-between items-center">
              {editingId ? 'Szerkesztés' : 'Új kategória'}
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
                  placeholder="Pl. Okosóra"
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2">Ikon (Emoji)</label>
                <input
                  type="text"
                  value={newIcon}
                  onChange={(e) => setNewIcon(e.target.value)}
                  placeholder="Pl. ⌚"
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2">Szín (Gradient)</label>
                <input
                  type="text"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  placeholder="Pl. from-blue-500 to-purple-500"
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2">Leírás (SEO)</label>
                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden">
                  <RichTextEditor 
                    content={newDescription} 
                    onChange={setNewDescription} 
                  />
                </div>
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
            ) : categories.length === 0 ? (
              <div className="text-center text-gray-500 py-8">Még nincsenek kategóriák.</div>
            ) : (
              categories.map((cat) => (
                <div
                  key={cat.id}
                  className={`bg-[#121212] border rounded-xl p-4 flex items-center justify-between group transition-all ${
                    editingId === cat.id ? 'border-blue-500/50 bg-blue-500/5' : 'border-white/5 hover:border-white/10'
                  }`}
                >
                  <div>
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      {cat.icon && <span>{cat.icon}</span>}
                      {cat.name}
                    </h3>
                    <p className="text-xs text-gray-500 font-mono">{cat.slug}</p>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(cat)}
                      className="p-2 text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                      title="Szerkesztés"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Törlés"
                    >
                      <Trash2 size={18} />
                    </button>
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
