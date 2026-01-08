'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Mail,
  MessageSquare,
  Instagram,
  FileText,
  Copy,
  Check,
  Loader2,
  RefreshCw,
  Wand2,
  Languages,
  Target,
  TrendingUp
} from 'lucide-react'
import { toast } from 'sonner'

type ContentType = 'email' | 'social' | 'sms' | 'blog' | 'ad'
type Tone = 'professional' | 'friendly' | 'urgent' | 'playful'

interface GeneratedContent {
  type: ContentType
  content: string
  subject?: string
  hashtags?: string[]
}

const contentTypes: { type: ContentType; label: string; icon: typeof Mail; description: string }[] = [
  { type: 'email', label: 'Email kampány', icon: Mail, description: 'Hírlevél, promóciós email' },
  { type: 'social', label: 'Social media', icon: Instagram, description: 'Facebook, Instagram poszt' },
  { type: 'sms', label: 'SMS üzenet', icon: MessageSquare, description: 'Rövid promóciós üzenet' },
  { type: 'blog', label: 'Blog poszt', icon: FileText, description: 'SEO optimalizált cikk' },
  { type: 'ad', label: 'Hirdetés szöveg', icon: Target, description: 'Google/Meta hirdetés' },
]

const tones: { value: Tone; label: string; emoji: string }[] = [
  { value: 'professional', label: 'Professzionális', emoji: '👔' },
  { value: 'friendly', label: 'Barátságos', emoji: '😊' },
  { value: 'urgent', label: 'Sürgős', emoji: '⚡' },
  { value: 'playful', label: 'Játékos', emoji: '🎉' },
]

export default function AIMarketingAssistant() {
  const [selectedType, setSelectedType] = useState<ContentType>('email')
  const [tone, setTone] = useState<Tone>('friendly')
  const [topic, setTopic] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [product, setProduct] = useState('')
  const [promotion, setPromotion] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null)
  const [copied, setCopied] = useState(false)
  const [language, setLanguage] = useState<'hu' | 'en'>('hu')

  const generateContent = async () => {
    if (!topic.trim()) {
      toast.error('Add meg a témát!')
      return
    }

    setIsGenerating(true)
    setGeneratedContent(null)

    try {
      const response = await fetch('/api/admin/ai-marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedType,
          tone,
          topic,
          targetAudience,
          product,
          promotion,
          language
        })
      })

      if (!response.ok) throw new Error('Generation failed')

      const data = await response.json()
      setGeneratedContent(data)
      toast.success('Tartalom sikeresen generálva!')
    } catch (error) {
      console.error('Generation error:', error)
      toast.error('Hiba történt a generálás során')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async () => {
    if (!generatedContent) return
    
    let textToCopy = generatedContent.content
    if (generatedContent.subject) {
      textToCopy = `Tárgy: ${generatedContent.subject}\n\n${textToCopy}`
    }
    if (generatedContent.hashtags) {
      textToCopy += `\n\n${generatedContent.hashtags.join(' ')}`
    }

    await navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    toast.success('Vágólapra másolva!')
    setTimeout(() => setCopied(false), 2000)
  }

  const regenerate = () => {
    generateContent()
  }

  return (
    <div className="bg-[#121212] border border-white/10 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 flex items-center justify-center">
          <Wand2 className="text-white" size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">AI Marketing Asszisztens</h2>
          <p className="text-gray-400 text-sm">GPT-5.2 alapú marketing tartalom generálás</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          {/* Content Type Selection */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Tartalom típusa</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {contentTypes.map((ct) => (
                <button
                  key={ct.type}
                  onClick={() => setSelectedType(ct.type)}
                  className={`p-3 rounded-lg border transition-all text-left ${
                    selectedType === ct.type
                      ? 'bg-purple-600/20 border-purple-500 text-white'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                  }`}
                >
                  <ct.icon size={18} className={selectedType === ct.type ? 'text-purple-400' : ''} />
                  <p className="text-sm font-medium mt-1">{ct.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{ct.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Tone Selection */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Hangnem</label>
            <div className="flex flex-wrap gap-2">
              {tones.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTone(t.value)}
                  className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                    tone === t.value
                      ? 'bg-purple-600/20 border-purple-500 text-white'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                  }`}
                >
                  {t.emoji} {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block flex items-center gap-2">
              <Languages size={14} />
              Nyelv
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setLanguage('hu')}
                className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                  language === 'hu'
                    ? 'bg-purple-600/20 border-purple-500 text-white'
                    : 'bg-white/5 border-white/10 text-gray-400'
                }`}
              >
                🇭🇺 Magyar
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                  language === 'en'
                    ? 'bg-purple-600/20 border-purple-500 text-white'
                    : 'bg-white/5 border-white/10 text-gray-400'
                }`}
              >
                🇬🇧 English
              </button>
            </div>
          </div>

          {/* Topic */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">
              Téma / Üzenet <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="pl. Nyári akció, Új iPhone bevezetés, Black Friday..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Target Audience */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block flex items-center gap-2">
              <Target size={14} />
              Célközönség
            </label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="pl. Fiatal felnőttek, technológia rajongók, üzleti felhasználók..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Product */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Termék/Szolgáltatás (opcionális)</label>
            <input
              type="text"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              placeholder="pl. Samsung Galaxy S25 Ultra, MacBook Pro..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Promotion */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block flex items-center gap-2">
              <TrendingUp size={14} />
              Kedvezmény/Ajánlat (opcionális)
            </label>
            <input
              type="text"
              value={promotion}
              onChange={(e) => setPromotion(e.target.value)}
              placeholder="pl. 20% kedvezmény, Ingyenes szállítás, 2+1 akció..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={generateContent}
            disabled={isGenerating || !topic.trim()}
            className="w-full py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 rounded-lg text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Generálás...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Tartalom generálása
              </>
            )}
          </button>
        </div>

        {/* Output Section */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10 min-h-[400px] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-medium">Generált tartalom</h3>
            {generatedContent && (
              <div className="flex items-center gap-2">
                <button
                  onClick={regenerate}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                  title="Újragenerálás"
                >
                  <RefreshCw size={16} />
                </button>
                <button
                  onClick={copyToClipboard}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                  title="Másolás"
                >
                  {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                </button>
              </div>
            )}
          </div>

          <AnimatePresence mode="wait">
            {isGenerating ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex items-center justify-center"
              >
                <div className="text-center">
                  <Loader2 className="animate-spin text-purple-400 mx-auto mb-3" size={32} />
                  <p className="text-gray-400 text-sm">AI generálja a tartalmat...</p>
                </div>
              </motion.div>
            ) : generatedContent ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 overflow-auto"
              >
                {generatedContent.subject && (
                  <div className="mb-4 p-3 bg-purple-600/10 rounded-lg border border-purple-500/20">
                    <p className="text-xs text-purple-400 mb-1">Tárgy:</p>
                    <p className="text-white font-medium">{generatedContent.subject}</p>
                  </div>
                )}
                
                <div className="prose prose-invert prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-gray-300 text-sm leading-relaxed">
                    {generatedContent.content}
                  </div>
                </div>

                {generatedContent.hashtags && generatedContent.hashtags.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-xs text-gray-500 mb-2">Hashtag-ek:</p>
                    <div className="flex flex-wrap gap-2">
                      {generatedContent.hashtags.map((tag, i) => (
                        <span key={i} className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex items-center justify-center"
              >
                <div className="text-center">
                  <Wand2 className="text-gray-600 mx-auto mb-3" size={48} />
                  <p className="text-gray-500 text-sm">
                    Töltsd ki a mezőket és kattints a <br />
                    "Tartalom generálása" gombra
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
