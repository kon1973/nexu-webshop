'use client'

import { useState } from 'react'
import { Sparkles, Loader2, Copy, Check, Wand2, Image as ImageIcon, FileText, Search, Download, RefreshCw, ChevronDown, ChevronUp, Zap, Settings2 } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

interface AIDescriptionGeneratorProps {
  productName: string
  category?: string
  currentDescription?: string
  onDescriptionGenerated: (description: string) => void
  onSpecsGenerated?: (specs: { name: string; value: string }[]) => void
  onImagesFound?: (images: { url: string; alt: string }[]) => void
  onSeoGenerated?: (seo: { metaTitle: string; metaDescription: string; keywords: string[] }) => void
}

interface GeneratedImage {
  url: string
  thumbnail?: string
  alt: string
  source: string
  photographer?: string
  downloadUrl?: string
}

interface GeneratedSpecs {
  specifications: { name: string; value: string }[]
}

interface GeneratedSeo {
  metaTitle: string
  metaDescription: string
  keywords: string[]
  slug: string
}

type Tone = 'professional' | 'friendly' | 'technical' | 'marketing' | 'luxury' | 'casual'
type ContentType = 'short' | 'full' | 'seo'

export default function AIDescriptionGenerator({
  productName,
  category,
  currentDescription,
  onDescriptionGenerated,
  onSpecsGenerated,
  onImagesFound,
  onSeoGenerated
}: AIDescriptionGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedDescription, setGeneratedDescription] = useState('')
  const [generatedSpecs, setGeneratedSpecs] = useState<GeneratedSpecs | null>(null)
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [generatedSeo, setGeneratedSeo] = useState<GeneratedSeo | null>(null)
  
  const [tone, setTone] = useState<Tone>('professional')
  const [contentType, setContentType] = useState<ContentType>('full')
  const [generateImages, setGenerateImages] = useState(true)
  const [generateSpecs, setGenerateSpecs] = useState(true)
  
  const [copied, setCopied] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'images' | 'seo'>('description')

  const generateContent = async () => {
    if (!productName.trim()) {
      toast.error('Adj meg egy terméknevet!')
      return
    }

    setIsGenerating(true)
    setGeneratedDescription('')
    setGeneratedSpecs(null)
    setGeneratedImages([])
    setGeneratedSeo(null)

    try {
      const response = await fetch('/api/admin/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName,
          category,
          currentDescription,
          tone,
          contentType,
          generateImages,
          generateSpecs
        })
      })

      if (!response.ok) throw new Error('Failed to generate')

      const data = await response.json()
      
      setGeneratedDescription(data.description || '')
      
      if (data.specifications) {
        setGeneratedSpecs(data.specifications)
      }
      
      if (data.images?.length > 0) {
        setGeneratedImages(data.images)
      }
      
      if (data.seo) {
        setGeneratedSeo(data.seo)
      }

      toast.success('Tartalom sikeresen generálva!', {
        description: `GPT-5.2 • ${data.images?.length || 0} kép • ${data.specifications?.specifications?.length || 0} specifikáció`
      })
    } catch (error) {
      console.error('Generation error:', error)
      toast.error('Nem sikerült generálni a tartalmat')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Másolva!')
  }

  const useDescription = () => {
    onDescriptionGenerated(generatedDescription)
    toast.success('Leírás alkalmazva!')
  }

  const useSpecs = () => {
    if (onSpecsGenerated && generatedSpecs?.specifications) {
      onSpecsGenerated(generatedSpecs.specifications)
      toast.success('Specifikációk alkalmazva!')
    }
  }

  const useSeo = () => {
    if (onSeoGenerated && generatedSeo) {
      onSeoGenerated(generatedSeo)
      toast.success('SEO adatok alkalmazva!')
    }
  }

  const downloadImage = async (image: GeneratedImage) => {
    try {
      const response = await fetch(image.downloadUrl || image.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${productName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.jpg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      toast.success('Kép letöltve!')
    } catch (e) {
      toast.error('Nem sikerült letölteni a képet')
    }
  }

  const tones = [
    { value: 'professional' as Tone, label: 'Professzionális', emoji: '💼', desc: 'Üzleti, hivatalos' },
    { value: 'friendly' as Tone, label: 'Barátságos', emoji: '😊', desc: 'Közeli, személyes' },
    { value: 'technical' as Tone, label: 'Technikai', emoji: '🔧', desc: 'Részletes, precíz' },
    { value: 'marketing' as Tone, label: 'Marketing', emoji: '🎯', desc: 'Meggyőző, értékesítő' },
    { value: 'luxury' as Tone, label: 'Prémium', emoji: '✨', desc: 'Exkluzív, elegáns' },
    { value: 'casual' as Tone, label: 'Laza', emoji: '😎', desc: 'Fiatalos, kreatív' }
  ]

  const contentTypes = [
    { value: 'short' as ContentType, label: 'Rövid', desc: '50-80 szó' },
    { value: 'full' as ContentType, label: 'Teljes', desc: '200-350 szó' },
    { value: 'seo' as ContentType, label: 'SEO+', desc: 'SEO optimalizált' }
  ]

  const hasContent = generatedDescription || generatedSpecs || generatedImages.length > 0 || generatedSeo

  return (
    <div className="bg-gradient-to-br from-purple-900/30 via-blue-900/20 to-indigo-900/30 border border-purple-500/30 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-black/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl shadow-lg shadow-purple-500/20">
              <Sparkles className="text-white" size={22} />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">AI Content Studio</h3>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Zap size={10} className="text-yellow-400" />
                Powered by GPT-5.2
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <Settings2 size={18} />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Tone Selector */}
        <div>
          <label className="text-sm font-medium text-gray-300 mb-2 block">Hangnem</label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {tones.map((t) => (
              <button
                key={t.value}
                onClick={() => setTone(t.value)}
                className={`p-2 rounded-xl text-center transition-all ${
                  tone === t.value
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="text-lg block mb-0.5">{t.emoji}</span>
                <span className="text-xs font-medium">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Type */}
        <div>
          <label className="text-sm font-medium text-gray-300 mb-2 block">Tartalom típus</label>
          <div className="flex gap-2">
            {contentTypes.map((ct) => (
              <button
                key={ct.value}
                onClick={() => setContentType(ct.value)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  contentType === ct.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {ct.label}
                <span className="text-xs opacity-60 ml-1">({ct.desc})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Options */}
        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-3 bg-white/5 rounded-xl space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={generateImages}
                    onChange={(e) => setGenerateImages(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-600 focus:ring-purple-500"
                  />
                  <div className="flex items-center gap-2">
                    <ImageIcon size={16} className="text-purple-400" />
                    <span className="text-sm text-gray-300">Stock képek keresése (Unsplash)</span>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={generateSpecs}
                    onChange={(e) => setGenerateSpecs(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-600 focus:ring-purple-500"
                  />
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-blue-400" />
                    <span className="text-sm text-gray-300">Specifikációk generálása</span>
                  </div>
                </label>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Generate Button */}
        <button
          onClick={generateContent}
          disabled={isGenerating || !productName.trim()}
          className="w-full py-4 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-500 hover:via-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-white transition-all flex items-center justify-center gap-3 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40"
        >
          {isGenerating ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>Generálás folyamatban...</span>
            </>
          ) : (
            <>
              <Wand2 size={20} />
              <span>Tartalom generálása</span>
              <span className="text-xs opacity-70 bg-white/10 px-2 py-0.5 rounded">GPT-5.2</span>
            </>
          )}
        </button>

        {/* Generated Content */}
        {hasContent && (
          <div className="mt-6 space-y-4">
            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-white/5 rounded-lg">
              {[
                { id: 'description' as const, label: 'Leírás', icon: FileText, show: !!generatedDescription },
                { id: 'specs' as const, label: 'Specifikációk', icon: Settings2, show: !!generatedSpecs },
                { id: 'images' as const, label: `Képek (${generatedImages.length})`, icon: ImageIcon, show: generatedImages.length > 0 },
                { id: 'seo' as const, label: 'SEO', icon: Search, show: !!generatedSeo }
              ].filter(tab => tab.show).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === 'description' && generatedDescription && (
                <motion.div
                  key="description"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  <div className="bg-black/30 border border-white/10 rounded-xl p-4 max-h-80 overflow-y-auto">
                    <div className="prose prose-invert prose-sm max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: generatedDescription.replace(/\n/g, '<br>') }} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(generatedDescription)}
                      className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 transition-colors flex items-center justify-center gap-2"
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                      {copied ? 'Másolva!' : 'Másolás'}
                    </button>
                    <button
                      onClick={useDescription}
                      className="flex-1 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-semibold text-white transition-colors flex items-center justify-center gap-2"
                    >
                      <Check size={16} />
                      Alkalmazás
                    </button>
                    <button
                      onClick={generateContent}
                      className="py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                    >
                      <RefreshCw size={16} />
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'specs' && generatedSpecs && (
                <motion.div
                  key="specs"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  <div className="bg-black/30 border border-white/10 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <tbody>
                        {generatedSpecs.specifications?.map((spec, i) => (
                          <tr key={i} className={i % 2 === 0 ? 'bg-white/5' : ''}>
                            <td className="px-4 py-2.5 text-gray-400 font-medium">{spec.name}</td>
                            <td className="px-4 py-2.5 text-white">{spec.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {onSpecsGenerated && (
                    <button
                      onClick={useSpecs}
                      className="w-full py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-semibold text-white transition-colors flex items-center justify-center gap-2"
                    >
                      <Check size={16} />
                      Specifikációk alkalmazása
                    </button>
                  )}
                </motion.div>
              )}

              {activeTab === 'images' && generatedImages.length > 0 && (
                <motion.div
                  key="images"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {generatedImages.map((img, i) => (
                      <div key={i} className="relative group rounded-xl overflow-hidden bg-white/5">
                        <div className="aspect-video relative">
                          <Image
                            src={img.thumbnail || img.url}
                            alt={img.alt}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            onClick={() => downloadImage(img)}
                            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                          >
                            <Download size={18} className="text-white" />
                          </button>
                          <button
                            onClick={() => window.open(img.url, '_blank')}
                            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                          >
                            <Search size={18} className="text-white" />
                          </button>
                        </div>
                        {img.photographer && (
                          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                            <p className="text-xs text-gray-300 truncate">📷 {img.photographer}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    Képek forrása: Unsplash • Ingyenesen használható
                  </p>
                </motion.div>
              )}

              {activeTab === 'seo' && generatedSeo && (
                <motion.div
                  key="seo"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  <div className="bg-black/30 border border-white/10 rounded-xl p-4 space-y-4">
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Meta Title</label>
                      <p className="text-white mt-1">{generatedSeo.metaTitle}</p>
                      <p className="text-xs text-gray-500 mt-1">{generatedSeo.metaTitle?.length}/60 karakter</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Meta Description</label>
                      <p className="text-gray-300 mt-1 text-sm">{generatedSeo.metaDescription}</p>
                      <p className="text-xs text-gray-500 mt-1">{generatedSeo.metaDescription?.length}/155 karakter</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Kulcsszavak</label>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {generatedSeo.keywords?.map((kw, i) => (
                          <span key={i} className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">URL Slug</label>
                      <code className="text-green-400 mt-1 text-sm block">/shop/{generatedSeo.slug}</code>
                    </div>
                  </div>
                  {onSeoGenerated && (
                    <button
                      onClick={useSeo}
                      className="w-full py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-semibold text-white transition-colors flex items-center justify-center gap-2"
                    >
                      <Check size={16} />
                      SEO adatok alkalmazása
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
