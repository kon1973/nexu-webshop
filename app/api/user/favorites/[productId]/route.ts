import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function DELETE(
  req: Request,
  props: { params: Promise<{ productId: string }> }
) {
  const params = await props.params;
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const productId = Number(params.productId)

  await prisma.favorite.deleteMany({
    where: {
      userId: user.id,
      productId: productId,
    },
  })

  return NextResponse.json({ success: true })
}
