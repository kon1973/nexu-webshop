import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { deleteBannerService, updateBannerService } from '@/lib/services/bannerService'
import { z } from 'zod'
import { revalidateTag } from 'next/cache'
import { CACHE_TAGS } from '@/lib/cache'

export async function DELETE(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const session = await auth()
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await deleteBannerService(params.id)

    // revalidateTag(CACHE_TAGS.banners)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete banner' }, { status: 500 })
  }
}

export async function PUT(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const session = await auth()
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const banner = await updateBannerService(params.id, body)

    // revalidateTag(CACHE_TAGS.banners)

    return NextResponse.json(banner)
  } catch (error) {
    console.error('Error updating banner:', error)
    if (error instanceof z.ZodError) {
        return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update banner' }, { status: 500 })
  }
}
