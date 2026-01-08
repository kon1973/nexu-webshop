import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { Setting } from '@prisma/client'

// Cache tags
export const CACHE_TAGS = {
  settings: 'settings',
  categories: 'categories',
  banners: 'banners',
  products: 'products',
}

export const getSettings = unstable_cache(
  async () => {
    const settingsList = await prisma.setting.findMany()
    return settingsList.reduce((acc: Record<string, string>, curr: Setting) => {
      acc[curr.key] = curr.value
      return acc
    }, {} as Record<string, string>)
  },
  ['settings'],
  { tags: [CACHE_TAGS.settings], revalidate: 3600 } // Revalidate every hour as backup
)

export const getCategories = unstable_cache(
  async () => {
    return await prisma.category.findMany({
      orderBy: { name: 'asc' },
    })
  },
  ['categories'],
  { tags: [CACHE_TAGS.categories], revalidate: 3600 }
)

export const getBanners = unstable_cache(
  async () => {
    return await prisma.banner.findMany({
      where: { isActive: true, location: 'HOME' },
      orderBy: { order: 'asc' },
    })
  },
  ['banners-home'],
  { tags: [CACHE_TAGS.banners], revalidate: 3600 }
)

export const getPromoBanner = unstable_cache(
  async () => {
    return await prisma.banner.findFirst({
      where: { isActive: true, location: 'HOME_PROMO' },
      orderBy: { order: 'asc' },
    })
  },
  ['banner-promo'],
  { tags: [CACHE_TAGS.banners], revalidate: 3600 }
)

export const getFeaturedProducts = unstable_cache(
  async () => {
    return await prisma.product.findMany({
      take: 4,
      orderBy: {
        rating: 'desc',
      },
      include: {
        variants: {
          select: { id: true }
        }
      }
    })
  },
  ['featured-products'],
  { tags: [CACHE_TAGS.products], revalidate: 3600 }
)

export const getNewArrivals = unstable_cache(
  async () => {
    return await prisma.product.findMany({
      take: 4,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        variants: {
          select: { id: true }
        }
      }
    })
  },
  ['new-arrivals'],
  { tags: [CACHE_TAGS.products], revalidate: 3600 }
)

export const getLatestBlogPosts = unstable_cache(
  async () => {
    // @ts-ignore
    return await prisma.blogPost.findMany({
      where: { published: true },
      take: 3,
      orderBy: { createdAt: 'desc' },
    })
  },
  ['latest-blog-posts'],
  { revalidate: 3600 }
)

export const getLatestReviews = unstable_cache(
  async () => {
    return await prisma.review.findMany({
      where: { status: 'approved', rating: 5 },
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, image: true }
        }
      }
    })
  },
  ['latest-reviews'],
  { revalidate: 3600 }
)

export const getFlashSaleProducts = unstable_cache(
  async () => {
    const now = new Date()
    return await prisma.product.findMany({
      where: {
        isArchived: false,
        salePrice: { not: null },
        saleEndDate: { gt: now },
        OR: [
          { saleStartDate: null },
          { saleStartDate: { lte: now } }
        ]
      },
      take: 12,
      orderBy: { saleEndDate: 'asc' },
      include: {
        variants: {
          select: { id: true }
        }
      }
    })
  },
  ['flash-sale-products'],
  { tags: [CACHE_TAGS.products], revalidate: 300 } // Revalidate every 5 minutes
)
