import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email')

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  try {
    await prisma.newsletterSubscriber.delete({
      where: { email },
    })
    
    // Redirect to success page
    return NextResponse.redirect(new URL('/newsletter/unsubscribe/success', req.url))
  } catch (error) {
    return NextResponse.json({ error: 'Subscriber not found' }, { status: 404 })
  }
}
