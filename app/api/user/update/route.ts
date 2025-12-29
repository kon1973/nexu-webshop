import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { updateUserProfileService } from '@/lib/services/userService'

export async function PUT(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nem vagy bejelentkezve' }, { status: 401 })
    }

    const { name } = await req.json()

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Érvénytelen név' }, { status: 400 })
    }

    const updatedUser = await updateUserProfileService(session.user.id, { name })

    return NextResponse.json({ success: true, user: updatedUser })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Hiba történt a frissítéskor' }, { status: 500 })
  }
}
