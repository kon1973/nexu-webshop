import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { headers } from 'next/headers'
import { enforceRateLimit, rateLimitExceededResponse } from '@/lib/enforceRateLimit'

export async function POST(request: Request) {
  const ip = (await headers()).get('x-forwarded-for') ?? '127.0.0.1'
  const rl = await enforceRateLimit(ip, 5, 60, 'auth.login')
  if (!rl.success) return rateLimitExceededResponse(undefined, rl.reset)

  const body = await request.json()
  const { password } = body

  const ADMIN_PASSWORD = 'admin123'

  if (password === ADMIN_PASSWORD) {
    const cookieStore = await cookies()
    cookieStore.set('admin_token', 'true', {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24,
    })

    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ success: false }, { status: 401 })
}

