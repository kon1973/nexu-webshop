import { prisma } from '@/lib/prisma'

export async function getSearchSuggestionsService(query: string) {
  if (!query || query.length < 2) {
    return []
  }

  const normalizedQuery = query.trim().toLowerCase()
  const terms = normalizedQuery.split(/\s+/).filter(t => t.length > 0)
  
  if (terms.length === 0) return []

  // 1. Fetch more candidates than needed (e.g. 50) to allow for re-ranking
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
      description: true, // Needed for scoring
    },
    take: 50,
  })

  // 2. Score and sort candidates in memory
  const scoredCandidates = candidates.map(product => {
    let score = 0
    const nameLower = product.name.toLowerCase()
    const categoryLower = product.category.toLowerCase()
    const descLower = product.description.toLowerCase()

    // Exact match bonus
    if (nameLower === normalizedQuery) score += 100
    
    // Starts with bonus
    if (nameLower.startsWith(normalizedQuery)) score += 50

    // Term matching scoring
    terms.forEach(term => {
      // Name matches are most important
      if (nameLower.includes(term)) score += 10
      // Category matches are second
      if (categoryLower.includes(term)) score += 5
      // Description matches are least important
      if (descLower.includes(term)) score += 1
    })

    return { ...product, score }
  })

  // 3. Sort by score descending
  scoredCandidates.sort((a, b) => b.score - a.score)

  // 4. Return top 5, removing internal fields if necessary
  return scoredCandidates.slice(0, 5).map(({ score, description, ...rest }) => rest)
}
