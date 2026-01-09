'use client'

import { useState, useTransition, useEffect } from 'react'
import { ListTodo, Sparkles, Loader2, Plus, Trash2, Check, ShoppingCart, Share2, Download, Clock, Tag, Search, ArrowRight, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { optimizeShoppingList, findBestDealsForList } from '@/lib/actions/user-actions'
import { useCart } from '@/context/CartContext'
import { getImageUrl } from '@/lib/image'
import { toast } from 'sonner'

interface ShoppingListItem {
  id: string
  name: string
  productId?: number
  slug?: string
  price?: number
  image?: string | null
  category?: string
  quantity: number
  purchased: boolean
  notes?: string
  priority: 'high' | 'medium' | 'low'
  addedAt: Date
}

interface ListOptimization {
  totalOriginal: number
  totalOptimized: number
  savings: number
  suggestions: Array<{
    originalItem: string
    betterProduct?: {
      id: number
      name: string
      slug: string
      price: number
      image: string | null
    }
    reason: string
  }>
  purchaseOrder: string[]
  tips: string[]
}

interface Deal {
  itemName: string
  product: {
    id: number
    name: string
    slug: string
    price: number
    originalPrice?: number
    image: string | null
    discount: number
  }
}

const PRIORITY_STYLES = {
  high: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
  medium: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  low: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' }
}

const STORAGE_KEY = 'nexu-shopping-list'

export default function AIShoppingList() {
  const { addToCart } = useCart()
  const [items, setItems] = useState<ShoppingListItem[]>([])
  const [newItemName, setNewItemName] = useState('')
  const [newItemPriority, setNewItemPriority] = useState<'high' | 'medium' | 'low'>('medium')
  const [showAddForm, setShowAddForm] = useState(false)
  const [optimization, setOptimization] = useState<ListOptimization | null>(null)
  const [deals, setDeals] = useState<Deal[]>([])
  const [isOptimizing, startOptimizing] = useTransition()
  const [isFindingDeals, startFindingDeals] = useTransition()
  const [activeTab, setActiveTab] = useState<'list' | 'optimize' | 'deals'>('list')

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setItems(parsed.map((item: ShoppingListItem) => ({
          ...item,
          addedAt: new Date(item.addedAt)
        })))
      } catch {
        // ignore
      }
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = () => {
    if (!newItemName.trim()) return

    const newItem: ShoppingListItem = {
      id: `item-${Date.now()}`,
      name: newItemName.trim(),
      quantity: 1,
      purchased: false,
      priority: newItemPriority,
      addedAt: new Date()
    }

    setItems(prev => [newItem, ...prev])
    setNewItemName('')
    setShowAddForm(false)
    toast.success('Tétel hozzáadva!')
  }

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }

  const togglePurchased = (id: string) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, purchased: !item.purchased } : item
    ))
  }

  const updateQuantity = (id: string, delta: number) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ))
  }

  const clearPurchased = () => {
    setItems(prev => prev.filter(item => !item.purchased))
    toast.success('Megvásárolt tételek törölve')
  }

  const handleOptimize = () => {
    if (items.length === 0) {
      toast.error('Adj hozzá tételeket a listához!')
      return
    }

    startOptimizing(async () => {
      const res = await optimizeShoppingList(items.filter(i => !i.purchased).map(i => ({
        id: i.id,
        name: i.name,
        quantity: i.quantity,
        priority: i.priority
      })))

      if (res.success && res.optimization) {
        setOptimization(res.optimization)
        setActiveTab('optimize')
      } else {
        toast.error(res.error || 'Hiba az optimalizálás során')
      }
    })
  }

  const handleFindDeals = () => {
    if (items.length === 0) {
      toast.error('Adj hozzá tételeket a listához!')
      return
    }

    startFindingDeals(async () => {
      const res = await findBestDealsForList(items.filter(i => !i.purchased).map(i => i.name))

      if (res.success && res.deals) {
        setDeals(res.deals)
        setActiveTab('deals')
      } else {
        toast.error(res.error || 'Hiba az ajánlatok keresésekor')
      }
    })
  }

  const addProductToCart = (product: { id: number; name: string; price: number; image?: string | null }) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || undefined,
      category: ''
    })
    toast.success('Kosárba téve!')
  }

  const exportList = () => {
    const text = items.map(i => 
      `${i.purchased ? '✓' : '○'} ${i.name} (${i.quantity}x) - ${i.priority === 'high' ? 'Sürgős' : i.priority === 'medium' ? 'Normál' : 'Ráér'}`
    ).join('\n')
    
    navigator.clipboard.writeText(text)
    toast.success('Lista másolva a vágólapra!')
  }

  const unpurchasedCount = items.filter(i => !i.purchased).length
  const purchasedCount = items.filter(i => i.purchased).length

  return (
    <div className="bg-gradient-to-br from-emerald-900/20 via-teal-900/20 to-cyan-900/20 rounded-2xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl">
              <ListTodo size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Tech Kívánságlista</h2>
              <p className="text-gray-400 text-sm">Tervezd meg tech beszerzéseidet AI segítséggel</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold">{unpurchasedCount}</span>
            <span className="text-gray-500 text-sm">/ {items.length} tétel</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-4">
          {[
            { id: 'list', label: 'Lista', icon: ListTodo },
            { id: 'optimize', label: 'Optimalizálás', icon: Sparkles },
            { id: 'deals', label: 'Akciók', icon: Tag }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-500/30 text-emerald-400'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          {/* List Tab */}
          {activeTab === 'list' && (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Add Item Form */}
              {showAddForm ? (
                <div className="mb-4 p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder="Milyen tech eszközt keresel? (pl. vezeték nélküli fülhallgató)"
                      className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                      onKeyDown={(e) => e.key === 'Enter' && addItem()}
                      autoFocus
                    />
                    <select
                      value={newItemPriority}
                      onChange={(e) => setNewItemPriority(e.target.value as typeof newItemPriority)}
                      className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="high">Sürgős</option>
                      <option value="medium">Normál</option>
                      <option value="low">Ráér</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-2 mt-3">
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 text-gray-400 hover:text-white"
                    >
                      Mégse
                    </button>
                    <button
                      onClick={addItem}
                      disabled={!newItemName.trim()}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 text-white rounded-lg"
                    >
                      Hozzáadás
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="w-full mb-4 py-3 border-2 border-dashed border-white/20 hover:border-emerald-500/50 rounded-xl text-gray-400 hover:text-emerald-400 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={20} />
                  Új tétel hozzáadása
                </button>
              )}

              {/* Items List */}
              {items.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <ListTodo size={48} className="mx-auto mb-3 opacity-50" />
                  <p>Még üres a bevásárlólistád</p>
                  <p className="text-sm">Adj hozzá tételeket a fenti gombbal</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Unpurchased items */}
                  {items.filter(i => !i.purchased).map(item => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${PRIORITY_STYLES[item.priority].border} bg-white/5`}
                    >
                      <button
                        onClick={() => togglePurchased(item.id)}
                        className="w-6 h-6 rounded-full border-2 border-gray-500 hover:border-emerald-500 flex items-center justify-center transition-colors"
                      >
                        {item.purchased && <Check size={14} className="text-emerald-500" />}
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{item.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${PRIORITY_STYLES[item.priority].bg} ${PRIORITY_STYLES[item.priority].text}`}>
                            {item.priority === 'high' ? 'Sürgős' : item.priority === 'medium' ? 'Normál' : 'Ráér'}
                          </span>
                          {item.price && (
                            <span className="text-xs text-gray-500">{item.price.toLocaleString('hu-HU')} Ft</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-7 h-7 flex items-center justify-center rounded bg-white/10 text-gray-400 hover:text-white"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-7 h-7 flex items-center justify-center rounded bg-white/10 text-gray-400 hover:text-white"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </motion.div>
                  ))}

                  {/* Purchased items */}
                  {purchasedCount > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400 text-sm">Megvásárolva ({purchasedCount})</span>
                        <button
                          onClick={clearPurchased}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          Törlés
                        </button>
                      </div>
                      {items.filter(i => i.purchased).map(item => (
                        <motion.div
                          key={item.id}
                          layout
                          className="flex items-center gap-3 p-3 rounded-xl bg-white/5 opacity-50"
                        >
                          <button
                            onClick={() => togglePurchased(item.id)}
                            className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center"
                          >
                            <Check size={14} className="text-white" />
                          </button>
                          <span className="text-gray-400 line-through flex-1">{item.name}</span>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-2 text-gray-600 hover:text-red-400"
                          >
                            <Trash2 size={16} />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              {items.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-6">
                  <button
                    onClick={handleOptimize}
                    disabled={isOptimizing || unpurchasedCount === 0}
                    className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-gray-700 disabled:to-gray-700 text-white rounded-xl flex items-center justify-center gap-2"
                  >
                    {isOptimizing ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Sparkles size={18} />
                    )}
                    AI Optimalizálás
                  </button>
                  <button
                    onClick={handleFindDeals}
                    disabled={isFindingDeals || unpurchasedCount === 0}
                    className="flex-1 py-3 bg-orange-600 hover:bg-orange-500 disabled:bg-gray-700 text-white rounded-xl flex items-center justify-center gap-2"
                  >
                    {isFindingDeals ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Tag size={18} />
                    )}
                    Akciók keresése
                  </button>
                  <button
                    onClick={exportList}
                    className="py-3 px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl"
                  >
                    <Share2 size={18} />
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* Optimize Tab */}
          {activeTab === 'optimize' && optimization && (
            <motion.div
              key="optimize"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Savings Summary */}
              <div className="p-4 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl border border-emerald-500/30">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-400 text-sm">Eredeti összeg</p>
                    <p className="text-white text-lg">{optimization.totalOriginal.toLocaleString('hu-HU')} Ft</p>
                  </div>
                  <ArrowRight className="text-emerald-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Optimalizált</p>
                    <p className="text-emerald-400 text-lg font-bold">{optimization.totalOptimized.toLocaleString('hu-HU')} Ft</p>
                  </div>
                  <div className="p-3 bg-emerald-500/30 rounded-xl">
                    <p className="text-emerald-400 text-xl font-bold">-{optimization.savings.toLocaleString('hu-HU')} Ft</p>
                    <p className="text-emerald-300 text-xs">megtakarítás</p>
                  </div>
                </div>
              </div>

              {/* Suggestions */}
              {optimization.suggestions.length > 0 && (
                <div>
                  <h4 className="font-semibold text-white mb-3">Jobb alternatívák</h4>
                  <div className="space-y-3">
                    {optimization.suggestions.map((sug, i) => (
                      <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-yellow-500/20 rounded-lg">
                            <Tag size={16} className="text-yellow-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-medium">{sug.originalItem}</p>
                            <p className="text-gray-400 text-sm mt-1">{sug.reason}</p>
                            {sug.betterProduct && (
                              <Link
                                href={`/shop/${sug.betterProduct.slug}`}
                                className="mt-3 flex items-center gap-3 p-2 bg-white/5 rounded-lg hover:bg-white/10"
                              >
                                {sug.betterProduct.image && (
                                  <div className="w-12 h-12 relative rounded overflow-hidden">
                                    <Image
                                      src={getImageUrl(sug.betterProduct.image) || ''}
                                      alt={sug.betterProduct.name}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                )}
                                <div className="flex-1">
                                  <p className="text-white text-sm">{sug.betterProduct.name}</p>
                                  <p className="text-emerald-400 font-bold">{sug.betterProduct.price.toLocaleString('hu-HU')} Ft</p>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault()
                                    addProductToCart(sug.betterProduct!)
                                  }}
                                  className="p-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg"
                                >
                                  <ShoppingCart size={16} className="text-white" />
                                </button>
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Purchase Order */}
              {optimization.purchaseOrder.length > 0 && (
                <div>
                  <h4 className="font-semibold text-white mb-3">Javasolt vásárlási sorrend</h4>
                  <ol className="space-y-2">
                    {optimization.purchaseOrder.map((step, i) => (
                      <li key={i} className="flex items-start gap-3 text-gray-300">
                        <span className="w-6 h-6 flex items-center justify-center bg-emerald-500/30 text-emerald-400 rounded-full text-sm shrink-0">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Tips */}
              {optimization.tips.length > 0 && (
                <div>
                  <h4 className="font-semibold text-white mb-3">Spórolási tippek</h4>
                  <ul className="space-y-2">
                    {optimization.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-400 text-sm">
                        <Sparkles size={14} className="text-yellow-400 mt-0.5 shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}

          {/* Deals Tab */}
          {activeTab === 'deals' && (
            <motion.div
              key="deals"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {deals.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Tag size={48} className="mx-auto mb-3 opacity-50" />
                  <p>Nincs találat</p>
                  <p className="text-sm">Kattints az "Akciók keresése" gombra</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {deals.map((deal, i) => (
                    <div key={i} className="p-4 bg-white/5 rounded-xl border border-orange-500/30">
                      <p className="text-gray-400 text-sm mb-2">Keresés: <span className="text-white">{deal.itemName}</span></p>
                      <Link
                        href={`/shop/${deal.product.slug}`}
                        className="flex items-center gap-4"
                      >
                        {deal.product.image && (
                          <div className="w-16 h-16 relative rounded-lg overflow-hidden">
                            <Image
                              src={getImageUrl(deal.product.image) || ''}
                              alt={deal.product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <h5 className="text-white font-medium">{deal.product.name}</h5>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-orange-400 font-bold">{deal.product.price.toLocaleString('hu-HU')} Ft</span>
                            {deal.product.originalPrice && (
                              <span className="text-gray-500 line-through text-sm">{deal.product.originalPrice.toLocaleString('hu-HU')} Ft</span>
                            )}
                            {deal.product.discount > 0 && (
                              <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">-{deal.product.discount}%</span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            addProductToCart(deal.product)
                          }}
                          className="p-3 bg-orange-600 hover:bg-orange-500 rounded-xl"
                        >
                          <ShoppingCart size={18} className="text-white" />
                        </button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
