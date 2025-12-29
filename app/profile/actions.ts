'use server'

import { auth } from '@/lib/auth'
import { 
  updateUserProfileService, 
  getUserAddressesService, 
  createAddressService, 
  updateAddressService, 
  deleteAddressService,
  changePasswordService,
  AddressSchema,
  PasswordChangeSchema
} from '@/lib/services/userService'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

export async function updateProfile(data: { name: string }) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Nem vagy bejelentkezve')
  }

  await updateUserProfileService(session.user.id, data)
  revalidatePath('/profile')
}

export async function changePassword(data: z.infer<typeof PasswordChangeSchema>) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Nem vagy bejelentkezve')
  }

  await changePasswordService(session.user.id, data)
}

export async function getAddresses() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Nem vagy bejelentkezve')
  }

  return await getUserAddressesService(session.user.id)
}

export async function createAddress(data: z.infer<typeof AddressSchema>) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Nem vagy bejelentkezve')
  }

  await createAddressService(session.user.id, data)
  revalidatePath('/profile')
}

export async function updateAddress(addressId: string, data: Partial<z.infer<typeof AddressSchema>>) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Nem vagy bejelentkezve')
  }

  await updateAddressService(session.user.id, addressId, data)
  revalidatePath('/profile')
}

export async function deleteAddress(addressId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Nem vagy bejelentkezve')
  }

  await deleteAddressService(session.user.id, addressId)
  revalidatePath('/profile')
}
