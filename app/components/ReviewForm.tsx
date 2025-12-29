'use client'

import { useState, useEffect } from 'react'
import { Star, Send, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function ReviewForm({ productId }: { productId: number }) {
  const { data: session } = useSession()
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [text, setText] = useState('')
  const [userName, setUserName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (session?.user?.name) {
      setUserName(session.user.name)
    }
  }, [session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) return toast.error('Kérlek adj csillagos értékelést is!')

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, userName, rating, text }),
      })

      if (res.ok) {
        toast.success('Köszönjük a véleményed!')
        setText('')
        setRating(0)
        setUserName('')
        router.refresh()
      } else {
        toast.error('Hiba történt a beküldéskor.')
      }
    } catch (error) {
      console.error(error)
      toast.error('Hálózati hiba.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-[#121212] border border-white/5 rounded-2xl p-6 mb-8 shadow-lg shadow-purple-500/5">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">Írj véleményt</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs text-gray-500 mb-1 block uppercase font-bold">Neved</label>
          <input
            required
            type="text"
            placeholder="Pl. Nagy Anna"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 outline-none transition-colors"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block uppercase font-bold">Értékelés</label>
          <div className="flex gap-1 items-center">
            {[1, 2, 3, 4, 5].map((star) => {
              const activeStar = (hoverRating || rating) >= star
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                  aria-label={`${star} csillag`}
                >
                  <Star
                    size={32}
                    fill={activeStar ? 'currentColor' : 'none'}
                    className={activeStar ? 'text-yellow-500' : 'text-gray-600'}
                  />
                </button>
              )
            })}
            <span className="ml-3 text-gray-400 text-sm font-medium">
              {rating > 0 ? `${rating} csillag` : 'Válassz...'}
            </span>
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block uppercase font-bold">Vélemény</label>
          <textarea
            required
            rows={3}
            placeholder="Mi tetszett? Mi nem? Oszd meg mássokkal is!"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 outline-none transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-white text-black hover:bg-purple-600 hover:text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95 w-full justify-center"
        >
          {isSubmitting ? <Loader2 className="animate-spin" /> : <Send size={18} />}
          {isSubmitting ? 'Küldés...' : 'Vélemény beküldése'}
        </button>
      </form>
    </div>
  )
}

