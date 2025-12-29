import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createReviewService, ReviewSchema } from '@/lib/services/reviewService'

export async function POST(request: Request) {
  try {
    const session = await auth()
    const body = await request.json()
    
    const result = ReviewSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error.issues[0].message }, { status: 400 })
    }
    
    if (!session?.user?.email || !session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Jelentkezz be az értékeléshez!' }, { status: 401 })
    }

    const newReview = await createReviewService({
      ...result.data,
      userId: session.user.id,
      userEmail: session.user.email
    })
    
    return NextResponse.json({ success: true, review: newReview, message: 'Értékelés elküldve! Jóváhagyás után jelenik meg.' })
  } catch (error: any) {
    console.error('Review create error:', error)
    if (error.message === 'Már értékelted ezt a terméket.') {
        return NextResponse.json({ success: false, error: error.message }, { status: 409 })
    }
    if (error.message === 'Csak megvásárolt és kiszállított terméket értékelhetsz.') {
        return NextResponse.json({ success: false, error: error.message }, { status: 403 })
    }
    return NextResponse.json({ success: false, error: error.message || 'Hiba történt.' }, { status: 500 })
  }
}

