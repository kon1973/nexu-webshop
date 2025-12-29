import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { changePasswordService, PasswordChangeSchema } from '@/lib/services/userService'
import { z } from 'zod'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nem vagy bejelentkezve' }, { status: 401 })
    }

    const body = await req.json()
    
    await changePasswordService(session.user.id, body)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error changing password:', error)
    if (error instanceof z.ZodError) {
        return NextResponse.json({ error: 'Érvénytelen adatok', details: error.issues }, { status: 400 })
    }
    if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Hiba történt a jelszó módosításakor' }, { status: 500 })
  }
}
