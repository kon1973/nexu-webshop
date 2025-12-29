import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const CouponSchema = z.object({
  code: z.string().min(1, "Kód megadása kötelező"),
  discountType: z.enum(['PERCENTAGE', 'FIXED']),
  discountValue: z.coerce.number().positive("A kedvezmény értékének pozitívnak kell lennie"),
  usageLimit: z.coerce.number().int().positive().optional().nullable(),
  expiresAt: z.string().optional().nullable(),
  minOrderValue: z.coerce.number().positive().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  productIds: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
})

export type CreateCouponInput = z.infer<typeof CouponSchema>
export type UpdateCouponInput = Partial<CreateCouponInput>

export type ValidateCouponInput = {
  code: string
  cartTotal: number
  cartItems: { id: number }[]
}

export async function getCouponsService() {
  return await prisma.coupon.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      category: true,
      products: true
    }
  })
}

export async function createCouponService(data: CreateCouponInput) {
  return await prisma.coupon.create({
    data: {
      code: data.code.toUpperCase(),
      discountType: data.discountType,
      discountValue: data.discountValue,
      usageLimit: data.usageLimit,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      minOrderValue: data.minOrderValue,
      categoryId: data.categoryId,
      products: data.productIds && data.productIds.length > 0 ? {
        connect: data.productIds.map(id => ({ id: Number(id) }))
      } : undefined,
      isActive: data.isActive ?? true
    },
  })
}

export async function updateCouponService(id: string, data: UpdateCouponInput) {
  return await prisma.coupon.update({
    where: { id },
    data: {
      code: data.code ? data.code.toUpperCase() : undefined,
      discountType: data.discountType,
      discountValue: data.discountValue,
      usageLimit: data.usageLimit,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : (data.expiresAt === null ? null : undefined),
      minOrderValue: data.minOrderValue,
      categoryId: data.categoryId,
      products: data.productIds ? {
        set: data.productIds.map(id => ({ id: Number(id) }))
      } : undefined,
      isActive: data.isActive
    }
  })
}

export async function deleteCouponService(id: string) {
  return await prisma.coupon.delete({
    where: { id }
  })
}

export async function validateCouponService(data: ValidateCouponInput) {
  const { code, cartTotal, cartItems } = data

  const coupon = await prisma.coupon.findUnique({
    where: { code: code.toUpperCase() },
    include: { 
      category: true,
      products: { select: { id: true, name: true } }
    }
  })

  if (!coupon) {
    throw new Error('Érvénytelen kupon')
  }

  if (!coupon.isActive) {
    throw new Error('A kupon már nem aktív')
  }

  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    throw new Error('A kupon felhasználási limitje betelt')
  }

  if (coupon.expiresAt && new Date() > coupon.expiresAt) {
    throw new Error('A kupon lejárt')
  }

  // Check Minimum Order Value
  if (coupon.minOrderValue && cartTotal < coupon.minOrderValue) {
    throw new Error(`A kupon érvényesítéséhez legalább ${coupon.minOrderValue.toLocaleString('hu-HU')} Ft értékben kell vásárolnod.`)
  }

  // Check Category Restriction
  if (coupon.categoryId && cartItems) {
    const productIds = cartItems.map((item) => item.id)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, category: true }
    })

    const hasCategoryItem = products.some((p: { category: string }) => p.category === coupon.category?.name)
    
    if (!hasCategoryItem) {
       throw new Error(`Ez a kupon csak a(z) "${coupon.category?.name}" kategória termékeire érvényes.`)
    }
  }

  // Check Product Restriction
  if (coupon.products.length > 0 && cartItems) {
    const cartProductIds = cartItems.map((item) => item.id)
    const allowedProductIds = coupon.products.map((p: { id: number }) => p.id)
    
    const hasAllowedProduct = cartProductIds.some((id) => allowedProductIds.includes(id))

    if (!hasAllowedProduct) {
      throw new Error(`Ez a kupon csak bizonyos termékekre érvényes: ${coupon.products.map((p: { name: string }) => p.name).join(', ')}`)
    }
  }

  return coupon
}
