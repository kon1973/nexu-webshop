import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import EditCouponForm from './EditCouponForm'

export default async function EditCouponPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const coupon = await prisma.coupon.findUnique({
    where: { id: params.id },
    include: { products: { select: { id: true } } }
  })

  if (!coupon) {
    notFound()
  }

  return <EditCouponForm coupon={coupon} />
}
