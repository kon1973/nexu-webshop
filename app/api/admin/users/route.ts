import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { updateUserAdminService } from '@/lib/services/userService'

export async function PATCH(request: Request) {
  const session = await auth()
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { userId, role, isBanned } = body

    if (!userId) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    // Prevent changing own role/ban status
    if (userId === session.user.id) {
      return NextResponse.json({ error: 'You cannot modify your own account' }, { status: 400 })
    }

    const data: any = {}
    if (role && ['user', 'admin'].includes(role)) data.role = role
    if (typeof isBanned === 'boolean') data.isBanned = isBanned

    const updatedUser = await updateUserAdminService(userId, data)

    return NextResponse.json({ success: true, user: updatedUser })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
