import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { Favorite } from '@prisma/client'
import bcrypt from 'bcryptjs'

import { getLoyaltyTier } from '@/lib/loyalty'

export const AddressSchema = z.object({
  name: z.string().min(1, "Név megadása kötelező"),
  label: z.string().optional().nullable(),
  street: z.string().min(1, "Utca megadása kötelező"),
  city: z.string().min(1, "Város megadása kötelező"),
  zipCode: z.string().min(1, "Irányítószám megadása kötelező"),
  country: z.string().default('Magyarország'),
  phoneNumber: z.string().optional().nullable(),
  taxNumber: z.string().optional().nullable(),
  isDefault: z.boolean().default(false),
  isBillingDefault: z.boolean().default(false),
})

export const PasswordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Jelenlegi jelszó megadása kötelező"),
  newPassword: z.string().min(8, "Az új jelszónak legalább 8 karakternek kell lennie"),
})

export type CreateAddressInput = z.infer<typeof AddressSchema> & { userId: string }

export async function getUserProfileService(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: {
      addresses: { orderBy: { createdAt: 'desc' } },
      orders: { 
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { items: true }
      }
    }
  })
}

export async function updateUserProfileService(userId: string, data: { name?: string }) {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.name ? { name: data.name } : {})
    }
  })
}

export async function changePasswordService(userId: string, data: z.infer<typeof PasswordChangeSchema>) {
  const { currentPassword, newPassword } = PasswordChangeSchema.parse(data)

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || !user.password) {
    throw new Error('A felhasználó nem rendelkezik jelszóval (Google fiók?)')
  }

  const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
  if (!isPasswordValid) {
    throw new Error('A jelenlegi jelszó helytelen')
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10)

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  })
}

export async function getUserAddressesService(userId: string) {
  return await prisma.address.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
}

export async function createAddressService(userId: string, data: z.infer<typeof AddressSchema>) {
  const validatedData = AddressSchema.parse(data)
  const { name, label, street, city, zipCode, country, phoneNumber, taxNumber, isDefault, isBillingDefault } = validatedData

  // If setting as default, unset other defaults
  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    })
  }

  if (isBillingDefault) {
    await prisma.address.updateMany({
      where: { userId },
      data: { isBillingDefault: false },
    })
  }

  return await prisma.address.create({
    data: {
      userId,
      name,
      label,
      street,
      city,
      zipCode,
      country,
      phoneNumber,
      taxNumber,
      isDefault,
      isBillingDefault,
    },
  })
}

export async function updateAddressService(userId: string, addressId: string, data: Partial<z.infer<typeof AddressSchema>>) {
  const address = await prisma.address.findUnique({ where: { id: addressId } })
  if (!address || address.userId !== userId) {
    throw new Error('Cím nem található vagy nincs jogosultságod szerkeszteni.')
  }

  const validatedData = AddressSchema.partial().parse(data)

  if (validatedData.isDefault) {
    await prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    })
  }

  if (validatedData.isBillingDefault) {
    await prisma.address.updateMany({
      where: { userId },
      data: { isBillingDefault: false },
    })
  }

  return await prisma.address.update({
    where: { id: addressId },
    data: validatedData,
  })
}

export async function deleteAddressService(userId: string, addressId: string) {
  const address = await prisma.address.findUnique({ where: { id: addressId } })
  if (!address || address.userId !== userId) {
    throw new Error('Cím nem található vagy nincs jogosultságod törölni.')
  }
  
  return await prisma.address.delete({ where: { id: addressId } })
}

export async function updateUserAdminService(userId: string, data: { role?: string, isBanned?: boolean }) {
  return await prisma.user.update({
    where: { id: userId },
    data,
  })
}

export async function getUserFavoritesService(userId: string) {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    include: {
      product: {
        include: {
          variants: {
            select: { id: true },
          },
        },
      },
    },
  })
  return favorites.map((f: any) => f.product)
}

export async function addFavoriteService(userId: string, productId: string) {
  // Check if already exists
  const existing = await prisma.favorite.findUnique({
    where: {
      userId_productId: {
        userId,
        productId: parseInt(productId),
      },
    },
  })

  if (existing) return existing

  return await prisma.favorite.create({
    data: {
      userId,
      productId: parseInt(productId),
    },
  })
}

export async function removeFavoriteService(userId: string, productId: string) {
  return await prisma.favorite.deleteMany({
    where: {
      userId,
      productId: parseInt(productId),
    },
  })
}

export async function getUserLoyaltyService(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { totalSpent: true }
  })

  const totalSpent = user?.totalSpent || 0
  const tier = getLoyaltyTier(totalSpent)

  return {
    totalSpent,
    discountPercentage: tier.discount,
    tierName: tier.name
  }
}
