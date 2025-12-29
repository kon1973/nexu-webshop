import { prisma } from '@/lib/prisma'
import UserListClient from './UserListClient'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { orders: true },
      },
    },
  })

  return <UserListClient users={users} />
}
