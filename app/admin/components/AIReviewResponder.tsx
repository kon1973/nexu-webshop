'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageSquare, Star, RefreshCw, Copy, Check, Wand2,
  ThumbsUp, ThumbsDown, Send, Sparkles, ChevronDown, User
} from 'lucide-react'
import { toast } from 'sonner'

interface Review {
  id: string
  rating: number
  text: string
  userName: string
  productName: string
  createdAt: string
  sentiment: 'positive' | 'negative' | 'neutral'
  hasResponse: boolean
  response?: string
}

interface ResponseTemplate {
  id: string
  name: string
  sentiment: 'positive' | 'negative' | 'neutral'
  template: string
}

const mockReviews: Review[] = [
  {
    id: '1',
    rating: 5,
    text: 'Fantasztikus termék! Gyors volt a szállítás és a minőség is kiváló. Mindenkinek ajánlom!',
    userName: 'Kiss Péter',
    productName: 'iPhone 15 Pro Max',
    createdAt: new Date().toISOString(),
    sentiment: 'positive',
    hasResponse: false
  },
  {
    id: '2',
    rating: 2,
    text: 'Sajnos a termék egy hét után meghibásodott. A szerviz lassú és nem segítőkész. Csalódtam.',
    userName: 'Nagy Anna',
    productName: 'Samsung Galaxy Buds',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    sentiment: 'negative',
    hasResponse: false
  },
  {
    id: '3',
    rating: 4,
    text: 'Jó termék az árához képest. Kicsit hangos a ventilátor, de összességében elégedett vagyok.',
    userName: 'Szabó Gábor',
    productName: 'Gaming Laptop Pro',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    sentiment: 'neutral',
    hasResponse: true,
    response: 'Köszönjük visszajelzését! A ventilátor hangossága normál működés része intenzív használat esetén.'
  }
]

const responseTemplates: ResponseTemplate[] = [
  {
    id: '1',
    name: 'Pozitív - Köszönet',
    sentiment: 'positive',
    template: 'Köszönjük szépen a pozitív értékelést, {userName}! Örülünk, hogy elégedett a {productName} termékkel. Reméljük, hamarosan újra vásárol nálunk!'
  },
  {
    id: '2',
    name: 'Negatív - Bocsánatkérés',
    sentiment: 'negative',
    template: 'Kedves {userName}, sajnáljuk a kellemetlenséget! Kérjük, vegye fel velünk a kapcsolatot az info@nexu.hu címen, hogy megoldhassuk a problémát a {productName} termékkel kapcsolatban.'
  },
  {
    id: '3',
    name: 'Semleges - Fejlesztés',
    sentiment: 'neutral',
    template: 'Köszönjük az értékelést, {userName}! Értékeljük a visszajelzést a {productName} termékkel kapcsolatban és folyamatosan dolgozunk a fejlesztésen.'
  }
]

export default function AIReviewResponder() {
  const [reviews, setReviews] = useState<Review[]>(mockReviews)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [generatedResponse, setGeneratedResponse] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [filter, setFilter] = useState<'all' | 'pending' | 'responded'>('all')
  const [tone, setTone] = useState<'formal' | 'friendly' | 'apologetic'>('friendly')

  const filteredReviews = reviews.filter(r => {
    if (filter === 'pending') return !r.hasResponse
    if (filter === 'responded') return r.hasResponse
    return true
  })

  const generateResponse = async (review: Review) => {
    setIsGenerating(true)
    setGeneratedResponse('')
    
    // Simulate AI generation
    await new Promise(r => setTimeout(r, 1500))
    
    let response = ''
    
    if (review.sentiment === 'positive') {
      if (tone === 'formal') {
        response = `Tisztelt ${review.userName}!\n\nHálás köszönetünket fejezzük ki az értékelésért. Örömünkre szolgál, hogy a ${review.productName} termékünk elnyerte tetszését. Bízunk benne, hogy a jövőben is megtisztel bennünket bizalmával.\n\nTisztelettel,\nNEXU Store Csapata`
      } else if (tone === 'friendly') {
        response = `Szia ${review.userName}! 🎉\n\nNagyon örülünk, hogy elégedett vagy a ${review.productName} termékkel! Az ilyen visszajelzések nagyon sokat jelentenek nekünk. Ha bármi kérdésed van, írj bátran!\n\nÜdv,\nNEXU Csapat`
      } else {
        response = `Kedves ${review.userName}!\n\nKöszönjük a kedves szavakat! Nagyon örülünk, hogy pozitív élményt szereztünk. A ${review.productName} tényleg egy kiváló választás volt.\n\nHálásan,\nNEXU Store`
      }
    } else if (review.sentiment === 'negative') {
      if (tone === 'formal') {
        response = `Tisztelt ${review.userName}!\n\nÉrtékeljük, hogy megosztotta velünk tapasztalatait. Sajnálattal értesültünk a ${review.productName} termékkel kapcsolatos problémáról. Kérjük, vegye fel velünk a kapcsolatot az info@nexu.hu címen vagy a +36 1 234 5678 számon, hogy mielőbb megoldhassuk a helyzetet.\n\nElnézését kérjük a kellemetlenségért.\n\nTisztelettel,\nNEXU Store Csapata`
      } else if (tone === 'friendly') {
        response = `Kedves ${review.userName}!\n\nNagyon sajnáljuk, hogy ilyen élményben volt részed a ${review.productName} termékkel! 😔 Ez nem az, amit szeretnénk. Írj nekünk az info@nexu.hu-ra, és megoldjuk - ígérjük!\n\nÜdv,\nNEXU Csapat`
      } else {
        response = `Kedves ${review.userName}!\n\nŐszintén sajnáljuk a kellemetlenséget, amit átéltél. A ${review.productName} termékkel kapcsolatos problémád számunkra is fontos. Kérlek, adj nekünk lehetőséget a jóvátételre!\n\nÍrj nekünk: info@nexu.hu\n\nBocsánattal,\nNEXU Store`
      }
    } else {
      if (tone === 'formal') {
        response = `Tisztelt ${review.userName}!\n\nKöszönjük, hogy időt szakított az értékelésre. Visszajelzése értékes számunkra a ${review.productName} termék és szolgáltatásunk fejlesztéséhez.\n\nTisztelettel,\nNEXU Store Csapata`
      } else if (tone === 'friendly') {
        response = `Szia ${review.userName}! 👋\n\nKöszi a véleményt a ${review.productName} termékről! Minden visszajelzés segít, hogy jobbak legyünk. Ha bármi kérdésed van, keress bátran!\n\nÜdv,\nNEXU Csapat`
      } else {
        response = `Kedves ${review.userName}!\n\nKöszönjük, hogy megosztottad velünk a tapasztalataidat. Értékeljük az őszinte visszajelzést a ${review.productName} termékről, és folyamatosan dolgozunk a fejlesztésen.\n\nÜdvözlettel,\nNEXU Store`
      }
    }
    
    setGeneratedResponse(response)
    setIsGenerating(false)
  }

  const copyResponse = () => {
    navigator.clipboard.writeText(generatedResponse)
    setCopied(true)
    toast.success('Válasz másolva!')
    setTimeout(() => setCopied(false), 2000)
  }

  const sendResponse = async () => {
    if (!selectedReview || !generatedResponse) return
    
    toast.success('Válasz elküldve!')
    
    setReviews(prev => prev.map(r => 
      r.id === selectedReview.id 
        ? { ...r, hasResponse: true, response: generatedResponse }
        : r
    ))
    
    setSelectedReview(null)
    setGeneratedResponse('')
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-400 bg-green-500/20'
      case 'negative': return 'text-red-400 bg-red-500/20'
      default: return 'text-yellow-400 bg-yellow-500/20'
    }
  }

  const getSentimentLabel = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'Pozitív'
      case 'negative': return 'Negatív'
      default: return 'Semleges'
    }
  }

  const stats = {
    total: reviews.length,
    pending: reviews.filter(r => !r.hasResponse).length,
    positive: reviews.filter(r => r.sentiment === 'positive').length,
    negative: reviews.filter(r => r.sentiment === 'negative').length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl">
            <MessageSquare className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">AI Értékelés Válaszadó</h2>
            <p className="text-gray-400 text-sm">Automatikus válasz generálás értékelésekre</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
            <MessageSquare size={14} />
            Összes
          </div>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 text-yellow-400 text-sm mb-1">
            <RefreshCw size={14} />
            Válaszra vár
          </div>
          <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-green-500/10 border border-green-500/20 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 text-green-400 text-sm mb-1">
            <ThumbsUp size={14} />
            Pozitív
          </div>
          <p className="text-2xl font-bold text-green-400">{stats.positive}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-red-500/10 border border-red-500/20 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 text-red-400 text-sm mb-1">
            <ThumbsDown size={14} />
            Negatív
          </div>
          <p className="text-2xl font-bold text-red-400">{stats.negative}</p>
        </motion.div>
      </div>

      {/* Filter & Tone */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {['all', 'pending', 'responded'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f as typeof filter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-orange-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {f === 'all' ? 'Mind' : f === 'pending' ? 'Válaszra vár' : 'Megválaszolt'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">Hangnem:</span>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value as typeof tone)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
          >
            <option value="formal">Hivatalos</option>
            <option value="friendly">Barátságos</option>
            <option value="apologetic">Elnézést kérő</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {filteredReviews.map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`bg-white/5 border rounded-xl overflow-hidden ${
              review.hasResponse ? 'border-green-500/20' : 'border-white/10'
            }`}
          >
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold">
                    {review.userName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{review.userName}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${getSentimentColor(review.sentiment)}`}>
                        {getSentimentLabel(review.sentiment)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span>{review.productName}</span>
                      <span>•</span>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                {!review.hasResponse && (
                  <button
                    onClick={() => {
                      setSelectedReview(review)
                      generateResponse(review)
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-sm rounded-lg transition-colors"
                  >
                    <Wand2 size={14} />
                    Válasz generálása
                  </button>
                )}
              </div>

              <p className="text-gray-300 text-sm mb-3">{review.text}</p>

              {review.hasResponse && review.response && (
                <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center gap-2 text-green-400 text-xs mb-2">
                    <Check size={12} />
                    Válasz elküldve
                  </div>
                  <p className="text-gray-300 text-sm whitespace-pre-line">{review.response}</p>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Response Generator Modal */}
      <AnimatePresence>
        {selectedReview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setSelectedReview(null)
              setGeneratedResponse('')
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4">Válasz generálása</h3>

              {/* Original Review */}
              <div className="p-4 bg-white/5 rounded-xl mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <User size={14} className="text-gray-400" />
                  <span className="text-white font-medium">{selectedReview.userName}</span>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        className={i < selectedReview.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-300 text-sm">{selectedReview.text}</p>
              </div>

              {/* Tone Selector */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-gray-400 text-sm">Hangnem:</span>
                {['formal', 'friendly', 'apologetic'].map(t => (
                  <button
                    key={t}
                    onClick={() => {
                      setTone(t as typeof tone)
                      generateResponse(selectedReview)
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      tone === t
                        ? 'bg-orange-600 text-white'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {t === 'formal' ? 'Hivatalos' : t === 'friendly' ? 'Barátságos' : 'Elnézést kérő'}
                  </button>
                ))}
              </div>

              {/* Generated Response */}
              <div className="mb-4">
                <label className="block text-gray-400 text-sm mb-2">AI által generált válasz</label>
                {isGenerating ? (
                  <div className="p-4 bg-white/5 rounded-xl flex items-center justify-center">
                    <RefreshCw className="animate-spin text-orange-400" size={24} />
                    <span className="ml-2 text-gray-400">Generálás...</span>
                  </div>
                ) : (
                  <textarea
                    value={generatedResponse}
                    onChange={(e) => setGeneratedResponse(e.target.value)}
                    rows={8}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 resize-none"
                  />
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => generateResponse(selectedReview)}
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={16} className={isGenerating ? 'animate-spin' : ''} />
                  Újragenerálás
                </button>
                <button
                  onClick={copyResponse}
                  disabled={!generatedResponse}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-colors disabled:opacity-50"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  Másolás
                </button>
                <button
                  onClick={sendResponse}
                  disabled={!generatedResponse || isGenerating}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  <Send size={16} />
                  Válasz küldése
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
