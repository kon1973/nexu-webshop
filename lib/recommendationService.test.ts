// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getRelatedProductsService } from './services/recommendationService'

// Mock server-only
vi.mock('server-only', () => { return {} })

// Mock prisma
vi.mock('@/lib/prisma', () => {
  return {
    prisma: {
      orderItem: {
        findMany: vi.fn(),
        groupBy: vi.fn(),
      },
      product: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
      },
    },
  }
})

import { prisma } from '@/lib/prisma'

describe('getRelatedProductsService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns fallback products when no orders found', async () => {
    // Mock no orders found
    vi.mocked(prisma.orderItem.findMany).mockResolvedValue([])
    
    // Mock product for fallback
    vi.mocked(prisma.product.findUnique).mockResolvedValue({ id: 1, category: 'Tech' } as any)
    
    // Mock fallback search
    const fallbackProducts = [{ id: 2, name: 'Fallback' }]
    vi.mocked(prisma.product.findMany).mockResolvedValue(fallbackProducts as any)

    const result = await getRelatedProductsService(1)
    
    expect(result).toEqual(fallbackProducts)
    expect(prisma.product.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        category: 'Tech',
        id: { notIn: [1] }
      })
    }))
  })

  it('returns co-occurring products when orders exist', async () => {
    // 1. Mock orders containing product 1
    vi.mocked(prisma.orderItem.findMany).mockResolvedValue([
      { orderId: 'order1' },
      { orderId: 'order2' }
    ] as any)

    // 2. Mock co-occurring products
    // Product 2 appeared 2 times, Product 3 appeared 1 time
    vi.mocked(prisma.orderItem.groupBy).mockResolvedValue([
      { productId: 2, _count: { productId: 2 } },
      { productId: 3, _count: { productId: 1 } }
    ] as any)

    // 3. Mock fetching product details
    const products = [
      { id: 2, name: 'Product 2' },
      { id: 3, name: 'Product 3' }
    ]
    vi.mocked(prisma.product.findMany).mockResolvedValue(products as any)

    const result = await getRelatedProductsService(1, 2)

    expect(result).toHaveLength(2)
    expect(result[0].id).toBe(2)
    expect(result[1].id).toBe(3)
  })
})
