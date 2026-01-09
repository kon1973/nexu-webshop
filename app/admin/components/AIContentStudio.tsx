'use client'

import { useState } from 'react'
import { FileText, Wand2, Copy, Check, RefreshCw, Image, Mail, Share2, Search, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { generateAIContent } from '@/lib/actions/ai-actions'
import { toast } from 'sonner'

interface Product {
  id: number
  name: string
}

type LocalContentType = 
  | 'product-description'
  | 'meta-tags'
  | 'social-post'
  | 'email-campaign'
  | 'blog-post'
  | 'ad-copy'

export default function AIContentStudio() {
  const [contentType, setContentType] = useState<LocalContentType>('product-description')
  const [selectedProductId, setSelectedProductId] = useState<number | undefined>()
  const [topic, setTopic] = useState('')
  const [tone, setTone] = useState<'professional' | 'casual' | 'enthusiastic' | 'luxury'>('professional')
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium')
  const [generatedContent, setGeneratedContent] = useState<string | object | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  const contentTypes: { value: LocalContentType; label: string; icon: React.ElementType; description: string }[] = [
    { value: 'product-description', label: 'Termékleírás', icon: FileText, description: 'Meggyőző termékleírások' },
    { value: 'meta-tags', label: 'SEO Meta Tagek', icon: Search, description: 'Title, description, keywords' },
    { value: 'social-post', label: 'Social Poszt', icon: Share2, description: 'Instagram/Facebook poszt' },
    { value: 'email-campaign', label: 'Email Kampány', icon: Mail, description: 'Marketing email sablon' },
    { value: 'blog-post', label: 'Blog Bejegyzés', icon: FileText, description: 'SEO-optimalizált blog' },
    { value: 'ad-copy', label: 'Hirdetés Szöveg', icon: Image, description: 'Google/Facebook ads' }
  ]

  const tones = [
    { value: 'professional', label: 'Professzionális' },
    { value: 'casual', label: 'Közvetlen' },
    { value: 'enthusiastic', label: 'Lelkes' },
    { value: 'luxury', label: 'Prémium' }
  ]

  const lengths = [
    { value: 'short', label: 'Rövid' },
    { value: 'medium', label: 'Közepes' },
    { value: 'long', label: 'Hosszú' }
  ]

  const searchProducts = async () => {
    if (!searchQuery.trim()) return
    
    try {
      const res = await fetch(`/api/products/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await res.json()
      setProducts(data.products || [])
    } catch {
      toast.error('Nem sikerült keresni')
    }
  }

  const generateContent = async () => {
    if (contentType === 'product-description' && !selectedProductId && !topic) {
      toast.error('Válassz egy terméket vagy adj meg témát!')
      return
    }

    setIsLoading(true)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await generateAIContent({
        type: contentType as any,
        productId: selectedProductId,
        topic: topic || undefined,
        tone,
        length
      })

      if (result.error) {
        toast.error(result.error)
        return
      }

      setGeneratedContent(result.content || null)
      toast.success('Tartalom sikeresen generálva!')
    } catch {
      toast.error('Hiba történt a generálás során')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async () => {
    const text = typeof generatedContent === 'string' 
      ? generatedContent 
      : JSON.stringify(generatedContent, null, 2)
    
    await navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Másolva a vágólapra!')
    setTimeout(() => setCopied(false), 2000)
  }

  const renderContent = () => {
    if (!generatedContent) return null

    if (typeof generatedContent === 'string') {
      return (
        <div className="prose prose-invert max-w-none">
          <div className="whitespace-pre-wrap text-gray-300">{generatedContent}</div>
        </div>
      )
    }

    // Structured content (JSON)
    if (contentType === 'meta-tags') {
      const meta = generatedContent as {
        title?: string
        description?: string
        keywords?: string[]
        ogTitle?: string
        ogDescription?: string
      }
      return (
        <div className="space-y-4">
          <div>
            <label className="text-gray-400 text-xs">Title</label>
            <p className="text-white bg-white/5 rounded p-2 mt-1">{meta.title}</p>
          </div>
          <div>
            <label className="text-gray-400 text-xs">Description</label>
            <p className="text-white bg-white/5 rounded p-2 mt-1">{meta.description}</p>
          </div>
          <div>
            <label className="text-gray-400 text-xs">Keywords</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {meta.keywords?.map((kw, i) => (
                <span key={i} className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-sm">
                  {kw}
                </span>
              ))}
            </div>
          </div>
          <div>
            <label className="text-gray-400 text-xs">OG Title</label>
            <p className="text-white bg-white/5 rounded p-2 mt-1">{meta.ogTitle}</p>
          </div>
          <div>
            <label className="text-gray-400 text-xs">OG Description</label>
            <p className="text-white bg-white/5 rounded p-2 mt-1">{meta.ogDescription}</p>
          </div>
        </div>
      )
    }

    if (contentType === 'email-campaign') {
      const email = generatedContent as {
        subject?: string
        preheader?: string
        headline?: string
        body?: string
        cta?: string
      }
      return (
        <div className="space-y-4">
          <div>
            <label className="text-gray-400 text-xs">Tárgy</label>
            <p className="text-white bg-white/5 rounded p-2 mt-1">{email.subject}</p>
          </div>
          <div>
            <label className="text-gray-400 text-xs">Előnézet</label>
            <p className="text-white bg-white/5 rounded p-2 mt-1">{email.preheader}</p>
          </div>
          <div>
            <label className="text-gray-400 text-xs">Főcím</label>
            <p className="text-white text-xl font-bold bg-white/5 rounded p-2 mt-1">{email.headline}</p>
          </div>
          <div>
            <label className="text-gray-400 text-xs">Tartalom</label>
            <div 
              className="text-gray-300 bg-white/5 rounded p-4 mt-1"
              dangerouslySetInnerHTML={{ __html: email.body || '' }}
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs">CTA Gomb</label>
            <div className="mt-1">
              <span className="px-6 py-2 bg-purple-600 text-white rounded-lg inline-block">
                {email.cta}
              </span>
            </div>
          </div>
        </div>
      )
    }

    if (contentType === 'ad-copy') {
      const ad = generatedContent as {
        headlines?: string[]
        descriptions?: string[]
        callToAction?: string
      }
      return (
        <div className="space-y-4">
          <div>
            <label className="text-gray-400 text-xs">Főcímek</label>
            <div className="space-y-2 mt-1">
              {ad.headlines?.map((h, i) => (
                <p key={i} className="text-white bg-white/5 rounded p-2">{h}</p>
              ))}
            </div>
          </div>
          <div>
            <label className="text-gray-400 text-xs">Leírások</label>
            <div className="space-y-2 mt-1">
              {ad.descriptions?.map((d, i) => (
                <p key={i} className="text-gray-300 bg-white/5 rounded p-2">{d}</p>
              ))}
            </div>
          </div>
          <div>
            <label className="text-gray-400 text-xs">Call-to-Action</label>
            <div className="mt-1">
              <span className="px-4 py-2 bg-blue-600 text-white rounded inline-block">
                {ad.callToAction}
              </span>
            </div>
          </div>
        </div>
      )
    }

    return (
      <pre className="text-gray-300 bg-white/5 rounded p-4 overflow-auto text-sm">
        {JSON.stringify(generatedContent, null, 2)}
      </pre>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Wand2 className="text-purple-400" />
          AI Content Studio
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          Generálj AI-val különböző marketing tartalmakat
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Controls */}
        <div className="lg:col-span-1 space-y-4">
          {/* Content Type Selection */}
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Tartalom típusa</label>
            <div className="grid grid-cols-2 gap-2">
              {contentTypes.map(type => (
                <button
                  key={type.value}
                  onClick={() => setContentType(type.value)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    contentType === type.value
                      ? 'bg-purple-600/20 border-purple-500 text-white'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                  }`}
                >
                  <type.icon size={18} className="mb-1" />
                  <p className="text-sm font-medium">{type.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Product Search */}
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Termék (opcionális)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchProducts()}
                placeholder="Keresés..."
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={searchProducts}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white"
              >
                <Search size={18} />
              </button>
            </div>
            {products.length > 0 && (
              <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
                {products.map(product => (
                  <button
                    key={product.id}
                    onClick={() => {
                      setSelectedProductId(product.id)
                      setProducts([])
                      setSearchQuery(product.name)
                    }}
                    className="w-full text-left px-3 py-2 bg-white/5 hover:bg-white/10 rounded text-sm text-gray-300"
                  >
                    {product.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Topic (alternative to product) */}
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Vagy téma megadása</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Pl: Nyári akció, Black Friday..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Tone */}
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Hangnem</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value as typeof tone)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
            >
              {tones.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Length */}
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Hossz</label>
            <div className="flex gap-2">
              {lengths.map(l => (
                <button
                  key={l.value}
                  onClick={() => setLength(l.value as typeof length)}
                  className={`flex-1 py-2 rounded-lg text-sm transition-colors ${
                    length === l.value
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={generateContent}
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
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

        {/* Right Panel - Generated Content */}
        <div className="lg:col-span-2">
          <div className="bg-[#121212] border border-white/10 rounded-xl p-6 min-h-[500px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium">Generált tartalom</h3>
              {generatedContent && (
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white text-sm transition-colors"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Másolva!' : 'Másolás'}
                </button>
              )}
            </div>

            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-20"
                >
                  <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4" />
                  <p className="text-gray-400">AI dolgozik a tartalmon...</p>
                </motion.div>
              ) : generatedContent ? (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {renderContent()}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-20 text-gray-500"
                >
                  <Wand2 size={48} className="mb-4 opacity-30" />
                  <p>Válassz típust és kattints a generálásra</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
