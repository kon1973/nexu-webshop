import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { z } from 'zod'

const brandSchema = z.object({
  name: z.string().min(1),
  logo: z.string().optional(),
  isVisible: z.boolean().optional(),
  order: z.number().optional(),
})

export async function GET() {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { order: 'asc' },
    })
    return NextResponse.json(brands)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const data = brandSchema.parse(body)

    const brand = await prisma.brand.create({
      data: {
        name: data.name,
        logo: data.logo,
        isVisible: data.isVisible ?? true,
        order: data.order ?? 0,
      },
    })

    return NextResponse.json(brand)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create brand' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth()
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    await prisma.brand.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete brand' }, { status: 500 })
  }
}
