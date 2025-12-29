import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { deleteSpecificationTemplateService, updateSpecificationTemplateService, SpecificationTemplateSchema } from '@/lib/services/specificationService'

export async function DELETE(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const session = await auth()
    if (session?.user?.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    await deleteSpecificationTemplateService(params.id)

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('[SPEC_TEMPLATE_DELETE]', error)
    return new NextResponse('Internal Error', { status: 500 })
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
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const result = SpecificationTemplateSchema.partial().safeParse(body)

    if (!result.success) {
      return new NextResponse('Invalid data', { status: 400 })
    }

    const template = await updateSpecificationTemplateService(params.id, result.data)

    return NextResponse.json(template)
  } catch (error) {
    console.error('[SPEC_TEMPLATE_PUT]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
