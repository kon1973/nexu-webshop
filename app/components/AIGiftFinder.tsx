'use client'

import { useState, useTransition, useEffect } from 'react'
import { Gift, Sparkles, User, Calendar, Heart, DollarSign, Package, ArrowRight, Loader2, RefreshCw, ShoppingCart, Star, Check, History, BookmarkPlus, Bookmark, Share2, Copy, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { getAIGiftSuggestions } from '@/lib/actions/user-actions'
import { useCart } from '@/context/CartContext'
import { toast } from 'sonner'
import { getImageUrl } from '@/lib/image'

interface GiftRecipient {
  relationship: string
  age?: string
  gender?: string
  interests?: string[]
  occasion: string
  budget: { min: number; max: number }
}

interface GiftSuggestion {
  productId: number
  name: string
  price: number
  image: string | null
  slug?: string
  category?: string
  reason: string
  matchScore: number
  giftTips?: string
}

interface GiftAnalysis {
  suggestions: GiftSuggestion[]
  personalMessage: string
  wrappingIdeas?: string[]
  alternativeIdeas?: string[]
}

interface SavedSearch {
  id: string
  recipient: GiftRecipient
  timestamp: number
  label?: string
}

interface SavedGiftIdea {
  productId: number
  name: string
  price: number
  image: string | null
  reason: string
  recipientType: string
  occasion: string
  savedAt: number
}

const RELATIONSHIPS = [
  { id: 'partner', label: 'Partner/Társ', icon: '💑' },
  { id: 'parent', label: 'Szülő', icon: '👨‍👩‍👧' },
  { id: 'child', label: 'Gyerek', icon: '👶' },
  { id: 'friend', label: 'Barát', icon: '🤝' },
  { id: 'colleague', label: 'Kolléga', icon: '💼' },
  { id: 'sibling', label: 'Testvér', icon: '👫' },
  { id: 'grandparent', label: 'Nagyszülő', icon: '👴' },
  { id: 'other', label: 'Egyéb', icon: '🎁' }
]

const OCCASIONS = [
  { id: 'birthday', label: 'Születésnap', icon: '🎂' },
  { id: 'christmas', label: 'Karácsony', icon: '🎄' },
  { id: 'anniversary', label: 'Évforduló', icon: '💍' },
  { id: 'valentines', label: 'Valentin-nap', icon: '💝' },
  { id: 'mothers-day', label: 'Anyák napja', icon: '💐' },
  { id: 'fathers-day', label: 'Apák napja', icon: '👔' },
  { id: 'graduation', label: 'Ballagás', icon: '🎓' },
  { id: 'housewarming', label: 'Lakásavató', icon: '🏠' },
  { id: 'thank-you', label: 'Köszönet', icon: '🙏' },
  { id: 'just-because', label: 'Csak úgy', icon: '✨' }
]

const INTERESTS = [
  'Technológia', 'Sport', 'Zene', 'Olvasás', 'Főzés', 'Utazás', 
  'Játékok', 'Kertészkedés', 'Divat', 'Fotózás', 'Művészet', 'Fitness'
]

const BUDGET_PRESETS = [
  { label: '5-15k', min: 5000, max: 15000 },
  { label: '15-30k', min: 15000, max: 30000 },
  { label: '30-50k', min: 30000, max: 50000 },
  { label: '50-100k', min: 50000, max: 100000 },
  { label: '100k+', min: 100000, max: 500000 }
]

const STORAGE_KEY_HISTORY = 'nexu-gift-search-history'
const STORAGE_KEY_SAVED = 'nexu-saved-gift-ideas'

export default function AIGiftFinder() {
  const { addToCart } = useCart()
  const [isSearching, startSearch] = useTransition()
  const [step, setStep] = useState(1)
  const [recipient, setRecipient] = useState<Partial<GiftRecipient>>({})
  const [analysis, setAnalysis] = useState<GiftAnalysis | null>(null)
  const [searchHistory, setSearchHistory] = useState<SavedSearch[]>([])
  const [savedIdeas, setSavedIdeas] = useState<SavedGiftIdea[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [showSaved, setShowSaved] = useState(false)

  // Load from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem(STORAGE_KEY_HISTORY)
    const savedGifts = localStorage.getItem(STORAGE_KEY_SAVED)
    if (savedHistory) setSearchHistory(JSON.parse(savedHistory))
    if (savedGifts) setSavedIdeas(JSON.parse(savedGifts))
  }, [])

  // Save search to history
  const saveToHistory = (search: GiftRecipient) => {
    const newHistory: SavedSearch[] = [
      {
        id: Date.now().toString(),
        recipient: search,
        timestamp: Date.now()
      },
      ...searchHistory.filter(s => 
        s.recipient.relationship !== search.relationship || 
        s.recipient.occasion !== search.occasion
      )
    ].slice(0, 10) // Max 10 items
    setSearchHistory(newHistory)
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(newHistory))
  }

  // Delete from history
  const deleteFromHistory = (id: string) => {
    const newHistory = searchHistory.filter(s => s.id !== id)
    setSearchHistory(newHistory)
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(newHistory))
    toast.success('Keresés törölve')
  }

  // Load search from history
  const loadFromHistory = (search: SavedSearch) => {
    setRecipient(search.recipient)
    setShowHistory(false)
    setStep(3) // Go to details step
    toast.success('Keresés betöltve')
  }

  // Save gift idea
  const saveGiftIdea = (suggestion: GiftSuggestion) => {
    const idea: SavedGiftIdea = {
      productId: suggestion.productId,
      name: suggestion.name,
      price: suggestion.price,
      image: suggestion.image,
      reason: suggestion.reason,
      recipientType: recipient.relationship || '',
      occasion: recipient.occasion || '',
      savedAt: Date.now()
    }
    const newSaved = [idea, ...savedIdeas.filter(s => s.productId !== suggestion.productId)].slice(0, 20)
    setSavedIdeas(newSaved)
    localStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify(newSaved))
    toast.success('Ajándékötlet mentve!')
  }

  // Remove saved idea
  const removeSavedIdea = (productId: number) => {
    const newSaved = savedIdeas.filter(s => s.productId !== productId)
    setSavedIdeas(newSaved)
    localStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify(newSaved))
    toast.success('Ajándékötlet törölve')
  }

  // Check if idea is saved
  const isIdeaSaved = (productId: number) => savedIdeas.some(s => s.productId === productId)

  // Share search results
  const shareResults = async () => {
    const text = analysis?.suggestions.map(s => `${s.name} - ${s.price.toLocaleString('hu-HU')} Ft`).join('\n')
    const shareData = {
      title: 'NEXU Ajándékötletek',
      text: `Ajándékötletek:\n${text}`,
      url: window.location.href
    }
    
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(shareData.text || '')
      toast.success('Vágólapra másolva!')
    }
  }

  const handleSearch = () => {
    if (!recipient.relationship || !recipient.occasion || !recipient.budget) {
      toast.error('Kérlek töltsd ki a kötelező mezőket!')
      return
    }

    startSearch(async () => {
      const result = await getAIGiftSuggestions(recipient as GiftRecipient)
      if (result.success && result.analysis) {
        setAnalysis(result.analysis)
        saveToHistory(recipient as GiftRecipient)
        setStep(4)
      } else {
        toast.error(result.error || 'Hiba történt a keresés során')
      }
    })
  }

  const handleAddToCart = (suggestion: GiftSuggestion) => {
    addToCart({
      id: suggestion.productId,
      name: suggestion.name,
      price: suggestion.price,
      image: suggestion.image || '',
      category: suggestion.category || 'Ajándék'
    })
    toast.success(`${suggestion.name} hozzáadva a kosárhoz!`)
  }

  const formatPrice = (price: number) => price.toLocaleString('hu-HU') + ' Ft'

  const resetSearch = () => {
    setStep(1)
    setRecipient({})
    setAnalysis(null)
  }

  const toggleInterest = (interest: string) => {
    setRecipient(prev => ({
      ...prev,
      interests: prev.interests?.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...(prev.interests || []), interest]
    }))
  }

  return (
    <div className="bg-gradient-to-br from-pink-900/20 to-purple-900/20 border border-pink-500/30 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/10 bg-gradient-to-r from-pink-500/10 to-purple-500/10">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl shadow-lg shadow-pink-500/25">
              <Gift size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                AI Ajándék Kereső
                <Sparkles size={20} className="text-pink-400" />
              </h2>
              <p className="text-gray-400">Találd meg a tökéletes ajándékot mesterséges intelligenciával</p>
            </div>
          </div>
          <div className="flex gap-2">
            {searchHistory.length > 0 && (
              <button
                onClick={() => { setShowHistory(!showHistory); setShowSaved(false) }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  showHistory ? 'bg-pink-500 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                <History size={16} />
                <span className="hidden sm:inline">Előzmények</span>
                <span className="text-xs bg-white/20 px-1.5 rounded">{searchHistory.length}</span>
              </button>
            )}
            {savedIdeas.length > 0 && (
              <button
                onClick={() => { setShowSaved(!showSaved); setShowHistory(false) }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  showSaved ? 'bg-purple-500 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                <Bookmark size={16} />
                <span className="hidden sm:inline">Mentett</span>
                <span className="text-xs bg-white/20 px-1.5 rounded">{savedIdeas.length}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* History Panel */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-white/10 overflow-hidden"
          >
            <div className="p-4 bg-pink-900/20 space-y-3">
              <h3 className="text-white font-medium flex items-center gap-2">
                <History size={18} className="text-pink-400" />
                Korábbi keresések
              </h3>
              <div className="grid gap-2">
                {searchHistory.map((search) => (
                  <div key={search.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                    <button
                      onClick={() => loadFromHistory(search)}
                      className="flex-1 text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {RELATIONSHIPS.find(r => r.id === search.recipient.relationship)?.icon}
                        </span>
                        <span className="text-white">
                          {RELATIONSHIPS.find(r => r.id === search.recipient.relationship)?.label}
                        </span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-400">
                          {OCCASIONS.find(o => o.id === search.recipient.occasion)?.label}
                        </span>
                      </div>
                      <p className="text-gray-500 text-xs mt-1">
                        {new Date(search.timestamp).toLocaleDateString('hu-HU')}
                      </p>
                    </button>
                    <button
                      onClick={() => deleteFromHistory(search.id)}
                      className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Saved Ideas Panel */}
      <AnimatePresence>
        {showSaved && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-white/10 overflow-hidden"
          >
            <div className="p-4 bg-purple-900/20 space-y-3">
              <h3 className="text-white font-medium flex items-center gap-2">
                <Bookmark size={18} className="text-purple-400" />
                Mentett ajándékötletek
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {savedIdeas.map((idea) => (
                  <div key={idea.productId} className="flex gap-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-white/5">
                      {idea.image ? (
                        <Image
                          src={getImageUrl(idea.image) || '/placeholder.png'}
                          alt={idea.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={24} className="text-gray-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white text-sm font-medium truncate">{idea.name}</h4>
                      <p className="text-pink-400 text-sm">{formatPrice(idea.price)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Link
                          href={`/shop/${idea.productId}`}
                          className="text-xs text-gray-400 hover:text-white transition-colors"
                        >
                          Megtekintés
                        </Link>
                        <button
                          onClick={() => removeSavedIdea(idea.productId)}
                          className="text-xs text-gray-400 hover:text-red-400 transition-colors"
                        >
                          Törlés
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Steps */}
      <div className="px-6 py-4 border-b border-white/10 bg-black/20">
        <div className="flex items-center justify-between max-w-md mx-auto">
          {['Kinek?', 'Alkalom', 'Részletek', 'Találatok'].map((label, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step > idx + 1 ? 'bg-green-500 text-white' :
                step === idx + 1 ? 'bg-pink-500 text-white' :
                'bg-white/10 text-gray-500'
              }`}>
                {step > idx + 1 ? <Check size={16} /> : idx + 1}
              </div>
              <span className={`text-sm hidden sm:block ${step === idx + 1 ? 'text-white' : 'text-gray-500'}`}>
                {label}
              </span>
              {idx < 3 && <div className={`w-8 h-0.5 ${step > idx + 1 ? 'bg-green-500' : 'bg-white/10'}`} />}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {/* Step 1: Relationship */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <User size={32} className="mx-auto text-pink-400 mb-2" />
                <h3 className="text-xl font-semibold text-white">Kinek keresel ajándékot?</h3>
                <p className="text-gray-400 text-sm">Válaszd ki a kapcsolat típusát</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {RELATIONSHIPS.map((rel) => (
                  <motion.button
                    key={rel.id}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setRecipient(prev => ({ ...prev, relationship: rel.id }))}
                    className={`p-4 rounded-xl border-2 transition-all text-center group ${
                      recipient.relationship === rel.id
                        ? 'border-pink-500 bg-pink-500/20 shadow-lg shadow-pink-500/20'
                        : 'border-white/10 bg-white/5 hover:border-pink-500/50 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform">{rel.icon}</span>
                    <span className="text-white text-sm font-medium">{rel.label}</span>
                    {recipient.relationship === rel.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2 w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center"
                      >
                        <Check size={12} className="text-white" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>

              <div className="flex justify-end pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => recipient.relationship && setStep(2)}
                  disabled={!recipient.relationship}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-lg shadow-pink-500/25"
                >
                  Tovább
                  <ArrowRight size={18} />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Occasion */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <Calendar size={32} className="mx-auto text-pink-400 mb-2" />
                <h3 className="text-xl font-semibold text-white">Mi az alkalom?</h3>
                <p className="text-gray-400 text-sm">Válaszd ki az eseményt</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {OCCASIONS.map((occ) => (
                  <motion.button
                    key={occ.id}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setRecipient(prev => ({ ...prev, occasion: occ.id }))}
                    className={`p-4 rounded-xl border-2 transition-all text-center relative group ${
                      recipient.occasion === occ.id
                        ? 'border-pink-500 bg-pink-500/20 shadow-lg shadow-pink-500/20'
                        : 'border-white/10 bg-white/5 hover:border-pink-500/50 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform">{occ.icon}</span>
                    <span className="text-white text-xs font-medium">{occ.label}</span>
                    {recipient.occasion === occ.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2 w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center"
                      >
                        <Check size={12} className="text-white" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>

              <div className="flex justify-between pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep(1)}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors font-medium"
                >
                  Vissza
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => recipient.occasion && setStep(3)}
                  disabled={!recipient.occasion}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-lg shadow-pink-500/25"
                >
                  Tovább
                  <ArrowRight size={18} />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Details */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <Heart size={32} className="mx-auto text-pink-400 mb-2" />
                <h3 className="text-xl font-semibold text-white">Mondd el a részleteket</h3>
                <p className="text-gray-400 text-sm">Minél többet tudunk, annál jobb ajánlatot kapasz</p>
              </div>

              {/* Age & Gender */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Kor (opcionális)</label>
                  <select
                    value={recipient.age || ''}
                    onChange={(e) => setRecipient(prev => ({ ...prev, age: e.target.value }))}
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                  >
                    <option value="">Válassz...</option>
                    <option value="child">Gyerek (0-12)</option>
                    <option value="teen">Tinédzser (13-19)</option>
                    <option value="young-adult">Fiatal felnőtt (20-30)</option>
                    <option value="adult">Felnőtt (31-50)</option>
                    <option value="senior">Idős (50+)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nem (opcionális)</label>
                  <select
                    value={recipient.gender || ''}
                    onChange={(e) => setRecipient(prev => ({ ...prev, gender: e.target.value }))}
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                  >
                    <option value="">Válassz...</option>
                    <option value="male">Férfi</option>
                    <option value="female">Nő</option>
                    <option value="other">Egyéb</option>
                  </select>
                </div>
              </div>

              {/* Interests */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Érdeklődési körök (opcionális)</label>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map((interest) => (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                        recipient.interests?.includes(interest)
                          ? 'bg-pink-500 text-white'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <DollarSign size={14} className="inline mr-1" />
                  Költségkeret *
                </label>
                <div className="flex flex-wrap gap-2">
                  {BUDGET_PRESETS.map((budget) => (
                    <button
                      key={budget.label}
                      onClick={() => setRecipient(prev => ({ ...prev, budget: { min: budget.min, max: budget.max } }))}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        recipient.budget?.min === budget.min
                          ? 'bg-pink-500 text-white'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      {budget.label} Ft
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
                >
                  Vissza
                </button>
                <button
                  onClick={handleSearch}
                  disabled={!recipient.budget || isSearching}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-pink-500/25 group"
                >
                  {isSearching ? (
                    <div className="flex items-center gap-3">
                      <div className="relative w-5 h-5">
                        <div className="absolute inset-0 rounded-full border-2 border-white/20" />
                        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white animate-spin" />
                      </div>
                      <span>AI elemzi az igényeket...</span>
                    </div>
                  ) : (
                    <>
                      <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
                      Ajándék keresése
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Results */}
          {step === 4 && analysis && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Personal Message */}
              {analysis.personalMessage && (
                <div className="p-4 bg-pink-500/10 border border-pink-500/30 rounded-xl">
                  <p className="text-pink-300 text-center">
                    <Sparkles size={16} className="inline mr-2" />
                    {analysis.personalMessage}
                  </p>
                </div>
              )}

              {/* Gift Suggestions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Gift size={20} className="text-pink-400" />
                  Ajánlott ajándékok
                </h3>

                <div className="grid gap-4">
                  {analysis.suggestions.map((suggestion, idx) => (
                    <motion.div
                      key={suggestion.productId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{ scale: 1.01, y: -2 }}
                      className={`flex flex-col md:flex-row gap-4 p-4 rounded-xl border transition-all cursor-pointer group ${
                        idx === 0
                          ? 'bg-gradient-to-r from-yellow-900/30 to-amber-900/30 border-yellow-500/30 shadow-lg shadow-yellow-500/10 hover:shadow-yellow-500/20'
                          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      {/* Product Image */}
                      <div className="w-full md:w-32 aspect-square relative rounded-lg overflow-hidden bg-white/5 flex-shrink-0 group-hover:scale-105 transition-transform">
                        {suggestion.image ? (
                          <Image
                            src={getImageUrl(suggestion.image) || '/placeholder.png'}
                            alt={suggestion.name}
                            fill
                            className="object-contain p-2"
                            sizes="128px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={32} className="text-gray-600" />
                          </div>
                        )}
                        {idx === 0 && (
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-2 left-2 px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-xs font-bold rounded shadow-lg"
                          >
                            ⭐ TOP AJÁNLAT
                          </motion.div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h4 className="text-white font-semibold">{suggestion.name}</h4>
                            <p className="text-gray-400 text-sm mt-1">{suggestion.reason}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-white font-bold text-lg">{formatPrice(suggestion.price)}</p>
                            <div className={`flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-sm font-medium ${
                              suggestion.matchScore >= 90 ? 'bg-green-500/20 text-green-400' :
                              suggestion.matchScore >= 70 ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-orange-500/20 text-orange-400'
                            }`}>
                              <Star size={14} fill="currentColor" />
                              <span>{suggestion.matchScore}%</span>
                            </div>
                          </div>
                        </div>

                        {suggestion.giftTips && (
                          <p className="text-sm text-purple-300 mt-2 italic">
                            💡 {suggestion.giftTips}
                          </p>
                        )}

                        <div className="flex gap-2 mt-4">
                          <Link
                            href={`/shop/${suggestion.slug || suggestion.productId}`}
                            className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white text-center rounded-lg text-sm transition-all hover:scale-[1.02] font-medium"
                          >
                            Részletek
                          </Link>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => isIdeaSaved(suggestion.productId) ? removeSavedIdea(suggestion.productId) : saveGiftIdea(suggestion)}
                            className={`px-3 py-2.5 rounded-lg text-sm transition-all flex items-center gap-1 ${
                              isIdeaSaved(suggestion.productId)
                                ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25'
                                : 'bg-white/10 hover:bg-white/20 text-gray-300'
                            }`}
                            title={isIdeaSaved(suggestion.productId) ? 'Mentve' : 'Mentés'}
                          >
                            {isIdeaSaved(suggestion.productId) ? <Bookmark size={16} /> : <BookmarkPlus size={16} />}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleAddToCart(suggestion)}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-white rounded-lg text-sm font-semibold transition-all shadow-lg shadow-pink-500/25"
                          >
                            <ShoppingCart size={16} />
                            Kosárba
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Wrapping Ideas */}
              {analysis.wrappingIdeas && analysis.wrappingIdeas.length > 0 && (
                <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                  <h4 className="text-purple-300 font-medium mb-2">🎀 Csomagolási ötletek</h4>
                  <ul className="space-y-1">
                    {analysis.wrappingIdeas.map((idea, idx) => (
                      <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
                        <span className="text-purple-400">•</span>
                        {idea}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Alternative Ideas */}
              {analysis.alternativeIdeas && analysis.alternativeIdeas.length > 0 && (
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                  <h4 className="text-blue-300 font-medium mb-2">💭 Alternatív ötletek</h4>
                  <ul className="space-y-1">
                    {analysis.alternativeIdeas.map((idea, idx) => (
                      <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
                        <span className="text-blue-400">•</span>
                        {idea}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-center gap-3 pt-4">
                <button
                  onClick={shareResults}
                  className="flex items-center gap-2 px-6 py-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-xl transition-colors"
                >
                  <Share2 size={18} />
                  Megosztás
                </button>
                <button
                  onClick={resetSearch}
                  className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
                >
                  <RefreshCw size={18} />
                  Új keresés
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
