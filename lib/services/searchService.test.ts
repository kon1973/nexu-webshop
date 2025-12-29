import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getSearchSuggestionsService } from './searchService'
import { prisma } from '@/lib/prisma'

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    product: {
      findMany: vi.fn(),
    },
  },
}))

describe('getSearchSuggestionsService', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should return empty array for short query', async () => {
    const result = await getSearchSuggestionsService('a')
    expect(result).toEqual([])
    expect(prisma.product.findMany).not.toHaveBeenCalled()
  })

  it('should rank exact match higher than partial match', async () => {
    const mockProducts = [
      { id: 1, name: 'Tok Samsung telefonhoz', category: 'Kiegészítők', description: '...', price: 1000, image: 'img1.jpg' },
      { id: 2, name: 'Samsung Galaxy S24', category: 'Telefonok', description: '...', price: 300000, image: 'img2.jpg' },
    ]

    vi.mocked(prisma.product.findMany).mockResolvedValue(mockProducts as any)

    const result = await getSearchSuggestionsService('Samsung')

    expect(result).toHaveLength(2)
    expect(result[0].id).toBe(2) // Samsung Galaxy S24 should be first (starts with bonus)
    expect(result[1].id).toBe(1)
  })

  it('should rank name match higher than description match', async () => {
    const mockProducts = [
      { id: 1, name: 'Olcsó Tok', category: 'Kiegészítők', description: 'Jó Samsung telefonhoz', price: 1000, image: 'img1.jpg' },
      { id: 2, name: 'Samsung Töltő', category: 'Kiegészítők', description: 'Gyors töltés', price: 5000, image: 'img2.jpg' },
    ]

    vi.mocked(prisma.product.findMany).mockResolvedValue(mockProducts as any)

    const result = await getSearchSuggestionsService('Samsung')

    expect(result[0].id).toBe(2) // Name match (10 points) > Description match (1 point)
  })
})
