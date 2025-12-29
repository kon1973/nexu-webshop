'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createCouponService } from '@/lib/services/couponService'

const CouponSchema = z.object({
  code: z.string().min(1, "Kupon kód kötelező"),
  discountType: z.enum(['PERCENTAGE', 'FIXED']),
  discountValue: z.coerce.number().min(1, "Az értéknek pozitívnak kell lennie"),
  usageLimit: z.coerce.number().optional().nullable(),
  expiresAt: z.string().optional().nullable(),
  minOrderValue: z.coerce.number().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  productIds: z.array(z.string()).optional()
})

export type CouponState = {
  message?: string | null
  errors?: {
    code?: string[]
    discountType?: string[]
    discountValue?: string[]
    usageLimit?: string[]
    minOrderValue?: string[]
    categoryId?: string[]
    productIds?: string[]
  }
}

export async function createCoupon(prevState: CouponState, formData: FormData): Promise<CouponState> {
  const session = await auth()
  if (session?.user?.role !== 'admin') {
    return { message: 'Nincs jogosultságod ehhez a művelethez.' }
  }

  // Extract product IDs from the multi-select (which might send multiple values for the same key 'productIds')
  // FormData.getAll('productIds') handles this.
  // However, in the client component, we might need to ensure the name is correct.
  // Let's assume the client sends 'productIds' as multiple entries or a JSON string.
  // Standard HTML select multiple sends multiple entries with the same name.
  
  const rawProductIds = formData.getAll('productIds')
  
  const validatedFields = CouponSchema.safeParse({
    code: formData.get('code'),
    discountType: formData.get('discountType'),
    discountValue: formData.get('discountValue'),
    usageLimit: formData.get('usageLimit') || null,
    expiresAt: formData.get('expiresAt') || null,
    minOrderValue: formData.get('minOrderValue') || null,
    categoryId: formData.get('categoryId') || null,
    productIds: rawProductIds.map(String)
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Hibás adatok. Kérlek ellenőrizd az űrlapot.'
    }
  }

  const { code, discountType, discountValue, usageLimit, expiresAt, minOrderValue, categoryId, productIds } = validatedFields.data

  try {
    await createCouponService({
      code,
      discountType,
      discountValue,
      usageLimit,
      expiresAt,
      minOrderValue,
      categoryId,
      productIds
    })
  } catch (error) {
    console.error('Coupon create error:', error)
    return { message: 'Hiba történt a kupon létrehozásakor. Lehet, hogy a kód már létezik.' }
  }

  revalidatePath('/admin/coupons')
  redirect('/admin/coupons')
}
