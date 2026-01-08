import { prisma } from '@/lib/prisma'
import ShopClient from './ShopClient'
import type { Metadata } from 'next'
import { getProductsService } from '@/lib/services/productService'
import { auth } from '@/lib/auth'
import { unstable_cache } from 'next/cache'
import { getSiteUrl } from '@/lib/site'
import { generateCategoryMetaDescription, normalizeCanonicalUrl } from '@/lib/seo-utils'

// Cache static data that doesn't change often (5 minutes)
const getCachedStaticData = unstable_cache(
  async () => {
    const [banners, categories, brands, priceAgg] = await Promise.all([
      prisma.banner.findMany({
        where: { isActive: true, location: 'SHOP' },
        orderBy: { order: 'asc' },
      }),
      prisma.category.findMany({ orderBy: { name: 'asc' } }),
      prisma.brand.findMany({ where: { isVisible: true }, orderBy: { order: 'asc' } }),
      prisma.product.aggregate({ _max: { price: true } })
    ])
    return { banners, categories, brands, globalMaxPrice: priceAgg._max.price || 2000000 }
  },
  ['shop-static-data'],
  { revalidate: 300, tags: ['shop-static'] } // 5 minutes cache
)

// Cache category lookup with SEO fields
const getCachedCategory = unstable_cache(
  async (categorySlug: string) => {
    return prisma.category.findFirst({
      where: { 
        OR: [
          { slug: categorySlug },
          { name: categorySlug }
        ]
      }
    })
  },
  ['shop-category'],
  { revalidate: 300, tags: ['categories'] }
)

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}): Promise<Metadata> {
  const params = await searchParams
  const category = typeof params.category === 'string' ? params.category : undefined
  const page = typeof params.page === 'string' ? Number(params.page) : 1
  const siteUrl = getSiteUrl()

  // Paginated pages deeper than this should not be indexed
  const MAX_INDEX_PAGE = 5
  const shouldIndex = page <= MAX_INDEX_PAGE

  // Build canonical by preserving a safe allowlist of params and removing tracking params
  const allowedFilterParams = ['category','search','sort','brand','minPrice','maxPrice','inStock','onSale','isNew','minRating','specs','boolSpecs']
  const paramsObj: Record<string, string> = {}
  for (const key of allowedFilterParams) {
    const val = params[key]
    if (typeof val === 'string' && val.trim() !== '') {
      // Exclude page=1 from canonical
      if (key === 'page' && Number(val) <= 1) continue
      paramsObj[key] = val
    }
  }

  // If category-specific metadata is requested
  if (category) {
    const categoryData = await getCachedCategory(category)

    if (categoryData) {
      const title = categoryData.metaTitle || `${categoryData.name} - NEXU Webshop`

      // Use metaDescription if set, otherwise auto-generate
      const description = categoryData.metaDescription ||
        generateCategoryMetaDescription({
          name: categoryData.name,
          description: categoryData.description
        })

      const keywords = categoryData.metaKeywords?.split(',').map((k: string) => k.trim()) ||
        [categoryData.name, 'NEXU', 'webshop']

      // Build canonical retaining only allowed filters + page if >1
      const rawUrl = new URL(`${siteUrl}/shop`)
      rawUrl.search = ''
      if (categoryData.slug) rawUrl.searchParams.set('category', categoryData.slug)
      // preserve page if >1
      if (page > 1) rawUrl.searchParams.set('page', String(page))
      const canonical = normalizeCanonicalUrl(rawUrl.toString(), ['category','page'])

      return {
        title,
        description,
        keywords,
        alternates: { canonical },
        robots: { index: shouldIndex, follow: true },
        openGraph: {
          title,
          description,
          url: canonical,
          siteName: 'NEXU Webshop',
          locale: 'hu_HU',
          type: 'website',
          ...(categoryData.ogImage && { images: [{ url: categoryData.ogImage }] }),
        }
      }
    }
  }

  // Default shop metadata (include search/filter params if present)
  const rawUrl = new URL(`${siteUrl}/shop`)
  // preserve only explicitly allowed params
  for (const key of allowedFilterParams) {
    const v = params[key]
    if (typeof v === 'string' && v.trim() !== '') {
      if (key === 'page') {
        if (Number(v) > 1) rawUrl.searchParams.set('page', v)
      } else {
        rawUrl.searchParams.set(key, v)
      }
    }
  }

  const canonical = normalizeCanonicalUrl(rawUrl.toString(), allowedFilterParams)

  return {
    title: 'Termékek - NEXU Webshop',
    description: 'Böngéssz a legújabb tech termékek között a NEXU Store-ban.',
    alternates: { canonical },
    robots: { index: shouldIndex, follow: true }
  }
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const limit = 24

  const category = typeof params.category === 'string' ? params.category : undefined
  const search = typeof params.search === 'string' ? params.search : undefined
  const sort = typeof params.sort === 'string' ? params.sort : 'newest'
  const minPrice = params.minPrice ? Number(params.minPrice) : undefined
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : undefined
  const inStock = params.inStock === 'true'
  const onSale = params.onSale === 'true'
  const isNew = params.isNew === 'true'
  const minRating = params.minRating ? Number(params.minRating) : undefined
  const brandId = typeof params.brand === 'string' ? params.brand : undefined
  
  // Parse specification filters (format: specs=key1:value1,value2;key2:value3)
  const specsParam = typeof params.specs === 'string' ? params.specs : undefined
  const boolSpecsParam = typeof params.boolSpecs === 'string' ? params.boolSpecs : undefined
  
  // Parse text/range specifications
  const textSpecifications = specsParam ? specsParam.split(';').filter(Boolean).map(part => {
    const [key, valuesStr] = part.split(':')
    return { key: decodeURIComponent(key), values: valuesStr?.split(',').map(v => decodeURIComponent(v)) || [] }
  }).filter(s => s.key && s.values.length > 0) : []
  
  // Parse boolean specifications and convert to values format for service
  const boolSpecifications = boolSpecsParam ? boolSpecsParam.split(';').filter(Boolean).map(part => {
    const [key, valueStr] = part.split(':')
    // Convert boolean to 'Igen'/'Nem' for the service filter
    return { key: decodeURIComponent(key), values: [valueStr === 'true' ? 'Igen' : 'Nem'] }
  }).filter(s => s.key) : []
  
  // Combine all specifications
  const specifications = [...textSpecifications, ...boolSpecifications].length > 0 
    ? [...textSpecifications, ...boolSpecifications] 
    : undefined

  // Fetch static data from cache and products in parallel
  const [staticData, productsData, currentCategory] = await Promise.all([
    getCachedStaticData(),
    getProductsService({
      page,
      limit,
      search,
      category,
      sort,
      minPrice,
      maxPrice,
      isArchived: false,
      inStock,
      onSale,
      isNew,
      minRating,
      brandId,
      specifications
    }),
    category ? getCachedCategory(category) : Promise.resolve(null)
  ])

  const { banners, categories, brands, globalMaxPrice } = staticData

  if (search) {
    const session = await auth()
    prisma.searchLog.create({
      data: {
        query: search,
        userId: session?.user?.id,
        resultsCount: productsData.totalCount
      }
    }).catch(err => console.error('Search log error:', err))
  }

  const siteUrl = getSiteUrl()
  const prevPageUrl = page > 1 ? normalizeCanonicalUrl(`${siteUrl}/shop${currentCategory ? `?category=${currentCategory.slug}&page=${page - 1}` : `?page=${page - 1}`}`, ['category','page']) : null
  const nextPageUrl = page < productsData.totalPages ? normalizeCanonicalUrl(`${siteUrl}/shop${currentCategory ? `?category=${currentCategory.slug}&page=${page + 1}` : `?page=${page + 1}`}`, ['category','page']) : null

  return (
    <>
      {prevPageUrl && <link rel="prev" href={prevPageUrl} />}
      {nextPageUrl && <link rel="next" href={nextPageUrl} />}
      <ShopClient 
        products={productsData.products} 
        banners={banners} 
        totalCount={productsData.totalCount}
        currentPage={page}
        totalPages={productsData.totalPages}
        categories={categories}
        brands={brands}
        globalMaxPrice={globalMaxPrice}
        currentCategory={currentCategory}
      />
    </>
  )
}

