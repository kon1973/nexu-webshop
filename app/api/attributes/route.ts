import { NextResponse } from 'next/server'
import { getAllAttributesService, createAttributeService } from '@/lib/services/attributeService'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const attributes = await getAllAttributesService()
    return NextResponse.json(attributes)
  } catch (error) {
    return NextResponse.json({ error: 'Hiba a lekérdezéskor' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const attribute = await createAttributeService(body)

    return NextResponse.json(attribute)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Hiba a létrehozáskor' },
      { status: 500 }
    )
  }
}


export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Hiányzó ID' }, { status: 400 })
    }

    await prisma.attribute.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Hiba a törléskor' }, { status: 500 })
  }
}
