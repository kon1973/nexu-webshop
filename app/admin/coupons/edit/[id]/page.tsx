import { notFound } from 'next/navigation'
import EditCouponForm from './EditCouponForm'
import { getCouponByIdService } from '@/lib/services/couponService'
import { getCategoriesService } from '@/lib/services/categoryService'
import { getProductsService } from '@/lib/services/productService'

export default async function EditCouponPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  
  const [coupon, categories, productsData] = await Promise.all([
    getCouponByIdService(params.id),
    getCategoriesService(),
    getProductsService({ limit: 1000 })
  ])

  if (!coupon) {
    notFound()
  }

  return <EditCouponForm coupon={coupon} categories={categories} products={productsData.products} />
}
