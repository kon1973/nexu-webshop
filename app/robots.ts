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

  if (!indexable) {
    return {
      rules: { userAgent: '*', disallow: '/' },
    }
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/checkout/',
          '/success/',
          '/profile/',
          '/orders/',
          '/login',
          '/register',
          '/forgot-password',
          '/reset-password',
          '/verify-email',
          '/*?variant=*', // Let canonical handle variants
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/checkout/',
          '/success/',
        ],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
    ],
    sitemap: [
      new URL('/sitemap.xml', siteUrl).toString(),
      new URL('/api/sitemap-images', siteUrl).toString(),
    ],
    host: siteUrl.toString(),
  }
}

