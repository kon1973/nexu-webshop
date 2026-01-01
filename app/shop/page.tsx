import { prisma } from '@/lib/prisma'
import ShopClient from './ShopClient'
import type { Metadata } from 'next'
import { getProductsService } from '@/lib/services/productService'
import { auth } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Termékek',
  description: 'Böngéssz a legújabb tech termékek között a NEXU Store-ban.',
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

  let currentCategory = null
  if (category) {
    currentCategory = await prisma.category.findFirst({
      where: { name: category }
    })
  }

  const [productsData, banners, categories, priceAgg] = await Promise.all([
    getProductsService({
      page,
      limit,
      search,
      category,
      sort,
      minPrice,
      maxPrice,
      isArchived: false
    }),
    prisma.banner.findMany({
      where: { isActive: true, location: 'SHOP' },
      orderBy: { order: 'asc' },
    }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.product.aggregate({ _max: { price: true } })
  ])

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

  const globalMaxPrice = priceAgg._max.price || 2000000

  return (
    <ShopClient 
      products={productsData.products} 
      banners={banners} 
      totalCount={productsData.totalCount}
      currentPage={page}
      totalPages={productsData.totalPages}
      categories={categories}
      globalMaxPrice={globalMaxPrice}
      currentCategory={currentCategory}
    />
  )
}

