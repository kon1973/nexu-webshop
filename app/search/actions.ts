'use server'

import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'

export type SearchSuggestion = {
  id: number
  name: string
  category: string
  image: string
  price: number
  salePrice: number | null
}

export type PopularSearch = {
  query: string
  count: number
}

// Get search suggestions with caching
export async function getSearchSuggestions(query: string): Promise<SearchSuggestion[]> {
  if (!query || query.length < 2) {
    return []
  }

  const normalizedQuery = query.trim().toLowerCase()
  const terms = normalizedQuery.split(/\s+/).filter(t => t.length > 0)
  
  if (terms.length === 0) return []

  // Fetch candidates
  const candidates = await prisma.product.findMany({
    where: {
      isArchived: false,
      AND: terms.map(term => ({
        OR: [
          { name: { contains: term, mode: 'insensitive' } },
          { category: { contains: term, mode: 'insensitive' } },
          { description: { contains: term, mode: 'insensitive' } },
        ]
      }))
    },
    select: {
      id: true,
      name: true,
      category: true,
      image: true,
      price: true,
      salePrice: true,
      description: true,
    },
    take: 50,
  })

  // Score and sort
  const scoredCandidates = candidates.map(product => {
    let score = 0
    const nameLower = product.name.toLowerCase()
    const categoryLower = product.category.toLowerCase()
    const descLower = product.description.toLowerCase()

    if (nameLower === normalizedQuery) score += 100
    if (nameLower.startsWith(normalizedQuery)) score += 50

    terms.forEach(term => {
      if (nameLower.includes(term)) score += 10
      if (categoryLower.includes(term)) score += 5
      if (descLower.includes(term)) score += 1
    })

    return { ...product, score }
  })

  scoredCandidates.sort((a, b) => b.score - a.score)

  return scoredCandidates.slice(0, 6).map(({ score, description, ...rest }) => rest)
}

// Get popular searches (cached for 10 minutes)
export const getPopularSearches = unstable_cache(
  async (): Promise<PopularSearch[]> => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const searches = await prisma.searchLog.groupBy({
      by: ['query'],
      where: {
        createdAt: { gte: thirtyDaysAgo },
        resultsCount: { gt: 0 } // Only show searches that had results
      },
      _count: { query: true },
      orderBy: { _count: { query: 'desc' } },
      take: 8
    })

    return searches.map(s => ({
      query: s.query,
      count: s._count.query
    }))
  },
  ['popular-searches'],
  { revalidate: 600, tags: ['searches'] }
)

// Get recent searches for a user
export async function getRecentSearches(userId?: string): Promise<string[]> {
  if (!userId) return []

  const searches = await prisma.searchLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 5,
    distinct: ['query'],
    select: { query: true }
  })

  return searches.map(s => s.query)
}

// Log a search (called when user performs a search)
export async function logSearch(query: string, userId?: string, resultsCount?: number) {
  if (!query || query.length < 2) return

  await prisma.searchLog.create({
    data: {
      query: query.trim().toLowerCase(),
      userId,
      resultsCount: resultsCount || 0
    }
  }).catch(err => console.error('Search log error:', err))
}

// Get categories for quick filters
export const getSearchCategories = unstable_cache(
  async () => {
    const categories = await prisma.category.findMany({
      select: { name: true, slug: true, icon: true },
      orderBy: { name: 'asc' }
    })
    return categories
  },
  ['search-categories'],
  { revalidate: 300, tags: ['categories'] }
)
