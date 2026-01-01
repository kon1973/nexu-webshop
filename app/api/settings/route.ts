import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getSettingsService, updateSettingsService, UpdateSettingsSchema } from '@/lib/services/settingsService'
import { z } from 'zod'
import { revalidateTag } from 'next/cache'
import { CACHE_TAGS } from '@/lib/cache'

export async function GET() {
  try {
    const settings = await getSettingsService()
    return NextResponse.json(settings)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (session?.user?.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const result = UpdateSettingsSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    await updateSettingsService(result.data)

    revalidateTag(CACHE_TAGS.settings, {})

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[SETTINGS_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
