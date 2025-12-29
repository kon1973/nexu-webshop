import { prisma } from '@/lib/prisma'
import ProductListClient from './ProductListClient'
import { getProductsService } from '@/lib/services/productService'

export const dynamic = 'force-dynamic'

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const limit = 20
  const search = typeof params.search === 'string' ? params.search : undefined
  const category = typeof params.category === 'string' ? params.category : undefined
  const stock = typeof params.stock === 'string' ? params.stock : undefined

  const [productsData, categories] = await Promise.all([
    getProductsService({
      page,
      limit,
      search,
      category,
      stock
    }),
    prisma.category.findMany({
      orderBy: { name: 'asc' },
    })
  ])

  return (
    <ProductListClient 
      products={productsData.products} 
      categories={categories} 
      totalCount={productsData.totalCount}
      currentPage={page}
      totalPages={productsData.totalPages}
    />
  )
}


