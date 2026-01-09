'use client'

import { useState, useTransition, useEffect } from 'react'
import { Wallet, Sparkles, Calculator, ShoppingCart, TrendingUp, AlertCircle, Check, Plus, Minus, Trash2, ArrowRight, Loader2, PiggyBank, Target, BarChart3, Download, Share2, Save, FolderOpen, Copy, FileText } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { analyzeBudgetPlan, getSmartBudgetSuggestions } from '@/lib/actions/user-actions'
import { useCart, CartItem } from '@/context/CartContext'
import { toast } from 'sonner'
import { getImageUrl } from '@/lib/image'

interface BudgetItem {
  id: string
  name: string
  productId?: number
  slug?: string | null
  price: number
  priority: 'must-have' | 'nice-to-have' | 'optional'
  category?: string
  image?: string | null
}

interface BudgetAnalysis {
  totalCost: number
  budgetStatus: 'under' | 'over' | 'exact'
  savings: number
  recommendations: Array<{
    type: 'swap' | 'remove' | 'add' | 'wait'
    itemId?: string
    suggestion: string
    potentialSavings?: number
    alternativeProduct?: {
      id: number
      name: string
      price: number
      slug?: string | null
      image?: string | null
    }
  }>
  priorityBreakdown: {
    mustHave: number
    niceToHave: number
    optional: number
  }
  aiAdvice: string
  savingsTips: string[]
}

const PRIORITY_COLORS = {
  'must-have': 'bg-red-500/20 text-red-400 border-red-500/30',
  'nice-to-have': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'optional': 'bg-green-500/20 text-green-400 border-green-500/30'
}

const PRIORITY_LABELS = {
  'must-have': 'Kötelező',
  'nice-to-have': 'Jó lenne',
  'optional': 'Opcionális'
}

interface SavedPlan {
  id: string
  name: string
  budget: number
  items: BudgetItem[]
  createdAt: number
}

const STORAGE_KEY = 'nexu-budget-plans'

export default function AIBudgetPlanner() {
  const { addToCart, cart: cartItems } = useCart()
  const [budget, setBudget] = useState('')
  const [items, setItems] = useState<BudgetItem[]>([])
  const [newItemName, setNewItemName] = useState('')
  const [newItemPrice, setNewItemPrice] = useState('')
  const [newItemPriority, setNewItemPriority] = useState<BudgetItem['priority']>('nice-to-have')
  const [analysis, setAnalysis] = useState<BudgetAnalysis | null>(null)
  const [isAnalyzing, startAnalysis] = useTransition()
  const [isGettingSuggestions, startSuggestions] = useTransition()
  const [showAddForm, setShowAddForm] = useState(false)
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([])
  const [showSavedPlans, setShowSavedPlans] = useState(false)
  const [planName, setPlanName] = useState('')
  const [showSaveDialog, setShowSaveDialog] = useState(false)

  // Load saved plans
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) setSavedPlans(JSON.parse(saved))
  }, [])

  // Save current plan
  const savePlan = () => {
    if (!planName.trim() || items.length === 0) {
      toast.error('Add meg a terv nevét és adj hozzá termékeket!')
      return
    }
    const plan: SavedPlan = {
      id: Date.now().toString(),
      name: planName.trim(),
      budget: parseInt(budget) || 0,
      items: items,
      createdAt: Date.now()
    }
    const newPlans = [plan, ...savedPlans].slice(0, 10)
    setSavedPlans(newPlans)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPlans))
    setShowSaveDialog(false)
    setPlanName('')
    toast.success('Terv mentve!')
  }

  // Load saved plan
  const loadPlan = (plan: SavedPlan) => {
    setBudget(plan.budget.toString())
    setItems(plan.items)
    setShowSavedPlans(false)
    toast.success(`"${plan.name}" betöltve`)
  }

  // Delete saved plan
  const deletePlan = (id: string) => {
    const newPlans = savedPlans.filter(p => p.id !== id)
    setSavedPlans(newPlans)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPlans))
    toast.success('Terv törölve')
  }

  // Export as text
  const exportAsText = () => {
    const totalCost = items.reduce((sum, item) => sum + item.price, 0)
    const text = `NEXU Tech Költségvetési Terv\n${'='.repeat(30)}\n\nKöltségkeret: ${parseInt(budget).toLocaleString('hu-HU')} Ft\n\nTermékek:\n${items.map(i => `- ${i.name}: ${i.price.toLocaleString('hu-HU')} Ft (${PRIORITY_LABELS[i.priority]})`).join('\n')}\n\nÖsszesen: ${totalCost.toLocaleString('hu-HU')} Ft\nMaradék: ${(parseInt(budget) - totalCost).toLocaleString('hu-HU')} Ft\n\nLétrehozva: ${new Date().toLocaleDateString('hu-HU')}`
    
    navigator.clipboard.writeText(text)
    toast.success('Vágólapra másolva!')
  }

  // Share plan
  const sharePlan = async () => {
    const totalCost = items.reduce((sum, item) => sum + item.price, 0)
    const shareData = {
      title: 'NEXU Költségvetési Terv',
      text: `Költségkeret: ${parseInt(budget).toLocaleString('hu-HU')} Ft | Összesen: ${totalCost.toLocaleString('hu-HU')} Ft | ${items.length} termék`,
      url: window.location.href
    }
    
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch {
        exportAsText()
      }
    } else {
      exportAsText()
    }
  }

  // Add all items to cart
  const addAllToCart = () => {
    items.filter(i => i.productId).forEach(item => {
      addToCart({
        id: item.productId!,
        name: item.name,
        price: item.price,
        image: item.image || '',
        category: item.category || ''
      })
    })
    toast.success(`${items.filter(i => i.productId).length} termék hozzáadva a kosárhoz!`)
  }

  // Import cart items to budget
  const importFromCart = () => {
    const newItems: BudgetItem[] = cartItems.map((item: CartItem) => ({
      id: `cart-${item.id}`,
      name: item.name,
      productId: item.id,
      price: item.price,
      priority: 'nice-to-have' as const,
      category: item.category,
      image: item.image
    }))
    
    setItems(prev => {
      const existingIds = prev.map(i => i.productId)
      const uniqueNew = newItems.filter(n => !existingIds.includes(n.productId))
      return [...prev, ...uniqueNew]
    })
    
    toast.success(`${newItems.length} termék importálva a kosárból`)
  }

  // Add manual item
  const addItem = () => {
    if (!newItemName.trim() || !newItemPrice) return

    const newItem: BudgetItem = {
      id: `manual-${Date.now()}`,
      name: newItemName.trim(),
      price: parseInt(newItemPrice),
      priority: newItemPriority
    }

    setItems(prev => [...prev, newItem])
    setNewItemName('')
    setNewItemPrice('')
    setShowAddForm(false)
  }

  // Remove item
  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }

  // Update priority
  const updatePriority = (id: string, priority: BudgetItem['priority']) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, priority } : item
    ))
  }

  // Analyze budget
  const handleAnalyze = () => {
    if (!budget || items.length === 0) {
      toast.error('Add meg a költségkeretet és adj hozzá termékeket!')
      return
    }

    startAnalysis(async () => {
      const result = await analyzeBudgetPlan({
        budget: parseInt(budget),
        items: items.map(i => ({
          id: i.id,
          name: i.name,
          productId: i.productId,
          price: i.price,
          priority: i.priority,
          category: i.category
        }))
      })

      if (result.success && result.analysis) {
        // Type assertion to ensure budgetStatus is properly typed
        const analysisData: BudgetAnalysis = {
          ...result.analysis,
          budgetStatus: result.analysis.budgetStatus as 'under' | 'over' | 'exact',
          recommendations: result.analysis.recommendations.map(rec => ({
            ...rec,
            type: rec.type as 'swap' | 'remove' | 'add' | 'wait'
          }))
        }
        setAnalysis(analysisData)
      } else {
        toast.error(result.error || 'Hiba az elemzés során')
      }
    })
  }

  // Get AI suggestions for budget
  const getSuggestions = () => {
    if (!budget) {
      toast.error('Add meg a költségkeretet!')
      return
    }

    startSuggestions(async () => {
      const result = await getSmartBudgetSuggestions(parseInt(budget))
      if (result.success && result.suggestions) {
        // Add suggestions as items
        const suggestionItems: BudgetItem[] = result.suggestions.map((s: { id: number; name: string; slug?: string; price: number; category?: string; image?: string | null; priority: string }) => ({
          id: `suggestion-${s.id}`,
          name: s.name,
          productId: s.id,
          slug: s.slug,
          price: s.price,
          priority: s.priority as BudgetItem['priority'],
          category: s.category,
          image: s.image
        }))
        setItems(prev => [...prev, ...suggestionItems])
        toast.success('AI javaslatok hozzáadva!')
      } else {
        toast.error(result.error || 'Hiba a javaslatok betöltésekor')
      }
    })
  }

  // Apply recommendation
  const applyRecommendation = (rec: BudgetAnalysis['recommendations'][0]) => {
    if (rec.type === 'remove' && rec.itemId) {
      removeItem(rec.itemId)
      toast.success('Termék eltávolítva')
    } else if (rec.type === 'swap' && rec.itemId && rec.alternativeProduct) {
      setItems(prev => prev.map(item => 
        item.id === rec.itemId
          ? {
              ...item,
              id: `swapped-${rec.alternativeProduct!.id}`,
              name: rec.alternativeProduct!.name,
              productId: rec.alternativeProduct!.id,
              slug: rec.alternativeProduct!.slug,
              price: rec.alternativeProduct!.price,
              image: rec.alternativeProduct!.image
            }
          : item
      ))
      toast.success('Termék cserélve!')
    }
    // Re-analyze after change
    setTimeout(handleAnalyze, 500)
  }

  const totalCost = items.reduce((sum, item) => sum + item.price, 0)
  const budgetNum = parseInt(budget) || 0
  const remaining = budgetNum - totalCost

  const formatPrice = (price: number) => price.toLocaleString('hu-HU') + ' Ft'

  return (
    <div className="bg-gradient-to-br from-emerald-900/20 to-teal-900/20 border border-emerald-500/30 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/10 bg-gradient-to-r from-emerald-500/10 to-teal-500/10">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg shadow-emerald-500/25">
              <Wallet size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                AI Költségvetés Tervező
                <Sparkles size={20} className="text-emerald-400" />
              </h2>
              <p className="text-gray-400">Tervezd meg okosan a vásárlásodat</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {savedPlans.length > 0 && (
              <button
                onClick={() => setShowSavedPlans(!showSavedPlans)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  showSavedPlans ? 'bg-emerald-500 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                <FolderOpen size={16} />
                <span className="hidden sm:inline">Mentett</span>
                <span className="text-xs bg-white/20 px-1.5 rounded">{savedPlans.length}</span>
              </button>
            )}
            {items.length > 0 && (
              <>
                <button
                  onClick={() => setShowSaveDialog(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg text-sm transition-colors"
                >
                  <Save size={16} />
                  <span className="hidden sm:inline">Mentés</span>
                </button>
                <button
                  onClick={exportAsText}
                  className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg text-sm transition-colors"
                >
                  <Copy size={16} />
                  <span className="hidden sm:inline">Másolás</span>
                </button>
                <button
                  onClick={sharePlan}
                  className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg text-sm transition-colors"
                >
                  <Share2 size={16} />
                  <span className="hidden sm:inline">Megosztás</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Save Dialog */}
      <AnimatePresence>
        {showSaveDialog && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-white/10 overflow-hidden"
          >
            <div className="p-4 bg-emerald-900/20 flex items-center gap-3">
              <input
                type="text"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="Terv neve (pl. Gaming PC)"
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
              <button
                onClick={savePlan}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg transition-colors"
              >
                Mentés
              </button>
              <button
                onClick={() => { setShowSaveDialog(false); setPlanName('') }}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg transition-colors"
              >
                Mégse
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Saved Plans Panel */}
      <AnimatePresence>
        {showSavedPlans && savedPlans.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-white/10 overflow-hidden"
          >
            <div className="p-4 bg-teal-900/20 space-y-3">
              <h3 className="text-white font-medium flex items-center gap-2">
                <FolderOpen size={18} className="text-teal-400" />
                Mentett tervek
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {savedPlans.map((plan) => (
                  <div key={plan.id} className="p-3 bg-white/5 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-white font-medium">{plan.name}</h4>
                        <p className="text-emerald-400 text-sm">{formatPrice(plan.budget)}</p>
                        <p className="text-gray-500 text-xs">{plan.items.length} termék</p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => loadPlan(plan)}
                          className="p-1.5 text-gray-400 hover:text-white transition-colors"
                          title="Betöltés"
                        >
                          <FolderOpen size={14} />
                        </button>
                        <button
                          onClick={() => deletePlan(plan.id)}
                          className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                          title="Törlés"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-600 text-xs mt-1">
                      {new Date(plan.createdAt).toLocaleDateString('hu-HU')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-6 space-y-6">
        {/* Budget Input */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Target size={14} className="inline mr-1" />
              Költségkeret
            </label>
            <div className="relative">
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="pl. 200000"
                className="w-full bg-black/30 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-lg"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">Ft</span>
            </div>
          </div>

          <div className="flex gap-2 items-end">
            <button
              onClick={importFromCart}
              disabled={cartItems.length === 0}
              className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white rounded-xl transition-colors"
            >
              <ShoppingCart size={18} />
              Kosár importálása
            </button>
            <button
              onClick={getSuggestions}
              disabled={!budget || isGettingSuggestions}
              className="flex items-center gap-2 px-4 py-3 bg-emerald-500/20 hover:bg-emerald-500/30 disabled:opacity-50 text-emerald-400 rounded-xl transition-colors"
            >
              {isGettingSuggestions ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Sparkles size={18} />
              )}
              AI javaslatok
            </button>
          </div>
        </div>

        {/* Budget Overview */}
        {budgetNum > 0 && (
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-white/5 rounded-xl text-center">
              <p className="text-gray-500 text-sm">Költségkeret</p>
              <p className="text-white font-bold text-lg">{formatPrice(budgetNum)}</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl text-center">
              <p className="text-gray-500 text-sm">Tervezett költés</p>
              <p className={`font-bold text-lg ${totalCost > budgetNum ? 'text-red-400' : 'text-white'}`}>
                {formatPrice(totalCost)}
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl text-center">
              <p className="text-gray-500 text-sm">Maradék</p>
              <p className={`font-bold text-lg ${remaining < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {remaining >= 0 ? '+' : ''}{formatPrice(remaining)}
              </p>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {budgetNum > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Felhasznált keret</span>
              <span className={totalCost > budgetNum ? 'text-red-400' : 'text-emerald-400'}>
                {Math.round((totalCost / budgetNum) * 100)}%
              </span>
            </div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${
                  totalCost > budgetNum
                    ? 'bg-red-500'
                    : totalCost > budgetNum * 0.9
                      ? 'bg-yellow-500'
                      : 'bg-emerald-500'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((totalCost / budgetNum) * 100, 100)}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        )}

        {/* Items List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <BarChart3 size={18} />
              Tervezett vásárlások ({items.length})
            </h3>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 text-sm transition-colors"
            >
              <Plus size={16} />
              Hozzáadás
            </button>
          </div>

          {/* Add Item Form */}
          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="Termék neve"
                    className="bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                  <input
                    type="number"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    placeholder="Ár (Ft)"
                    className="bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                  <select
                    value={newItemPriority}
                    onChange={(e) => setNewItemPriority(e.target.value as BudgetItem['priority'])}
                    className="bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  >
                    <option value="must-have">Kötelező</option>
                    <option value="nice-to-have">Jó lenne</option>
                    <option value="optional">Opcionális</option>
                  </select>
                </div>
                <button
                  onClick={addItem}
                  disabled={!newItemName.trim() || !newItemPrice}
                  className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
                >
                  Hozzáadás
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Items */}
          {items.length > 0 ? (
            <div className="space-y-2">
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10"
                >
                  {/* Image */}
                  {item.image && (
                    <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                      <Image
                        src={getImageUrl(item.image) || '/placeholder.png'}
                        alt={item.name}
                        fill
                        className="object-contain p-1"
                        sizes="48px"
                      />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {item.productId ? (
                        <Link
                          href={`/shop/${item.slug || item.productId}`}
                          className="text-white font-medium hover:text-emerald-400 transition-colors truncate"
                        >
                          {item.name}
                        </Link>
                      ) : (
                        <span className="text-white font-medium truncate">{item.name}</span>
                      )}
                    </div>
                    {item.category && (
                      <p className="text-gray-500 text-xs">{item.category}</p>
                    )}
                  </div>

                  {/* Priority */}
                  <select
                    value={item.priority}
                    onChange={(e) => updatePriority(item.id, e.target.value as BudgetItem['priority'])}
                    className={`px-2 py-1 rounded border text-xs font-medium ${PRIORITY_COLORS[item.priority]} bg-transparent focus:outline-none cursor-pointer`}
                  >
                    <option value="must-have">Kötelező</option>
                    <option value="nice-to-have">Jó lenne</option>
                    <option value="optional">Opcionális</option>
                  </select>

                  {/* Price */}
                  <span className="text-white font-semibold whitespace-nowrap">
                    {formatPrice(item.price)}
                  </span>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-white/5 rounded-xl border border-dashed border-white/10">
              <Calculator size={32} className="mx-auto text-gray-600 mb-2" />
              <p className="text-gray-400">Még nincs termék a listán</p>
              <p className="text-gray-500 text-sm">Importálj a kosárból vagy kérj AI javaslatokat</p>
            </div>
          )}
        </div>

        {/* Analyze Button */}
        {items.length > 0 && budget && (
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-xl shadow-emerald-500/30 group"
          >
            {isAnalyzing ? (
              <div className="flex items-center gap-3">
                <div className="relative w-6 h-6">
                  <div className="absolute inset-0 rounded-full border-2 border-white/20" />
                  <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white animate-spin" />
                </div>
                <span>AI optimalizál...</span>
              </div>
            ) : (
              <>
                <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
                AI Elemzés & Optimalizálás
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </motion.button>
        )}

        {/* Analysis Results */}
        <AnimatePresence>
          {analysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Status Card */}
              <div className={`p-4 rounded-xl border ${
                analysis.budgetStatus === 'under'
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : analysis.budgetStatus === 'over'
                    ? 'bg-red-500/10 border-red-500/30'
                    : 'bg-yellow-500/10 border-yellow-500/30'
              }`}>
                <div className="flex items-start gap-3">
                  {analysis.budgetStatus === 'under' ? (
                    <Check size={24} className="text-emerald-400 flex-shrink-0" />
                  ) : (
                    <AlertCircle size={24} className={analysis.budgetStatus === 'over' ? 'text-red-400' : 'text-yellow-400'} />
                  )}
                  <div>
                    <h4 className={`font-semibold ${
                      analysis.budgetStatus === 'under' ? 'text-emerald-400' : 
                      analysis.budgetStatus === 'over' ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                      {analysis.budgetStatus === 'under'
                        ? 'A költségvetés tartható!'
                        : analysis.budgetStatus === 'over'
                          ? 'Túllépted a keretet!'
                          : 'Pont a kereten vagy'}
                    </h4>
                    <p className="text-gray-300 mt-1">{analysis.aiAdvice}</p>
                  </div>
                </div>
              </div>

              {/* Priority Breakdown */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                  <p className="text-red-400 text-xs mb-1">Kötelező</p>
                  <p className="text-white font-bold">{formatPrice(analysis.priorityBreakdown.mustHave)}</p>
                </div>
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-center">
                  <p className="text-yellow-400 text-xs mb-1">Jó lenne</p>
                  <p className="text-white font-bold">{formatPrice(analysis.priorityBreakdown.niceToHave)}</p>
                </div>
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-center">
                  <p className="text-green-400 text-xs mb-1">Opcionális</p>
                  <p className="text-white font-bold">{formatPrice(analysis.priorityBreakdown.optional)}</p>
                </div>
              </div>

              {/* Recommendations */}
              {analysis.recommendations.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-white font-semibold flex items-center gap-2">
                    <TrendingUp size={18} className="text-emerald-400" />
                    AI Javaslatok
                  </h4>
                  {analysis.recommendations.map((rec, idx) => (
                    <div key={idx} className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-2 ${
                            rec.type === 'swap' ? 'bg-blue-500/20 text-blue-400' :
                            rec.type === 'remove' ? 'bg-red-500/20 text-red-400' :
                            rec.type === 'wait' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {rec.type === 'swap' ? 'Csere' : rec.type === 'remove' ? 'Eltávolítás' : rec.type === 'wait' ? 'Várj' : 'Ajánlott'}
                          </span>
                          <p className="text-gray-300 text-sm">{rec.suggestion}</p>
                          {rec.potentialSavings && (
                            <p className="text-emerald-400 text-sm mt-1">
                              <PiggyBank size={14} className="inline mr-1" />
                              Megtakarítás: {formatPrice(rec.potentialSavings)}
                            </p>
                          )}
                        </div>
                        {(rec.type === 'swap' || rec.type === 'remove') && (
                          <button
                            onClick={() => applyRecommendation(rec)}
                            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white text-sm rounded-lg transition-colors flex-shrink-0"
                          >
                            Alkalmaz
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Savings Tips */}
              {analysis.savingsTips.length > 0 && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                  <h4 className="text-emerald-400 font-medium mb-2 flex items-center gap-2">
                    <PiggyBank size={16} />
                    Spórolási tippek
                  </h4>
                  <ul className="space-y-1">
                    {analysis.savingsTips.map((tip, idx) => (
                      <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
                        <span className="text-emerald-400">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Add All to Cart */}
              <button
                onClick={addAllToCart}
                className="w-full flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
              >
                <ShoppingCart size={18} />
                Összes hozzáadása a kosárhoz
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
