'use client'

import { useState } from 'react'
import { Sparkles, Loader2, Copy, Check, Wand2 } from 'lucide-react'
import { toast } from 'sonner'

interface AIDescriptionGeneratorProps {
  productName: string
  category?: string
  currentDescription?: string
  onDescriptionGenerated: (description: string) => void
}

export default function AIDescriptionGenerator({
  productName,
  category,
  currentDescription,
  onDescriptionGenerated
}: AIDescriptionGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedDescription, setGeneratedDescription] = useState('')
  const [tone, setTone] = useState<'professional' | 'friendly' | 'technical' | 'marketing'>('professional')
  const [copied, setCopied] = useState(false)

  const generateDescription = async () => {
    if (!productName.trim()) {
      toast.error('Adj meg egy terméknevet!')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/admin/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName,
          category,
          currentDescription,
          tone
        })
      })

      if (!response.ok) throw new Error('Failed to generate')

      const data = await response.json()
      setGeneratedDescription(data.description)
    } catch (error) {
      console.error('Generation error:', error)
      toast.error('Nem sikerült generálni a leírást')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedDescription)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Másolva a vágólapra!')
  }

  const useDescription = () => {
    onDescriptionGenerated(generatedDescription)
    toast.success('Leírás alkalmazva!')
  }

  const tones = [
    { value: 'professional', label: 'Professzionális', emoji: '💼' },
    { value: 'friendly', label: 'Barátságos', emoji: '😊' },
    { value: 'technical', label: 'Technikai', emoji: '🔧' },
    { value: 'marketing', label: 'Marketing', emoji: '🎯' }
  ] as const

  return (
    <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-purple-500/20 rounded-lg">
          <Sparkles className="text-purple-400" size={20} />
        </div>
        <div>
          <h3 className="font-semibold text-white">AI Leírás Generátor</h3>
          <p className="text-xs text-gray-400">GPT-5 Mini powered</p>
        </div>
      </div>

      {/* Tone selector */}
      <div className="mb-4">
        <label className="text-sm text-gray-400 mb-2 block">Hangnem</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {tones.map((t) => (
            <button
              key={t.value}
              onClick={() => setTone(t.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                tone === t.value
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <span className="mr-1">{t.emoji}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Generate button */}
      <button
        onClick={generateDescription}
        disabled={isGenerating || !productName.trim()}
        className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2"
      >
        {isGenerating ? (
          <>
            <Loader2 className="animate-spin" size={18} />
            Generálás...
          </>
        ) : (
          <>
            <Wand2 size={18} />
            Leírás generálása
          </>
        )}
      </button>

      {/* Generated description */}
      {generatedDescription && (
        <div className="mt-4 space-y-3">
          <div className="bg-black/30 border border-white/10 rounded-lg p-4">
            <p className="text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">
              {generatedDescription}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={copyToClipboard}
              className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 transition-colors flex items-center justify-center gap-2"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Másolva!' : 'Másolás'}
            </button>
            <button
              onClick={useDescription}
              className="flex-1 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-semibold text-white transition-colors flex items-center justify-center gap-2"
            >
              <Check size={16} />
              Használat
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
