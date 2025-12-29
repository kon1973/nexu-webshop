'use client'

import { useState } from 'react'
import { Plus, Trash2, Image as ImageIcon, Save, Loader2, Upload, Edit, X } from 'lucide-react'
import { toast } from 'sonner'
import type { Banner } from '@prisma/client'

export default function BannerListClient({ banners: initialBanners }: { banners: Banner[] }) {
  const [banners, setBanners] = useState<Banner[]>(initialBanners)
  const [isCreating, setIsCreating] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // New Banner State
  const [newTitle, setNewTitle] = useState('')
  const [newSubtitle, setNewSubtitle] = useState('')
  const [newImage, setNewImage] = useState('')
  const [newLink, setNewLink] = useState('')
  const [newOrder, setNewOrder] = useState(0)
  const [newLocation, setNewLocation] = useState('HOME')
  const [newLinkType, setNewLinkType] = useState('BUTTON')
  const [newShowButton, setNewShowButton] = useState(true)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return
    setUploading(true)

    try {
      const file = e.target.files[0]
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (res.ok) {
        const data = await res.json()
        setNewImage(data.url)
        toast.success('Kép feltöltve')
      } else {
        toast.error('Hiba a feltöltéskor')
      }
    } catch (error) {
      toast.error('Hiba történt')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle || !newImage) {
      toast.error('Cím és kép kötelező')
      return
    }

    try {
      const url = editingId ? `/api/banners/${editingId}` : '/api/banners'
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          subtitle: newSubtitle,
          image: newImage,
          link: newLink,
          order: newOrder,
          location: newLocation,
          linkType: newLinkType,
          showButton: newShowButton,
          isActive: true
        }),
      })

      if (res.ok) {
        const banner = await res.json()
        if (editingId) {
          setBanners(banners.map(b => b.id === editingId ? banner : b))
          toast.success('Banner frissítve')
        } else {
          setBanners([...banners, banner])
          toast.success('Banner létrehozva')
        }
        setIsCreating(false)
        resetForm()
      } else {
        toast.error('Hiba a mentéskor')
      }
    } catch (error) {
      toast.error('Hálózati hiba')
    }
  }

  const handleEdit = (banner: Banner) => {
    setEditingId(banner.id)
    setNewTitle(banner.title)
    setNewSubtitle(banner.subtitle || '')
    setNewImage(banner.image)
    setNewLink(banner.link || '')
    setNewOrder(banner.order)
    setNewLocation(banner.location)
    setNewLinkType(banner.linkType)
    setNewShowButton(banner.showButton)
    setIsCreating(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Biztosan törölni szeretnéd?')) return

    try {
      const res = await fetch(`/api/banners/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setBanners(banners.filter(b => b.id !== id))
        toast.success('Törölve')
      } else {
        toast.error('Hiba a törléskor')
      }
    } catch (error) {
      toast.error('Hálózati hiba')
    }
  }

  const toggleActive = async (banner: Banner) => {
    try {
      const res = await fetch(`/api/banners/${banner.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...banner, isActive: !banner.isActive }),
      })

      if (res.ok) {
        const updated = await res.json()
        setBanners(banners.map(b => b.id === banner.id ? updated : b))
        toast.success('Státusz frissítve')
      }
    } catch (error) {
      toast.error('Hiba a frissítéskor')
    }
  }

  const resetForm = () => {
    setEditingId(null)
    setNewTitle('')
    setNewSubtitle('')
    setNewImage('')
    setNewLink('')
    setNewOrder(0)
    setNewLocation('HOME')
    setNewLinkType('BUTTON')
    setNewShowButton(true)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-12 font-sans">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ImageIcon className="text-pink-500" />
            Bannerek kezelése
          </h1>
          <button
            onClick={() => {
              if (isCreating) {
                setIsCreating(false)
                resetForm()
              } else {
                setIsCreating(true)
              }
            }}
            className="bg-pink-600 hover:bg-pink-500 text-white px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2"
          >
            {isCreating ? <><X size={18} /> Mégse</> : <><Plus size={18} /> Új banner</>}
          </button>
        </div>

        {isCreating && (
          <div className="bg-[#121212] border border-white/5 rounded-2xl p-6 mb-8 animate-in fade-in slide-in-from-top-4">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Banner szerkesztése' : 'Új banner létrehozása'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">Cím</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-3 text-white focus:border-pink-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">Alcím (Opcionális)</label>
                  <input
                    type="text"
                    value={newSubtitle}
                    onChange={(e) => setNewSubtitle(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-3 text-white focus:border-pink-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">Link (Opcionális)</label>
                  <input
                    type="text"
                    value={newLink}
                    onChange={(e) => setNewLink(e.target.value)}
                    placeholder="/shop?category=Mobil"
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-3 text-white focus:border-pink-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">Sorrend</label>
                  <input
                    type="number"
                    value={newOrder}
                    onChange={(e) => setNewOrder(Number(e.target.value))}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-3 text-white focus:border-pink-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">Hely</label>
                  <select
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-3 text-white focus:border-pink-500 outline-none"
                  >
                    <option value="HOME">Főoldal</option>
                    <option value="SHOP">Shop</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">Link Típus</label>
                  <select
                    value={newLinkType}
                    onChange={(e) => setNewLinkType(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-3 text-white focus:border-pink-500 outline-none"
                  >
                    <option value="BUTTON">Gomb</option>
                    <option value="FULL">Teljes kép</option>
                  </select>
                </div>
                <div className="flex items-center pt-8">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newShowButton}
                      onChange={(e) => setNewShowButton(e.target.checked)}
                      className="w-5 h-5 rounded border-gray-600 text-pink-600 focus:ring-pink-500 bg-[#0a0a0a]"
                    />
                    <span className="text-sm font-bold text-gray-400">Gomb megjelenítése</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2">Kép</label>
                <div className="flex items-center gap-4">
                  {newImage && (
                    <div className="w-32 h-20 rounded-lg overflow-hidden border border-white/10">
                      <img src={newImage} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <label className="cursor-pointer bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl flex items-center gap-2 transition-colors">
                    {uploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                    <span>Kép feltöltése</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                  </label>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={uploading}
                  className="bg-pink-600 hover:bg-pink-500 text-white px-6 py-2 rounded-xl font-bold transition-all flex items-center gap-2"
                >
                  <Save size={18} /> {editingId ? 'Mentés' : 'Létrehozás'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className={`bg-[#121212] border ${banner.isActive ? 'border-white/5' : 'border-red-500/20'} rounded-2xl p-4 flex flex-col md:flex-row gap-6 items-center group hover:border-white/10 transition-all`}
            >
              <div className="w-full md:w-48 h-24 rounded-xl overflow-hidden bg-white/5 flex-shrink-0 relative">
                <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                <div className="absolute top-1 left-1 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm">
                  {banner.location === 'SHOP' ? 'SHOP' : 'HOME'}
                </div>
              </div>

              <div className="flex-grow text-center md:text-left">
                <h3 className="font-bold text-xl">{banner.title}</h3>
                {banner.subtitle && <p className="text-gray-400 text-sm">{banner.subtitle}</p>}
                {banner.link && (
                  <div className="flex items-center gap-2 justify-center md:justify-start mt-1">
                    <p className="text-pink-400 text-xs font-mono">{banner.link}</p>
                    <span className="text-[10px] bg-white/10 px-1.5 rounded text-gray-400">
                      {banner.linkType === 'FULL' ? 'Teljes kép' : 'Gomb'}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-500 font-mono">#{banner.order}</div>
                <button
                  onClick={() => toggleActive(banner)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                    banner.isActive 
                      ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                      : 'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}
                >
                  {banner.isActive ? 'Aktív' : 'Inaktív'}
                </button>
                <button
                  onClick={() => handleEdit(banner)}
                  className="p-2 text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                  title="Szerkesztés"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(banner.id)}
                  className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Törlés"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          {banners.length === 0 && !isCreating && (
            <div className="text-center text-gray-500 py-12">
              Még nincsenek bannerek. Hozz létre egyet!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
