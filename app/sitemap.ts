import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { getSiteUrl } from '@/lib/site'
import { Product } from '@prisma/client'

function isIndexable() {
  const isVercelProduction = process.env.VERCEL_ENV === 'production'
  const hasSiteUrl = Boolean(process.env.NEXT_PUBLIC_SITE_URL)
  const isProductionBuild = process.env.NODE_ENV === 'production'
  return isVercelProduction || (isProductionBuild && hasSiteUrl)
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!isIndexable()) return []

  const siteUrl = getSiteUrl()
  const now = new Date()

  const products = await prisma.product.findMany({
    select: { id: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
  })

  return [
    {
      url: new URL('/', siteUrl).toString(),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: new URL('/shop', siteUrl).toString(),
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    ...products.map((p) => ({
      url: new URL(`/shop/${p.id}`, siteUrl).toString(),
      lastModified: p.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
  ]
}

