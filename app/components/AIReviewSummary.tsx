'use client'

import { useState, useEffect, useTransition } from 'react'
import { Star, ThumbsUp, ThumbsDown, Sparkles, TrendingUp, MessageSquare, Loader2 } from 'lucide-react'
import { getAIReviewSummary } from '@/lib/actions/user-actions'
import { motion, AnimatePresence } from 'framer-motion'

interface AIReviewSummaryProps {
  productId: number
  productName: string
}

interface ReviewSummary {
  avgRating: number
  totalReviews: number
  ratingDistribution: Record<number, number>
  summary: string
  pros: string[]
  cons: string[]
  sentiment: 'positive' | 'mixed' | 'negative'
  recommendationRate: number
}

export default function AIReviewSummary({ productId, productName }: AIReviewSummaryProps) {
  const [summary, setSummary] = useState<ReviewSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasSummary, setHasSummary] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    startTransition(async () => {
      setIsLoading(true)
      const result = await getAIReviewSummary(productId)
      if (result.success && result.hasSummary && result.summary) {
        setSummary(result.summary as ReviewSummary)
        setHasSummary(true)
      }
      setIsLoading(false)
    })
  }, [productId])

  if (isLoading || isPending) {
    return (
      <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl p-6 border border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
          </div>
          <span className="text-gray-400">AI elemzi az értékeléseket...</span>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-white/10 rounded w-3/4" />
          <div className="h-4 bg-white/10 rounded w-1/2" />
        </div>
      </div>
    )
  }

  if (!hasSummary || !summary) {
    return null
  }

  const sentimentColors = {
    positive: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
    mixed: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30',
    negative: 'from-red-500/20 to-pink-500/20 border-red-500/30'
  }

  const sentimentIcons = {
    positive: '😊',
    mixed: '😐',
    negative: '😞'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br ${sentimentColors[summary.sentiment]} rounded-2xl p-6 border`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white">AI Értékelés Összefoglaló</h3>
            <p className="text-sm text-gray-400">{summary.totalReviews} vélemény alapján</p>
          </div>
        </div>
        <div className="text-3xl">{sentimentIcons[summary.sentiment]}</div>
      </div>

      {/* Rating Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Average Rating */}
        <div className="bg-black/20 rounded-xl p-4">
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-white">{summary.avgRating}</div>
            <div>
              <div className="flex gap-1 mb-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={18}
                    className={star <= Math.round(summary.avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-400">{summary.totalReviews} értékelés</p>
            </div>
          </div>
        </div>

        {/* Recommendation Rate */}
        <div className="bg-black/20 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <span className="text-gray-300">Ajánlási arány</span>
          </div>
          <div className="relative h-3 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${summary.recommendationRate}%` }}
              transition={{ duration: 1, delay: 0.3 }}
              className="absolute h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
            />
          </div>
          <p className="text-right text-sm text-gray-400 mt-1">{summary.recommendationRate}% ajánlja</p>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="bg-black/20 rounded-xl p-4 mb-6">
        <h4 className="text-sm font-medium text-gray-400 mb-3">Értékelés eloszlás</h4>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = summary.ratingDistribution[rating] || 0
            const percentage = summary.totalReviews > 0 ? (count / summary.totalReviews) * 100 : 0
            return (
              <div key={rating} className="flex items-center gap-3">
                <span className="text-sm text-gray-400 w-8">{rating}★</span>
                <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, delay: rating * 0.1 }}
                    className="h-full bg-yellow-500 rounded-full"
                  />
                </div>
                <span className="text-sm text-gray-500 w-12 text-right">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* AI Summary */}
      {summary.summary && (
        <div className="bg-black/20 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <MessageSquare className="w-5 h-5 text-purple-400 mt-0.5" />
            <p className="text-gray-300 leading-relaxed">{summary.summary}</p>
          </div>
        </div>
      )}

      {/* Pros and Cons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pros */}
        {summary.pros.length > 0 && (
          <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
            <div className="flex items-center gap-2 mb-3">
              <ThumbsUp className="w-4 h-4 text-green-400" />
              <span className="font-medium text-green-400">Pozitívumok</span>
            </div>
            <ul className="space-y-2">
              {summary.pros.map((pro, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-2 text-sm text-gray-300"
                >
                  <span className="text-green-400 mt-1">•</span>
                  {pro}
                </motion.li>
              ))}
            </ul>
          </div>
        )}

        {/* Cons */}
        {summary.cons.length > 0 && (
          <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/20">
            <div className="flex items-center gap-2 mb-3">
              <ThumbsDown className="w-4 h-4 text-red-400" />
              <span className="font-medium text-red-400">Negatívumok</span>
            </div>
            <ul className="space-y-2">
              {summary.cons.map((con, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-2 text-sm text-gray-300"
                >
                  <span className="text-red-400 mt-1">•</span>
                  {con}
                </motion.li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* AI Badge */}
      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
        <Sparkles className="w-3 h-3" />
        <span>AI által generált összefoglaló</span>
      </div>
    </motion.div>
  )
}
