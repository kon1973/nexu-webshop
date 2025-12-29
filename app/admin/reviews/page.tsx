import { prisma } from '@/lib/prisma'
import { Star, Trash2, MessageSquare } from 'lucide-react'
import DeleteReviewButton from './DeleteReviewButton'
import ReviewActions from './ReviewActions'
import Link from 'next/link'
import type { Review } from '@prisma/client'

export default async function ReviewsPage() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      product: {
        select: {
          name: true,
          image: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8 font-sans pt-24 selection:bg-purple-500/30">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <MessageSquare className="text-yellow-500" />
            Értékelések kezelése
          </h1>
          <div className="bg-yellow-500/10 text-yellow-400 px-4 py-2 rounded-full font-bold border border-yellow-500/20">
            {reviews.length} értékelés
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {reviews.map((review: Review & { product: { name: string, image: string }, user: { id: string, name: string | null, email: string | null } | null }) => (
            <div
              key={review.id}
              className="bg-[#121212] border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-start md:items-center hover:border-white/10 transition-colors"
            >
              <div className="flex-shrink-0 w-16 h-16 bg-white/5 rounded-xl flex items-center justify-center text-2xl">
                {review.product.image}
              </div>

              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg truncate">{review.product.name}</h3>
                  <span className="text-gray-500 text-sm">•</span>
                  {review.user ? (
                    <Link href={`/admin/users/${review.user.id}`} className="text-blue-400 hover:underline text-sm">
                      {review.userName}
                    </Link>
                  ) : (
                    <span className="text-gray-400 text-sm">{review.userName}</span>
                  )}
                </div>
                
                <div className="flex items-center gap-1 text-yellow-500 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill={i < review.rating ? 'currentColor' : 'none'}
                      className={i < review.rating ? '' : 'text-gray-700 opacity-30'}
                    />
                  ))}
                  <span className="text-gray-500 text-xs ml-2">
                    {new Date(review.createdAt).toLocaleDateString('hu-HU', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                <p className="text-gray-300 text-sm leading-relaxed">{review.text}</p>
              </div>

              <div className="flex-shrink-0 flex flex-col gap-2 items-end">
                <ReviewActions id={review.id} status={review.status} />
                <DeleteReviewButton id={review.id} />
              </div>
            </div>
          ))}

          {reviews.length === 0 && (
            <div className="text-center py-12 text-gray-500 bg-[#121212] border border-white/5 rounded-2xl">
              Még nincsenek értékelések.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
