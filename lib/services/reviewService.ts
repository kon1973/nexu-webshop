import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const ReviewSchema = z.object({
  productId: z.number().or(z.string().transform(Number)),
  userName: z.string().min(1),
  rating: z.number().min(1).max(5),
  text: z.string().optional(),
})

export type CreateReviewInput = z.infer<typeof ReviewSchema> & { userId: string, userEmail: string }

export async function createReviewService(data: CreateReviewInput) {
  const { productId, userName, rating, text, userId, userEmail } = data

  const user = await prisma.user.findUnique({ where: { email: userEmail } })
  if (!user) {
    throw new Error('Felhasználó nem található.')
  }

  // Check for duplicate review
  const existingReview = await prisma.review.findFirst({
    where: {
      userId: user.id,
      productId: productId,
    },
  })

  if (existingReview) {
    throw new Error('Már értékelted ezt a terméket.')
  }

  // Verify purchase
  const hasPurchased = await prisma.order.findFirst({
    where: {
      userId: user.id,
      status: { in: ['shipped', 'completed'] },
      items: {
        some: {
          productId: productId
        }
      }
    }
  })

  if (!hasPurchased) {
    throw new Error('Csak megvásárolt és kiszállított terméket értékelhetsz.')
  }

  const newReview = await prisma.review.create({
    data: {
      productId: productId,
      userName: user.name || userName, // Prefer user's real name
      rating: rating,
      text: text || '',
      userId: user.id,
      status: 'pending',
    },
  })

  return newReview
}

export async function getProductReviewsService(productId: number) {
  return await prisma.review.findMany({
    where: { 
      productId,
      status: 'approved'
    },
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          name: true,
          image: true
        }
      }
    }
  })
}
