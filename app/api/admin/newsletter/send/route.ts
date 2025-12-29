import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { sendNewsletterService } from '@/lib/services/newsletterService'
import { z } from 'zod'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const result = await sendNewsletterService(body)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Newsletter send error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Hiba történt a hírlevél küldése során' },
      { status: 500 }
    )
  }
}

