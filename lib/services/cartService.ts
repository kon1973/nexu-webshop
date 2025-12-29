import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { calculateLoyaltyDiscountAmount } from '@/lib/loyalty'
import { Setting } from '@prisma/client'

export const CartItemSchema = z.object({
  id: z.number(),
  variantId: z.string().optional(),
  quantity: z.number().int().positive(),
  selectedOptions: z.record(z.string(), z.string()).optional(),
  name: z.string().optional(), // For validation messages
})

export const SyncCartSchema = z.object({
  items: z.array(CartItemSchema),
})

export async function calculateCartTotalsService(items: z.infer<typeof CartItemSchema>[], userId?: string, couponCode?: string) {
  const productIds = items.map((item) => item.id)
  const variantIds = items.map((item) => item.variantId).filter((id): id is string => !!id)

  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, price: true, salePrice: true, category: true },
  })

  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    select: { id: true, price: true, salePrice: true, productId: true },
  })

  const productMap = new Map(products.map((p: any) => [p.id, p]))
  const variantMap = new Map(variants.map((v: any) => [v.id, v]))

  let subtotal = 0
  const cartItemsWithPrice = []

  for (const item of items) {
    const product: any = productMap.get(item.id)
    if (!product) continue

    let price = product.salePrice || product.price
    
    if (item.variantId) {
      const variant: any = variantMap.get(item.variantId)
      if (variant) {
        price = variant.salePrice || variant.price
      }
    }
    
    subtotal += price * item.quantity
    cartItemsWithPrice.push({ ...item, price, product })
  }

  let discount = 0
  let loyaltyDiscount = 0

  // Loyalty Discount
  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { totalSpent: true } })
    if (user) {
      loyaltyDiscount = calculateLoyaltyDiscountAmount(subtotal, user.totalSpent)
    }
  }

  // Coupon Discount
  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode.toUpperCase() },
      include: { category: true, products: true }
    })

    if (coupon && coupon.isActive && (!coupon.expiresAt || coupon.expiresAt > new Date())) {
       let applicableSubtotal = subtotal
       
       // Filter applicable items if category/product restricted
       if (coupon.categoryId || coupon.products.length > 0) {
          applicableSubtotal = 0
          for (const item of cartItemsWithPrice) {
             let isApplicable = true
             if (coupon.categoryId && item.product.category !== coupon.category?.name) isApplicable = false
             if (coupon.products.length > 0 && !coupon.products.some((p: any) => p.id === item.id)) isApplicable = false
             
             if (isApplicable) {
                applicableSubtotal += item.price * item.quantity
             }
          }
       }

       if (coupon.discountType === 'PERCENTAGE') {
          discount = Math.round(applicableSubtotal * (coupon.discountValue / 100))
       } else {
          discount = coupon.discountValue
       }
    }
  }

  let total = subtotal - loyaltyDiscount - discount
  if (total < 0) total = 0
  
  // Fetch shipping settings
  const settingsList = await prisma.setting.findMany({
    where: {
      key: { in: ['free_shipping_threshold', 'shipping_fee'] }
    }
  })
  const settings = settingsList.reduce((acc: Record<string, string>, curr: Setting) => {
    acc[curr.key] = curr.value
    return acc
  }, {} as Record<string, string>)

  const freeShippingThreshold = settings.free_shipping_threshold ? parseFloat(settings.free_shipping_threshold) : 20000
  const shippingFee = settings.shipping_fee ? parseFloat(settings.shipping_fee) : 2990

  const shippingCost = subtotal >= freeShippingThreshold ? 0 : shippingFee
  
  return {
    subtotal,
    loyaltyDiscount,
    couponDiscount: discount,
    shippingCost,
    total: total + shippingCost
  }
}

export async function syncCartService(userId: string, items: z.infer<typeof CartItemSchema>[]) {
  // Find or create cart
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: true },
  })

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: { items: true },
    })
  }

  // Transaction to update items
  await prisma.$transaction(async (tx: any) => {
    // Clear existing items
    await tx.cartItem.deleteMany({
      where: { cartId: cart.id },
    })

    // Add new items
    if (items.length > 0) {
      await tx.cartItem.createMany({
        data: items.map((item) => ({
          cartId: cart.id,
          productId: item.id,
          variantId: item.variantId,
          quantity: item.quantity,
          selectedOptions: item.selectedOptions || null,
        })),
      })
    }
  })

  return { success: true }
}

export async function validateCartService(items: z.infer<typeof CartItemSchema>[]) {
  if (!Array.isArray(items) || items.length === 0) {
    return { valid: true, errors: [] }
  }

  const productIds = items.map((item) => item.id)
  const variantIds = items.map((item) => item.variantId).filter((id): id is string => !!id)

  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, stock: true, name: true },
  })

  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    select: { id: true, stock: true, product: { select: { name: true } } },
  })

  const productMap = new Map(products.map((p: any) => [p.id, p]))
  const variantMap = new Map(variants.map((v: any) => [v.id, v]))

  const errors: string[] = []

  for (const item of items) {
    if (item.variantId) {
      const variant: any = variantMap.get(item.variantId)
      if (!variant) {
        errors.push(`A(z) ${item.name || 'termék'} variációja már nem elérhető.`)
      } else if (variant.stock < item.quantity) {
        errors.push(`A(z) ${variant.product.name} variációjából csak ${variant.stock} db van készleten.`)
      }
    } else {
      const product: any = productMap.get(item.id)
      if (!product) {
        errors.push(`A(z) ${item.name || 'termék'} már nem elérhető.`)
      } else if (product.stock < item.quantity) {
        errors.push(`A(z) ${product.name} termékből csak ${product.stock} db van készleten.`)
      }
    }
  }

  return { 
    valid: errors.length === 0, 
    errors 
  }
}

export async function getCartService(userId: string) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { 
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              salePrice: true,
              saleStartDate: true,
              saleEndDate: true,
              salePercentage: true,
              images: true, // Product has images array
              // image: true, // Product model usually has images array, not single image? 
              // Let's check schema. Product has images String[].
              // But the route code used item.product.image. Maybe it meant images[0]?
              // Or maybe I misread schema.
              // Schema: images String[] @default([])
              // So item.product.image is invalid if it's not in schema.
              // Wait, the route code had:
              // select: { ... image: true ... }
              // If schema doesn't have image, this would fail.
              // Maybe schema has image?
              // Let's check schema again.
              // model Product { ... images String[] ... }
              // I don't see `image` field.
              // Maybe the route code was wrong or I missed something.
              // I will assume images[0] is what we want.
              category: true,
              stock: true,
            }
          },
          variant: {
            select: {
              id: true,
              price: true,
              salePrice: true,
              saleStartDate: true,
              saleEndDate: true,
              salePercentage: true,
              images: true,
              stock: true,
            }
          }
        }
      }
    }
  })

  if (!cart) return []

  // Transform to CartItem format
  const items = cart.items.map((item: any) => {
    const now = new Date()
    let price = item.product.price
    let originalPrice: number | undefined = undefined
    // Use first image from array
    let image = item.product.images && item.product.images.length > 0 ? item.product.images[0] : '/placeholder.png'
    let stock = item.product.stock

    // Check product sale
    const isProductOnSale = item.product.salePrice && 
      (!item.product.saleStartDate || item.product.saleStartDate <= now) && 
      (!item.product.saleEndDate || item.product.saleEndDate >= now)

    if (isProductOnSale && item.product.salePrice) {
        price = item.product.salePrice
        originalPrice = item.product.price
    }

    if (item.variant) {
      // Reset to variant base
      price = item.variant.price
      originalPrice = undefined
      
      if (item.variant.images && item.variant.images.length > 0) {
        image = item.variant.images[0]
      }
      stock = item.variant.stock

      // Check variant sale
      const isVariantOnSale = item.variant.salePrice &&
          (!item.variant.saleStartDate || item.variant.saleStartDate <= now) &&
          (!item.variant.saleEndDate || item.variant.saleEndDate >= now)
      
      if (isVariantOnSale && item.variant.salePrice) {
          price = item.variant.salePrice
          originalPrice = item.variant.price
      }
    }

    return {
      id: item.productId,
      variantId: item.variantId || undefined,
      name: item.product.name,
      price: price,
      originalPrice: originalPrice,
      image: image,
      category: item.product.category ? item.product.category.name : undefined, // Assuming category is object
      quantity: item.quantity,
      stock: stock,
      selectedOptions: item.selectedOptions ? (item.selectedOptions as Record<string, string>) : undefined,
    }
  })

  return items
}
