import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import UserDetailsClient from './UserDetailsClient'

export const dynamic = 'force-dynamic'

export default async function UserDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      addresses: true,
      orders: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
            items: {
                include: { product: true }
            }
        }
      },
      reviews: {
        orderBy: { createdAt: 'desc' },
        include: { product: true }
      },
      _count: {
        select: { orders: true, reviews: true }
      }
    }
  })

  if (!user) {
    notFound()
  }

  return <UserDetailsClient user={user} />
}
