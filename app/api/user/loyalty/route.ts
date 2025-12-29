import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { getUserLoyaltyService } from '@/lib/services/userService'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ totalSpent: 0, discountPercentage: 0, tierName: 'Bronz' })
  }

  try {
    const loyalty = await getUserLoyaltyService(session.user.id)
    return NextResponse.json(loyalty)
  } catch (error) {
    console.error('Error fetching loyalty:', error)
    return NextResponse.json({ error: 'Failed to fetch loyalty' }, { status: 500 })
  }
}
