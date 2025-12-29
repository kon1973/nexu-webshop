import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/site'

function isIndexable() {
  const isVercelProduction = process.env.VERCEL_ENV === 'production'
  const hasSiteUrl = Boolean(process.env.NEXT_PUBLIC_SITE_URL)
  const isProductionBuild = process.env.NODE_ENV === 'production'
  return isVercelProduction || (isProductionBuild && hasSiteUrl)
}

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl()
  const indexable = isIndexable()

  return {
    rules: indexable ? { userAgent: '*', allow: '/' } : { userAgent: '*', disallow: '/' },
    sitemap: indexable ? new URL('/sitemap.xml', siteUrl).toString() : undefined,
    host: indexable ? siteUrl.toString() : undefined,
  }
}

