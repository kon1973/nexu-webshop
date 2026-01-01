import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createProductService, ProductSchema } from '@/lib/services/productService'
import { revalidateTag } from 'next/cache'
import { CACHE_TAGS } from '@/lib/cache'

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Nincs jogosultságod ehhez a művelethez.' }, { status: 403 })
    }

    const body = await request.json()
    const result = ProductSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.issues[0].message },
        { status: 400 }
      )
    }

    const product = await createProductService(result.data)
    
    revalidateTag(CACHE_TAGS.products, {})

    return NextResponse.json({ success: true, product })
  } catch (error) {
    console.error('Product create error:', error)
    return NextResponse.json({ success: false, error: 'Szerver hiba történt.' }, { status: 500 })
  }
}

