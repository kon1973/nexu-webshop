import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createBlogPostService } from '@/lib/services/blogService'
import { z } from 'zod'

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    
    // Ensure author is set
    if (!body.author) {
      body.author = session.user?.name || 'Admin'
    }

    const post = await createBlogPostService(body)

    return NextResponse.json({ success: true, post })
  } catch (error) {
    console.error('Create blog post error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    )
  }
}

