import 'server-only'
import { prisma } from '@/lib/prisma'

export type InventoryLogReason = 'ORDER_PLACED' | 'ORDER_CANCELLED' | 'MANUAL_ADJUSTMENT' | 'RESTOCK'

interface LogInventoryChangeInput {
  productId: number
  variantId?: string | null
  change: number
  reason: InventoryLogReason
  referenceId?: string
  userId?: string
  tx?: any // Optional transaction client
}

export async function logInventoryChange(input: LogInventoryChangeInput) {
  const { productId, variantId, change, reason, referenceId, userId, tx } = input
  const client = tx || prisma

  await client.inventoryLog.create({
    data: {
      productId,
      variantId,
      change,
      reason,
      referenceId,
      userId,
    },
  })
}

export async function getProductInventoryLogs(productId: number) {
  return await prisma.inventoryLog.findMany({
    where: { productId },
    orderBy: { createdAt: 'desc' },
    include: {
      variant: {
        select: {
          id: true,
          attributes: true
        }
      }
    }
  })
}
