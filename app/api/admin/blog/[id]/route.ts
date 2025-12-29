import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { updateBlogPostService, deleteBlogPostService } from '@/lib/services/blogService'
import { z } from 'zod'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()

    const post = await updateBlogPostService(id, body)

    return NextResponse.json({ success: true, post })
  } catch (error) {
    console.error('Update blog post error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as z.ZodError).issues[0].message }, { status: 400 })
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await params
    await deleteBlogPostService(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete blog post error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    )
  }
}

