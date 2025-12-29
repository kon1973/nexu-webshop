import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getSpecificationTemplatesService, createSpecificationTemplateService, SpecificationTemplateSchema } from '@/lib/services/specificationService'

export async function GET() {
  try {
    const session = await auth()
    if (session?.user?.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const templates = await getSpecificationTemplatesService()

    return NextResponse.json(templates)
  } catch (error) {
    console.error('[SPEC_TEMPLATES_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (session?.user?.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const result = SpecificationTemplateSchema.safeParse(body)

    if (!result.success) {
      return new NextResponse('Invalid data', { status: 400 })
    }

    const template = await createSpecificationTemplateService(result.data)

    return NextResponse.json(template)
  } catch (error) {
    console.error('[SPEC_TEMPLATES_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
