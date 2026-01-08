import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { getSiteUrl } from '@/lib/site'
import { getVariantUrl } from '@/lib/seo-utils'

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

  // Fetch products with variants and slug
  const products = await prisma.product.findMany({
    where: { isArchived: false },
    select: { 
      id: true, 
      slug: true,
      updatedAt: true,
      variants: {
        where: { isActive: true, stock: { gt: 0 } },
        select: { id: true, updatedAt: true }
      }
    },
    orderBy: { updatedAt: 'desc' },
  })

  // Fetch categories
  const categories = await prisma.category.findMany({
    select: { slug: true, updatedAt: true }
  })

  // Fetch blog posts
  const blogPosts = await prisma.blogPost.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' }
  })

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
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
      priority: 0.9,
    },
    {
      url: new URL('/blog', siteUrl).toString(),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: new URL('/about', siteUrl).toString(),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: new URL('/contact', siteUrl).toString(),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: new URL('/faq', siteUrl).toString(),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: new URL('/aszf', siteUrl).toString(),
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: new URL('/privacy', siteUrl).toString(),
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  // Category pages
  const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
    url: new URL(`/shop?category=${c.slug}`, siteUrl).toString(),
    lastModified: c.updatedAt,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  // Product pages (using slug if available)
  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: new URL(`/shop/${p.slug || p.id}`, siteUrl).toString(),
    lastModified: p.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Product variant pages (use slug if available)
  const variantPages: MetadataRoute.Sitemap = products.flatMap((p) => {
    const productUrl = new URL(`/shop/${p.slug || p.id}`, siteUrl).toString()
    return p.variants.map((v) => ({
      url: getVariantUrl(productUrl, v),
      lastModified: v.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))
  })

  // Blog post pages
  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: new URL(`/blog/${post.slug}`, siteUrl).toString(),
    lastModified: post.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [
    ...staticPages,
    ...categoryPages,
    ...productPages,
    ...variantPages,
    ...blogPages,
  ]
}

