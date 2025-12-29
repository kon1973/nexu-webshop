import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { updateAttributeService, deleteAttributeService } from '@/lib/services/attributeService'
import { z } from 'zod'

export async function PATCH(
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
    const attribute = await updateAttributeService(params.id, body)

    return NextResponse.json(attribute)
  } catch (error) {
    console.error('Attribute update error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update attribute' },
      { status: 500 }
    )
  }
}

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

    await deleteAttributeService(params.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete attribute' }, { status: 500 })
  }
}

