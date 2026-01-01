import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getBannersService, createBannerService } from '@/lib/services/bannerService'
import { z } from 'zod'
import { revalidateTag } from 'next/cache'
import { CACHE_TAGS } from '@/lib/cache'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const location = searchParams.get('location') || undefined

  try {
    const banners = await getBannersService(location)
    return NextResponse.json(banners)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const banner = await createBannerService(body)

    revalidateTag(CACHE_TAGS.banners, {})

    return NextResponse.json(banner)
  } catch (error) {
    console.error('Error creating banner:', error)
    if (error instanceof z.ZodError) {
        return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create banner' }, { status: 500 })
  }
}
