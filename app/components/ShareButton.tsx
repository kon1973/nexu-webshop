'use client'

import { Share2, Check } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export default function ShareButton({ title, text, url }: { title: string; text: string; url: string }) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        })
      } catch (error) {
        // User cancelled or error
      }
    } else {
      try {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        toast.success('Link másolva a vágólapra!')
        setTimeout(() => setCopied(false), 2000)
      } catch (error) {
        toast.error('Nem sikerült másolni a linket.')
      }
    }
  }

  return (
    <button
      onClick={handleShare}
      className="p-3 bg-[#121212] border border-white/10 rounded-full text-gray-400 hover:text-white hover:border-white/30 transition-all hover:scale-110 active:scale-95"
      title="Megosztás"
    >
      {copied ? <Check size={20} className="text-green-500" /> : <Share2 size={20} />}
    </button>
  )
}
