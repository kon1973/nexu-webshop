import { NextResponse } from 'next/server'
import { deleteProductService, updateProductService, ProductSchema } from '@/lib/services/productService'
import { revalidateTag } from 'next/cache'
import { CACHE_TAGS } from '@/lib/cache'

export async function DELETE(_request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params
    const id = Number.parseInt(params.id, 10)

    if (Number.isNaN(id)) return NextResponse.json({ success: false, error: 'Érvénytelen ID.' }, { status: 400 })

    await deleteProductService(id)
    // revalidateTag(CACHE_TAGS.products)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ success: false, error: 'Szerver hiba történt.' }, { status: 500 })
  }
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params
    const id = Number.parseInt(params.id, 10)
    
    if (Number.isNaN(id)) return NextResponse.json({ success: false, error: 'Érvénytelen ID.' }, { status: 400 })

    const body = await request.json()
    
    // Use Zod for validation
    const result = ProductSchema.partial().safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.issues[0].message },
        { status: 400 }
      )
    }

    const updatedProduct = await updateProductService(id, result.data)

    // revalidateTag(CACHE_TAGS.products)

    return NextResponse.json({ success: true, product: updatedProduct })
  } catch (error) {
    console.error('Update error:', error)
    return NextResponse.json({ success: false, error: 'Nem sikerült frissíteni.' }, { status: 500 })
  }
}

