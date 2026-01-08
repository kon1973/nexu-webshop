'use client'

import { type Dispatch, type SetStateAction, useState, useEffect } from 'react'
import { Search, Globe, Tag, BarChart3, Sparkles, AlertCircle, CheckCircle2, Info } from 'lucide-react'

type Props = {
  name: string
  description: string
  metaTitle: string
  setMetaTitle: Dispatch<SetStateAction<string>>
  metaDescription: string
  setMetaDescription: Dispatch<SetStateAction<string>>
  metaKeywords: string
  setMetaKeywords: Dispatch<SetStateAction<string>>
  slug: string
  setSlug: Dispatch<SetStateAction<string>>
  gtin: string
  setGtin: Dispatch<SetStateAction<string>>
  mpn: string
  setMpn: Dispatch<SetStateAction<string>>
  productSku: string
  setProductSku: Dispatch<SetStateAction<string>>
}

// Generate slug from text
function generateSlug(text: string): string {
  const hungarianMap: Record<string, string> = {
    'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ö': 'o', 'ő': 'o',
    'ú': 'u', 'ü': 'u', 'ű': 'u', 'Á': 'a', 'É': 'e', 'Í': 'i',
    'Ó': 'o', 'Ö': 'o', 'Ő': 'o', 'Ú': 'u', 'Ü': 'u', 'Ű': 'u'
  }
  
  return text
    .toLowerCase()
    .split('')
    .map(char => hungarianMap[char] || char)
    .join('')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// SEO score calculator
function calculateSeoScore(data: {
  name: string
  description: string
  metaTitle: string
  metaDescription: string
  metaKeywords: string
  slug: string
}): { score: number; tips: string[] } {
  let score = 0
  const tips: string[] = []

  // Title checks (30 points max)
  const title = data.metaTitle || data.name
  if (title.length >= 30 && title.length <= 60) {
    score += 20
  } else if (title.length > 0) {
    score += 10
    if (title.length < 30) tips.push('SEO cím túl rövid (ajánlott: 30-60 karakter)')
    if (title.length > 60) tips.push('SEO cím túl hosszú (max 60 karakter)')
  } else {
    tips.push('Adj meg SEO címet')
  }

  // Meta description checks (30 points max)
  const desc = data.metaDescription || data.description
  if (desc.length >= 120 && desc.length <= 160) {
    score += 30
  } else if (desc.length > 0) {
    score += 15
    if (desc.length < 120) tips.push('Meta leírás túl rövid (ajánlott: 120-160 karakter)')
    if (desc.length > 160) tips.push('Meta leírás túl hosszú (max 160 karakter)')
  } else {
    tips.push('Adj meg meta leírást')
  }

  // Slug check (15 points)
  if (data.slug && data.slug.length > 0) {
    score += 15
    if (data.slug.length > 75) tips.push('URL slug túl hosszú')
  } else {
    tips.push('Állíts be egyedi URL slug-ot')
  }

  // Keywords check (15 points)
  if (data.metaKeywords && data.metaKeywords.split(',').filter(k => k.trim()).length >= 3) {
    score += 15
  } else if (data.metaKeywords) {
    score += 7
    tips.push('Adj meg legalább 3 kulcsszót')
  } else {
    tips.push('Adj meg kulcsszavakat')
  }

  // Name quality (10 points)
  if (data.name.length >= 20 && data.name.length <= 70) {
    score += 10
  } else if (data.name.length > 0) {
    score += 5
    if (data.name.length < 20) tips.push('Terméknév túl rövid a jó SEO-hoz')
  }

  return { score: Math.min(score, 100), tips }
}

export function ProductSEO({
  name,
  description,
  metaTitle,
  setMetaTitle,
  metaDescription,
  setMetaDescription,
  metaKeywords,
  setMetaKeywords,
  slug,
  setSlug,
  gtin,
  setGtin,
  mpn,
  setMpn,
  productSku,
  setProductSku
}: Props) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [autoSlug, setAutoSlug] = useState(true)

  // Auto-generate slug from name
  useEffect(() => {
    if (autoSlug && name) {
      setSlug(generateSlug(name))
    }
  }, [name, autoSlug, setSlug])

  // Calculate SEO score
  const { score, tips } = calculateSeoScore({
    name,
    description,
    metaTitle,
    metaDescription,
    metaKeywords,
    slug
  })

  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-green-400'
    if (s >= 50) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getScoreBg = (s: number) => {
    if (s >= 80) return 'bg-green-500'
    if (s >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  // Generate AI suggestion for meta description
  const generateMetaDescription = () => {
    if (description) {
      // Smart truncation at word boundary
      let truncated = description.slice(0, 155)
      const lastSpace = truncated.lastIndexOf(' ')
      if (lastSpace > 100) truncated = truncated.slice(0, lastSpace)
      setMetaDescription(truncated + (description.length > 155 ? '...' : ''))
    }
  }

  return (
    <div className="space-y-6 border-t border-white/10 pt-8">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Search className="text-purple-500" size={20} />
          SEO beállítások
        </h3>
        
        {/* SEO Score Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl">
            <BarChart3 size={16} className={getScoreColor(score)} />
            <span className="text-sm text-gray-400">SEO pontszám:</span>
            <span className={`font-bold ${getScoreColor(score)}`}>{score}/100</span>
          </div>
        </div>
      </div>

      {/* SEO Score Progress Bar */}
      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <div 
          className={`h-full ${getScoreBg(score)} transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* SEO Tips */}
      {tips.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 text-yellow-400 mb-2">
            <AlertCircle size={16} />
            <span className="font-bold text-sm">SEO javítási javaslatok:</span>
          </div>
          <ul className="space-y-1">
            {tips.map((tip, i) => (
              <li key={i} className="text-sm text-yellow-300/80 flex items-center gap-2">
                <span className="w-1 h-1 bg-yellow-400 rounded-full" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {score >= 80 && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle2 className="text-green-400" size={20} />
          <span className="text-sm text-green-300">Kiváló SEO beállítások! A termék jól fog szerepelni a keresőkben.</span>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Meta Title */}
        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-gray-400 mb-2 flex items-center gap-2">
            <Globe size={14} />
            SEO cím (meta title)
            <span className="text-xs text-gray-500 font-normal">- megjelenik a Google keresőben</span>
          </label>
          <input
            type="text"
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            maxLength={70}
            placeholder={name || 'Termék neve - NEXU Store'}
            className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-white focus:border-purple-500 outline-none transition-colors"
          />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-500">
              Előnézet: <span className="text-blue-400">{metaTitle || name || 'Termék neve'} - NEXU Store</span>
            </span>
            <span className={`text-xs ${metaTitle.length > 60 ? 'text-red-400' : 'text-gray-500'}`}>
              {metaTitle.length}/70
            </span>
          </div>
        </div>

        {/* Meta Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-gray-400 mb-2 flex items-center gap-2">
            <Tag size={14} />
            SEO leírás (meta description)
            <button
              type="button"
              onClick={generateMetaDescription}
              className="ml-auto text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-lg hover:bg-purple-500/30 transition-colors flex items-center gap-1"
            >
              <Sparkles size={12} />
              Generálás leírásból
            </button>
          </label>
          <textarea
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            maxLength={160}
            rows={2}
            placeholder="Rövid, vonzó leírás a termékről, ami megjelenik a Google találatokban..."
            className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-white focus:border-purple-500 outline-none transition-colors resize-none"
          />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-500">Ajánlott: 120-160 karakter</span>
            <span className={`text-xs ${metaDescription.length > 160 ? 'text-red-400' : metaDescription.length >= 120 ? 'text-green-400' : 'text-gray-500'}`}>
              {metaDescription.length}/160
            </span>
          </div>
        </div>

        {/* URL Slug */}
        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-gray-400 mb-2 flex items-center gap-2">
            <Globe size={14} />
            URL slug
            <label className="ml-auto flex items-center gap-2 text-xs font-normal cursor-pointer">
              <input
                type="checkbox"
                checked={autoSlug}
                onChange={(e) => setAutoSlug(e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 text-purple-600 focus:ring-purple-500 bg-[#0a0a0a]"
              />
              <span className="text-gray-500">Automatikus generálás</span>
            </label>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-sm">nexu-store.hu/shop/</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => {
                setAutoSlug(false)
                setSlug(generateSlug(e.target.value))
              }}
              placeholder="termek-neve"
              className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-white focus:border-purple-500 outline-none transition-colors"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Keresőbarát URL. Csak kisbetűk, számok és kötőjel használható.
          </p>
        </div>

        {/* Keywords */}
        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-gray-400 mb-2 flex items-center gap-2">
            <Tag size={14} />
            Kulcsszavak (vesszővel elválasztva)
          </label>
          <input
            type="text"
            value={metaKeywords}
            onChange={(e) => setMetaKeywords(e.target.value)}
            placeholder="iphone, okostelefon, apple, mobiltelefon..."
            className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-white focus:border-purple-500 outline-none transition-colors"
          />
          <p className="text-xs text-gray-500 mt-1">
            {metaKeywords.split(',').filter(k => k.trim()).length} kulcsszó megadva (ajánlott: 5-10)
          </p>
        </div>
      </div>

      {/* Advanced Options Toggle */}
      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-2"
      >
        <Info size={14} />
        {showAdvanced ? 'Haladó beállítások elrejtése' : 'Haladó beállítások (GTIN, MPN, SKU)'}
      </button>

      {/* Advanced SEO Fields */}
      {showAdvanced && (
        <div className="grid md:grid-cols-3 gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2">
              GTIN (vonalkód)
              <span className="text-xs font-normal text-gray-500 ml-1">EAN/UPC</span>
            </label>
            <input
              type="text"
              value={gtin}
              onChange={(e) => setGtin(e.target.value)}
              placeholder="5901234123457"
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 outline-none transition-colors text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2">
              MPN
              <span className="text-xs font-normal text-gray-500 ml-1">Gyártói cikkszám</span>
            </label>
            <input
              type="text"
              value={mpn}
              onChange={(e) => setMpn(e.target.value)}
              placeholder="MTPH3HU/A"
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 outline-none transition-colors text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2">
              SKU
              <span className="text-xs font-normal text-gray-500 ml-1">Saját cikkszám</span>
            </label>
            <input
              type="text"
              value={productSku}
              onChange={(e) => setProductSku(e.target.value)}
              placeholder="NEXU-IP15-128-BLK"
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 outline-none transition-colors text-sm"
            />
          </div>
          <p className="md:col-span-3 text-xs text-gray-500">
            Ezek a mezők segítenek a Google Shopping és más kereskedelmi platformoknak azonosítani a terméket.
          </p>
        </div>
      )}

      {/* Google Preview */}
      <div className="bg-white rounded-xl p-4 mt-4">
        <p className="text-xs text-gray-500 mb-2">Google kereső előnézet:</p>
        <div className="space-y-1">
          <p className="text-blue-600 text-lg hover:underline cursor-pointer font-medium truncate">
            {metaTitle || name || 'Termék neve'} - NEXU Store
          </p>
          <p className="text-green-700 text-sm">
            nexu-store.hu › shop › {slug || 'termek-neve'}
          </p>
          <p className="text-gray-600 text-sm line-clamp-2">
            {metaDescription || description || 'A termék leírása jelenik meg itt. Adj meg vonzó meta leírást, hogy több kattintást kapj a keresőből!'}
          </p>
        </div>
      </div>
    </div>
  )
}
