import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { bulkUpdateProductsService } from '@/lib/services/productService'
import { revalidateTag } from 'next/cache'
import { CACHE_TAGS } from '@/lib/cache'

export async function PUT(req: Request) {
  try {
    const session = await auth()
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { productUpdates, variantUpdates } = body

    const count = await bulkUpdateProductsService(productUpdates, variantUpdates)

    // revalidateTag(CACHE_TAGS.products)

    return NextResponse.json({ success: true, count })
  } catch (error) {
    console.error('Bulk update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
