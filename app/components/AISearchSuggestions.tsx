'use client'

import { useState } from 'react'
import { Sparkles, Search, ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface AISearchSuggestionsProps {
  query: string
  onSuggestionClick?: (suggestion: string) => void
}

export default function AISearchSuggestions({ query, onSuggestionClick }: AISearchSuggestionsProps) {
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasAsked, setHasAsked] = useState(false)

  const getAISuggestion = async () => {
    if (!query.trim() || isLoading) return
    
    setIsLoading(true)
    setHasAsked(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `A felhasználó "${query}" kifejezésre keres a webshopban. Adj egy rövid, hasznos javaslatot magyarul (max 2 mondat) ami segít a keresésben. Ha konkrét termékeket találsz, említsd meg őket. Válaszolj barátságosan!`
          }]
        })
      })

      if (!response.ok) throw new Error('Failed')
      
      const data = await response.json()
      setAiSuggestion(data.content)
    } catch (error) {
      setAiSuggestion('Sajnos nem tudtam javaslatot adni. Próbáld újra!')
    } finally {
      setIsLoading(false)
    }
  }

  if (!query.trim()) return null

  return (
    <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-xl p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0">
          <Sparkles size={16} className="text-white" />
        </div>
        
        <div className="flex-1 min-w-0">
          {!hasAsked ? (
            <div>
              <p className="text-sm text-gray-300 mb-2">
                AI segítség a kereséshez: &quot;{query}&quot;
              </p>
              <button
                onClick={getAISuggestion}
                className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm text-white transition-colors"
              >
                <Sparkles size={14} />
                Kérek AI javaslatot
              </button>
            </div>
          ) : isLoading ? (
            <div className="flex items-center gap-2 text-gray-400">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">AI gondolkodik...</span>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-200 whitespace-pre-wrap">{aiSuggestion}</p>
              <button
                onClick={() => {
                  setHasAsked(false)
                  setAiSuggestion(null)
                }}
                className="mt-2 text-xs text-purple-400 hover:text-purple-300"
              >
                Új javaslat kérése
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
