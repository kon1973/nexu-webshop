import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { setRateLimitSetting } from '@/lib/settingsService'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user || session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await req.json()
    if (!Array.isArray(body)) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })

    const ip = (req.headers.get('x-forwarded-for') as string | null) ?? undefined

    for (const item of body) {
      if (!item.key || !item.cfg) continue
      await setRateLimitSetting(item.key, item.cfg, { id: session.user.id, email: session.user.email ?? undefined }, ip)
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error' }, { status: 500 })
  }
}
