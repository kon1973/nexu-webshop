import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { deleteAddressService, updateAddressService } from '@/lib/services/userService'
import { z } from 'zod'

export async function DELETE(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await deleteAddressService(session.user.id, params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting address:', error)
    return NextResponse.json({ error: 'Failed to delete address' }, { status: 500 })
  }
}

export async function PUT(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const updatedAddress = await updateAddressService(session.user.id, params.id, body)
    return NextResponse.json(updatedAddress)
  } catch (error) {
    console.error('Error updating address:', error)
    if (error instanceof z.ZodError) {
        return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update address' }, { status: 500 })
  }
}

