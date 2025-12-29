import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import OrderDetailsClient from './OrderDetailsClient'

export const dynamic = 'force-dynamic'

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
      items: {
        include: {
          product: true
        }
      },
      notes: {
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  })

  if (!order) {
    notFound()
  }

  return <OrderDetailsClient order={order} />
}
