'use client'

import { useState } from 'react'
import { Share2, Copy, Check, Mail, Facebook, Twitter, MessageCircle, Link2 } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ShareButtonProps {
  title?: string
  text?: string
  url?: string
  className?: string
  variant?: 'button' | 'icon'
  products?: Array<{ id: number; name: string; price: number }>
}

export default function ShareWishlist({
  title = 'NEXU kívánságlista',
  text = 'Nézd meg a kívánságlistámat!',
  url,
  className,
  variant = 'button',
  products = []
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '')
  
  // Generate wishlist URL with product IDs
  const getWishlistUrl = () => {
    if (products.length === 0) return shareUrl
    const ids = products.map(p => p.id).join(',')
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    return `${baseUrl}/wishlist/shared?items=${ids}`
  }

  const generateShareText = () => {
    if (products.length === 0) return text
    const productNames = products.slice(0, 3).map(p => p.name).join(', ')
    const more = products.length > 3 ? ` és még ${products.length - 3} termék` : ''
    return `${text}\n\n${productNames}${more}`
  }

  const handleShare = async (platform: string) => {
    const finalUrl = getWishlistUrl()
    const shareText = generateShareText()

    switch (platform) {
      case 'native':
        if (navigator.share) {
          try {
            await navigator.share({
              title,
              text: shareText,
              url: finalUrl
            })
            toast.success('Megosztva!')
          } catch (err) {
            if ((err as Error).name !== 'AbortError') {
              toast.error('Hiba a megosztás során')
            }
          }
        }
        break

      case 'copy':
        try {
          await navigator.clipboard.writeText(finalUrl)
          setCopied(true)
          toast.success('Link másolva!')
          setTimeout(() => setCopied(false), 2000)
        } catch {
          toast.error('Nem sikerült másolni')
        }
        break

      case 'facebook':
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(finalUrl)}`,
          '_blank',
          'width=600,height=400'
        )
        break

      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(finalUrl)}`,
          '_blank',
          'width=600,height=400'
        )
        break

      case 'whatsapp':
        window.open(
          `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${finalUrl}`)}`,
          '_blank'
        )
        break

      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${shareText}\n\n${finalUrl}`)}`
        break

      case 'messenger':
        window.open(
          `https://www.facebook.com/dialog/send?link=${encodeURIComponent(finalUrl)}&app_id=YOUR_FB_APP_ID`,
          '_blank'
        )
        break
    }

    setIsOpen(false)
  }

  const shareOptions = [
    { id: 'copy', label: 'Link másolása', icon: copied ? Check : Copy, color: 'text-gray-400' },
    { id: 'facebook', label: 'Facebook', icon: Facebook, color: 'text-blue-500' },
    { id: 'twitter', label: 'Twitter/X', icon: Twitter, color: 'text-sky-500' },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: 'text-green-500' },
    { id: 'email', label: 'Email', icon: Mail, color: 'text-purple-400' }
  ]

  // Check if native share is available
  const hasNativeShare = typeof navigator !== 'undefined' && 'share' in navigator

  return (
    <div className="relative">
      <button
        onClick={() => hasNativeShare ? handleShare('native') : setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 transition-all',
          variant === 'button'
            ? 'px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium text-white'
            : 'w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full justify-center text-gray-400 hover:text-white',
          className
        )}
      >
        <Share2 size={variant === 'button' ? 16 : 18} />
        {variant === 'button' && <span>Megosztás</span>}
      </button>

      <AnimatePresence>
        {isOpen && !hasNativeShare && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Share menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute right-0 mt-2 w-64 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
            >
              <div className="p-3 border-b border-white/5">
                <p className="text-sm font-medium text-white">Megosztás</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {products.length > 0 ? `${products.length} termék` : 'Link megosztása'}
                </p>
              </div>

              <div className="p-2">
                {shareOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleShare(option.id)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors group"
                  >
                    <div className={cn(
                      'w-9 h-9 rounded-full bg-white/5 flex items-center justify-center transition-colors group-hover:bg-white/10',
                      option.color
                    )}>
                      <option.icon size={18} />
                    </div>
                    <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                      {option.label}
                    </span>
                    {option.id === 'copy' && copied && (
                      <span className="ml-auto text-xs text-green-400">Másolva!</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Preview */}
              {products.length > 0 && (
                <div className="p-3 border-t border-white/5 bg-white/[0.02]">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Link2 size={12} />
                    <span className="truncate">{getWishlistUrl()}</span>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// Simple share button for product pages
export function ProductShareButton({ 
  productName, 
  productUrl,
  className 
}: { 
  productName: string
  productUrl: string
  className?: string 
}) {
  const handleShare = async () => {
    const shareData = {
      title: `${productName} - NEXU`,
      text: `Nézd meg ezt a terméket: ${productName}`,
      url: productUrl
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          // Fallback to copy
          await navigator.clipboard.writeText(productUrl)
          toast.success('Link másolva!')
        }
      }
    } else {
      await navigator.clipboard.writeText(productUrl)
      toast.success('Link másolva!')
    }
  }

  return (
    <button
      onClick={handleShare}
      className={cn(
        'w-10 h-10 flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-white hover:bg-purple-600 hover:border-purple-500 transition-all',
        className
      )}
      title="Megosztás"
    >
      <Share2 size={18} />
    </button>
  )
}
