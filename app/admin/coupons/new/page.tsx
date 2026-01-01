import { getCategoriesService } from '@/lib/services/categoryService'
import { getProductsService } from '@/lib/services/productService'
import CouponForm from './CouponForm'

export default async function NewCouponPage() {
  const [categories, productsData] = await Promise.all([
    getCategoriesService(),
    getProductsService({ limit: 1000 })
  ])

  return <CouponForm categories={categories} products={productsData.products} />
}
