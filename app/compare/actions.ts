'use server'

import { prisma } from '@/lib/prisma'

export type CompareProduct = {
  id: number
  name: string
  description: string
  price: number
  image: string
  stock: number
  rating: number
  category: string
  brand: string | null
  specifications: Array<{
    key: string
    value: string
    type: 'text' | 'boolean' | 'header'
  }>
}

type SpecificationItem = {
  key: string
  value: string
  type: 'text' | 'boolean' | 'header'
}

export async function getCompareProducts(ids: number[]): Promise<CompareProduct[]> {
  if (ids.length === 0) return []

  const products = await prisma.product.findMany({
    where: {
      id: { in: ids }
    },
    include: {
      brand: true
    }
  })

  return products.map(p => {
    // Parse specifications from JSON
    let specs: SpecificationItem[] = []
    if (p.specifications) {
      try {
        const rawSpecs = p.specifications as unknown
        if (Array.isArray(rawSpecs)) {
          specs = rawSpecs.map((s: any) => ({
            key: String(s.key || ''),
            value: String(s.value || ''),
            type: (s.type as 'text' | 'boolean' | 'header') || 'text'
          }))
        }
      } catch {
        specs = []
      }
    }

    return {
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      image: p.image,
      stock: p.stock,
      rating: p.rating,
      category: p.category,
      brand: p.brand?.name || null,
      specifications: specs
    }
  })
}

// Get similar products for comparison suggestions
export async function getSimilarProducts(category: string, excludeIds: number[], limit = 4) {
  const products = await prisma.product.findMany({
    where: {
      category: category,
      id: { notIn: excludeIds },
      stock: { gt: 0 }
    },
    select: {
      id: true,
      name: true,
      price: true,
      image: true,
      rating: true,
      category: true
    },
    take: limit,
    orderBy: { rating: 'desc' }
  })

  return products.map(p => ({
    id: p.id,
    name: p.name,
    price: p.price,
    image: p.image,
    rating: p.rating,
    category: p.category
  }))
}
