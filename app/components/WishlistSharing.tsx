'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Heart, Share2, Users, Link as LinkIcon, Copy, Mail, 
  MessageCircle, Check, Plus, Minus, Trash2, ShoppingCart,
  Lock, Unlock, Eye, EyeOff, Crown, User, X, Gift
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useFavorites } from '@/context/FavoritesContext'
import { useCart } from '@/context/CartContext'
import { getImageUrl } from '@/lib/image'

interface WishlistItem {
  id: number
  name: string
  price: number
  image: string | null
  category?: string
  slug?: string
  priority: 'high' | 'medium' | 'low'
  notes?: string
  addedAt: string
  reservedBy?: string
}

interface Collaborator {
  id: string
  name: string
  email: string
  role: 'owner' | 'editor' | 'viewer'
  avatar?: string
}

interface SharedWishlist {
  id: string
  name: string
  description?: string
  isPublic: boolean
  items: WishlistItem[]
  collaborators: Collaborator[]
  createdAt: string
  shareCode: string
}

const STORAGE_KEY = 'nexu-shared-wishlists'

export default function WishlistSharing() {
  const { favorites, toggleFavorite, isFavorite } = useFavorites()
  const { addToCart } = useCart()
  const [wishlists, setWishlists] = useState<SharedWishlist[]>([])
  const [selectedWishlist, setSelectedWishlist] = useState<SharedWishlist | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showCollaboratorModal, setShowCollaboratorModal] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [newListDescription, setNewListDescription] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('viewer')

  // Load wishlists
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setWishlists(JSON.parse(saved))
      } catch {}
    }
  }, [])

  // Save wishlists
  useEffect(() => {
    if (wishlists.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlists))
    }
  }, [wishlists])

  const generateShareCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  const createWishlist = () => {
    if (!newListName.trim()) {
      toast.error('Add meg a lista nevét!')
      return
    }

    const newList: SharedWishlist = {
      id: Date.now().toString(),
      name: newListName,
      description: newListDescription,
      isPublic: false,
      items: [],
      collaborators: [
        { id: 'owner', name: 'Te', email: '', role: 'owner' }
      ],
      createdAt: new Date().toISOString(),
      shareCode: generateShareCode()
    }

    setWishlists(prev => [...prev, newList])
    setSelectedWishlist(newList)
    setShowCreateModal(false)
    setNewListName('')
    setNewListDescription('')
    toast.success('Kívánságlista létrehozva!')
  }

  const deleteWishlist = (id: string) => {
    setWishlists(prev => prev.filter(w => w.id !== id))
    if (selectedWishlist?.id === id) {
      setSelectedWishlist(null)
    }
    toast.success('Kívánságlista törölve')
  }

  const addToWishlist = (product: any) => {
    if (!selectedWishlist) return

    const newItem: WishlistItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      slug: product.slug,
      priority: 'medium',
      addedAt: new Date().toISOString()
    }

    setWishlists(prev => prev.map(w => 
      w.id === selectedWishlist.id 
        ? { ...w, items: [...w.items, newItem] }
        : w
    ))
    setSelectedWishlist(prev => prev ? { ...prev, items: [...prev.items, newItem] } : null)
    toast.success('Hozzáadva a listához!')
  }

  const removeFromWishlist = (productId: number) => {
    if (!selectedWishlist) return

    setWishlists(prev => prev.map(w => 
      w.id === selectedWishlist.id 
        ? { ...w, items: w.items.filter(i => i.id !== productId) }
        : w
    ))
    setSelectedWishlist(prev => 
      prev ? { ...prev, items: prev.items.filter(i => i.id !== productId) } : null
    )
  }

  const updateItemPriority = (productId: number, priority: 'high' | 'medium' | 'low') => {
    if (!selectedWishlist) return

    setWishlists(prev => prev.map(w => 
      w.id === selectedWishlist.id 
        ? { ...w, items: w.items.map(i => i.id === productId ? { ...i, priority } : i) }
        : w
    ))
    setSelectedWishlist(prev => 
      prev ? { ...prev, items: prev.items.map(i => i.id === productId ? { ...i, priority } : i) } : null
    )
  }

  const togglePublic = () => {
    if (!selectedWishlist) return

    const newPublic = !selectedWishlist.isPublic
    setWishlists(prev => prev.map(w => 
      w.id === selectedWishlist.id ? { ...w, isPublic: newPublic } : w
    ))
    setSelectedWishlist(prev => prev ? { ...prev, isPublic: newPublic } : null)
    toast.success(newPublic ? 'Lista most már publikus' : 'Lista privát lett')
  }

  const copyShareLink = () => {
    if (!selectedWishlist) return
    const link = `${window.location.origin}/wishlist/${selectedWishlist.shareCode}`
    navigator.clipboard.writeText(link)
    toast.success('Link másolva!')
  }

  const shareViaWhatsApp = () => {
    if (!selectedWishlist) return
    const link = `${window.location.origin}/wishlist/${selectedWishlist.shareCode}`
    const message = `Nézd meg a kívánságlistámat: ${selectedWishlist.name}\n${link}`
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
  }

  const shareViaEmail = () => {
    if (!selectedWishlist) return
    const link = `${window.location.origin}/wishlist/${selectedWishlist.shareCode}`
    const subject = `${selectedWishlist.name} - Kívánságlista`
    const body = `Szia!\n\nNézd meg a kívánságlistámat: ${selectedWishlist.name}\n\n${link}`
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
  }

  const inviteCollaborator = () => {
    if (!inviteEmail.trim() || !selectedWishlist) {
      toast.error('Add meg az email címet!')
      return
    }

    const newCollaborator: Collaborator = {
      id: Date.now().toString(),
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole
    }

    setWishlists(prev => prev.map(w => 
      w.id === selectedWishlist.id 
        ? { ...w, collaborators: [...w.collaborators, newCollaborator] }
        : w
    ))
    setSelectedWishlist(prev => 
      prev ? { ...prev, collaborators: [...prev.collaborators, newCollaborator] } : null
    )
    setInviteEmail('')
    toast.success('Meghívó elküldve!')
  }

  const removeCollaborator = (collaboratorId: string) => {
    if (!selectedWishlist) return

    setWishlists(prev => prev.map(w => 
      w.id === selectedWishlist.id 
        ? { ...w, collaborators: w.collaborators.filter(c => c.id !== collaboratorId) }
        : w
    ))
    setSelectedWishlist(prev => 
      prev ? { ...prev, collaborators: prev.collaborators.filter(c => c.id !== collaboratorId) } : null
    )
  }

  const reserveItem = (productId: number, reserverName: string) => {
    if (!selectedWishlist) return

    setWishlists(prev => prev.map(w => 
      w.id === selectedWishlist.id 
        ? { ...w, items: w.items.map(i => i.id === productId ? { ...i, reservedBy: reserverName } : i) }
        : w
    ))
    setSelectedWishlist(prev => 
      prev ? { ...prev, items: prev.items.map(i => i.id === productId ? { ...i, reservedBy: reserverName } : i) } : null
    )
    toast.success('Termék lefoglalva!')
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/20'
      case 'low': return 'text-gray-400 bg-gray-500/20'
      default: return 'text-yellow-400 bg-yellow-500/20'
    }
  }

  const totalValue = selectedWishlist?.items.reduce((sum, item) => sum + item.price, 0) || 0

  return (
    <div className="bg-[#121212] border border-white/10 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-900/30 to-purple-900/30 border-b border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-pink-500/20 rounded-xl">
              <Heart className="text-pink-400" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Kívánságlisták</h2>
              <p className="text-gray-400 text-sm">Hozz létre és ossz meg listákat</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-lg transition-colors"
          >
            <Plus size={18} />
            Új lista
          </button>
        </div>

        {/* Wishlist tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {wishlists.map(list => (
            <button
              key={list.id}
              onClick={() => setSelectedWishlist(list)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                selectedWishlist?.id === list.id
                  ? 'bg-white/20 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {list.isPublic ? <Unlock size={14} /> : <Lock size={14} />}
              {list.name}
              <span className="bg-white/10 px-1.5 py-0.5 rounded text-xs">
                {list.items.length}
              </span>
            </button>
          ))}
          {wishlists.length === 0 && (
            <p className="text-gray-500 text-sm">Még nincs kívánságlistád</p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {selectedWishlist ? (
          <>
            {/* List header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  {selectedWishlist.name}
                  {selectedWishlist.isPublic ? (
                    <Eye size={16} className="text-gray-400" />
                  ) : (
                    <EyeOff size={16} className="text-gray-400" />
                  )}
                </h3>
                {selectedWishlist.description && (
                  <p className="text-gray-400 text-sm mt-1">{selectedWishlist.description}</p>
                )}
                <p className="text-gray-500 text-xs mt-2">
                  Összérték: {totalValue.toLocaleString('hu-HU')} Ft
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCollaboratorModal(true)}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                  title="Együttműködők"
                >
                  <Users size={18} className="text-gray-400" />
                </button>
                <button
                  onClick={() => setShowShareModal(true)}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                  title="Megosztás"
                >
                  <Share2 size={18} className="text-gray-400" />
                </button>
                <button
                  onClick={togglePublic}
                  className={`p-2 rounded-lg transition-colors ${
                    selectedWishlist.isPublic 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                  title={selectedWishlist.isPublic ? 'Privátá tétel' : 'Publikusá tétel'}
                >
                  {selectedWishlist.isPublic ? <Unlock size={18} /> : <Lock size={18} />}
                </button>
                <button
                  onClick={() => deleteWishlist(selectedWishlist.id)}
                  className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                  title="Törlés"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {/* Collaborators preview */}
            {selectedWishlist.collaborators.length > 1 && (
              <div className="flex items-center gap-2 mb-4 p-3 bg-white/5 rounded-xl">
                <Users size={16} className="text-gray-400" />
                <div className="flex -space-x-2">
                  {selectedWishlist.collaborators.slice(0, 5).map((collab, i) => (
                    <div
                      key={collab.id}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 border-[#121212] ${
                        collab.role === 'owner' 
                          ? 'bg-yellow-500 text-black' 
                          : collab.role === 'editor'
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-500 text-white'
                      }`}
                      title={`${collab.name} (${collab.role})`}
                    >
                      {collab.role === 'owner' ? <Crown size={12} /> : collab.name[0].toUpperCase()}
                    </div>
                  ))}
                </div>
                <span className="text-gray-400 text-sm">
                  {selectedWishlist.collaborators.length} résztvevő
                </span>
              </div>
            )}

            {/* Items */}
            {selectedWishlist.items.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="text-gray-500" size={28} />
                </div>
                <p className="text-gray-400">A lista üres</p>
                <p className="text-gray-600 text-sm mt-2">
                  Add hozzá kedvenceidet a listához
                </p>
                {favorites.length > 0 && (
                  <div className="mt-4">
                    <p className="text-gray-500 text-xs mb-2">Kedvenceidből:</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {favorites.slice(0, 3).map(fav => (
                        <button
                          key={fav.id}
                          onClick={() => addToWishlist(fav)}
                          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-sm transition-colors"
                        >
                          + {fav.name.slice(0, 20)}...
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {selectedWishlist.items.map(item => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                      item.reservedBy 
                        ? 'bg-green-500/10 border-green-500/30' 
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    {/* Image */}
                    <div className="w-16 h-16 bg-black/30 rounded-lg overflow-hidden flex-shrink-0">
                      {getImageUrl(item.image) ? (
                        <img 
                          src={getImageUrl(item.image)!} 
                          alt={item.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Gift size={24} className="text-gray-500" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/shop/${item.slug || item.id}`} className="text-white font-medium hover:text-purple-400 transition-colors">
                        {item.name}
                      </Link>
                      <p className="text-purple-400 font-bold">
                        {item.price.toLocaleString('hu-HU')} Ft
                      </p>
                      {item.reservedBy && (
                        <p className="text-green-400 text-xs flex items-center gap-1 mt-1">
                          <Check size={12} />
                          Lefoglalta: {item.reservedBy}
                        </p>
                      )}
                    </div>

                    {/* Priority */}
                    <select
                      value={item.priority}
                      onChange={(e) => updateItemPriority(item.id, e.target.value as any)}
                      className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(item.priority)} border-0 bg-transparent cursor-pointer`}
                    >
                      <option value="high">Fontos</option>
                      <option value="medium">Normál</option>
                      <option value="low">Kevésbé fontos</option>
                    </select>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {!item.reservedBy && (
                        <button
                          onClick={() => {
                            addToCart({
                              id: item.id,
                              name: item.name,
                              price: item.price,
                              image: item.image || '',
                              category: item.category || ''
                            })
                            toast.success('Hozzáadva a kosárhoz!')
                          }}
                          className="p-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors"
                          title="Kosárba"
                        >
                          <ShoppingCart size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => removeFromWishlist(item.id)}
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                        title="Eltávolítás"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Add from favorites */}
            {favorites.length > 0 && selectedWishlist.items.length > 0 && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-gray-500 text-sm mb-3">Hozzáadás kedvencekből:</p>
                <div className="flex flex-wrap gap-2">
                  {favorites
                    .filter(f => !selectedWishlist.items.some(i => i.id === f.id))
                    .slice(0, 5)
                    .map(fav => (
                      <button
                        key={fav.id}
                        onClick={() => addToWishlist(fav)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-sm transition-colors"
                      >
                        <Plus size={14} />
                        {fav.name.slice(0, 15)}...
                      </button>
                    ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="text-gray-500" size={28} />
            </div>
            <p className="text-gray-400">Válassz egy kívánságlistát vagy hozz létre újat</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 px-6 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <Plus size={18} />
              Új lista létrehozása
            </button>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50"
              onClick={() => setShowCreateModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 z-50"
            >
              <h3 className="text-lg font-bold text-white mb-4">Új kívánságlista</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Lista neve</label>
                  <input
                    type="text"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder="pl. Születésnapi kívánságok"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Leírás (opcionális)</label>
                  <textarea
                    value={newListDescription}
                    onChange={(e) => setNewListDescription(e.target.value)}
                    placeholder="Pár szó a listáról..."
                    rows={2}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-colors"
                >
                  Mégse
                </button>
                <button
                  onClick={createWishlist}
                  className="flex-1 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-lg transition-colors"
                >
                  Létrehozás
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && selectedWishlist && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50"
              onClick={() => setShowShareModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 z-50"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Lista megosztása</h3>
                <button onClick={() => setShowShareModal(false)} className="p-1 hover:bg-white/10 rounded">
                  <X size={18} className="text-gray-400" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-gray-400 text-xs mb-1">Megosztási kód</p>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-mono text-lg">{selectedWishlist.shareCode}</p>
                    <button
                      onClick={copyShareLink}
                      className="p-1.5 bg-white/10 hover:bg-white/20 rounded transition-colors"
                    >
                      <Copy size={14} className="text-gray-400" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={copyShareLink}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-colors"
                  >
                    <LinkIcon size={18} />
                    Link másolása
                  </button>
                  <button
                    onClick={shareViaWhatsApp}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg transition-colors"
                  >
                    <MessageCircle size={18} />
                    WhatsApp
                  </button>
                  <button
                    onClick={shareViaEmail}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-colors"
                  >
                    <Mail size={18} />
                    Email
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Collaborator Modal */}
      <AnimatePresence>
        {showCollaboratorModal && selectedWishlist && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50"
              onClick={() => setShowCollaboratorModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 z-50"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Együttműködők</h3>
                <button onClick={() => setShowCollaboratorModal(false)} className="p-1 hover:bg-white/10 rounded">
                  <X size={18} className="text-gray-400" />
                </button>
              </div>

              {/* Current collaborators */}
              <div className="space-y-2 mb-4">
                {selectedWishlist.collaborators.map(collab => (
                  <div key={collab.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        collab.role === 'owner' ? 'bg-yellow-500' : 'bg-purple-500'
                      }`}>
                        {collab.role === 'owner' ? (
                          <Crown size={14} className="text-black" />
                        ) : (
                          <User size={14} className="text-white" />
                        )}
                      </div>
                      <div>
                        <p className="text-white text-sm">{collab.name}</p>
                        <p className="text-gray-500 text-xs">{collab.role === 'owner' ? 'Tulajdonos' : collab.role === 'editor' ? 'Szerkesztő' : 'Megtekintő'}</p>
                      </div>
                    </div>
                    {collab.role !== 'owner' && (
                      <button
                        onClick={() => removeCollaborator(collab.id)}
                        className="p-1.5 hover:bg-red-500/20 text-red-400 rounded transition-colors"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Invite form */}
              <div className="pt-4 border-t border-white/10">
                <p className="text-gray-400 text-sm mb-3">Meghívás</p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as any)}
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                  >
                    <option value="viewer">Megtekintő</option>
                    <option value="editor">Szerkesztő</option>
                  </select>
                </div>
                <button
                  onClick={inviteCollaborator}
                  className="w-full mt-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
                >
                  Meghívás küldése
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
