import 'server-only'
import { prisma } from '@/lib/prisma'
import { sendPriceDropEmail } from '@/lib/email'

export async function checkPriceDrops() {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

  // Find products that started sale in the last hour
  // OR were updated in the last hour (if saleStartDate is not used)
  const productsOnSale = await prisma.product.findMany({
    where: {
      isArchived: false,
      salePrice: { not: null },
      OR: [
        {
            saleStartDate: {
                gte: oneHourAgo,
                lte: new Date()
            }
        },
        {
            // If saleStartDate is null or old, but the product was updated recently (maybe salePrice was added)
            updatedAt: { gte: oneHourAgo },
            saleStartDate: null
        }
      ]
    },
    include: {
        favoritedBy: {
            include: {
                user: true
            }
        }
    }
  })

  let emailsSent = 0

  for (const product of productsOnSale) {
      // Double check if it's actually on sale right now
      const now = new Date()
      const isSaleActive = (!product.saleStartDate || product.saleStartDate <= now) &&
                           (!product.saleEndDate || product.saleEndDate >= now)

      if (!isSaleActive) continue

      for (const favorite of product.favoritedBy) {
          if (favorite.user.email) {
              await sendPriceDropEmail(favorite.user.email, product)
              emailsSent++
          }
      }
  }

  return { emailsSent, productsCount: productsOnSale.length }
}
