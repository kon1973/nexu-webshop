import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { getUserAddressesService, createAddressService } from '@/lib/services/userService'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const addresses = await getUserAddressesService(session.user.id)
    return NextResponse.json(addresses)
  } catch (error) {
    console.error('Error fetching addresses:', error)
    return NextResponse.json({ error: 'Failed to fetch addresses' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const address = await createAddressService(session.user.id, body)
    return NextResponse.json(address)
  } catch (error) {
    console.error('Error creating address:', error)
    if (error instanceof Error && error.message === 'Validation Error') {
       return NextResponse.json({ error: 'Invalid address data' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create address' }, { status: 500 })
  }
}
