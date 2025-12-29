import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { calculateLoyaltyDiscountAmount } from '@/lib/loyalty'

export const CartItemSchema = z.object({
  id: z.number(),
  variantId: z.string().optional(),
  quantity: z.number().int().positive(),
  selectedOptions: z.record(z.string(), z.string()).optional(),
})

export const CreateOrderSchema = z.object({
  customerName: z.string().min(1, "Név megadása kötelező"),
  customerEmail: z.string().email("Érvénytelen email cím"),
  customerPhone: z.string().min(1, "Telefonszám megadása kötelező"),
  customerAddress: z.string().min(1, "Cím megadása kötelező"),
  billingAddress: z.string().optional().nullable(),
  billingName: z.string().optional().nullable(),
  taxNumber: z.string().optional().nullable(),
  cartItems: z.array(CartItemSchema).min(1, "A kosár üres"),
  couponCode: z.string().optional().nullable(),
  saveAddress: z.boolean().optional(),
  addressData: z.any().optional(),
  paymentMethod: z.enum(['cod', 'stripe']),
  paymentIntentId: z.string().optional(),
})

export type CreateOrderInput = z.infer<typeof CreateOrderSchema> & { userId?: string }

export async function createOrderService(data: CreateOrderInput) {
  const { 
    customerName, 
    customerEmail, 
    customerPhone, 
    customerAddress, 
    billingAddress,
    billingName,
    taxNumber,
    cartItems, 
    couponCode: rawCouponCode, 
    saveAddress, 
    addressData, 
    paymentMethod,
    userId
  } = data

  const couponCode = rawCouponCode ? rawCouponCode.trim().toUpperCase() : null

  const productIds = cartItems.map((item) => item.id)
  const variantIds = cartItems.map(item => item.variantId).filter((id): id is string => !!id)

  // Fetch products
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, price: true, stock: true, image: true },
  })
  
  // Fetch variants
  const variants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      select: { id: true, productId: true, price: true, stock: true, images: true }
  })

  const productById = new Map(products.map((product: any) => [product.id, product]))
  const variantById = new Map(variants.map((variant: any) => [variant.id, variant]))

  // Validate existence
  for (const item of cartItems) {
    if (!productById.has(item.id)) {
      throw new Error('Ismeretlen termék a kosárban.')
    }
    if (item.variantId && !variantById.has(item.variantId)) {
        throw new Error('Ismeretlen variáns a kosárban.')
    }
  }

  // Validate stock (Initial check)
  const outOfStock: string[] = []
  
  for (const item of cartItems) {
      const product = productById.get(item.id)! as any
      
      if (item.variantId) {
          const variant = variantById.get(item.variantId)! as any
          if (variant.stock < item.quantity) {
              outOfStock.push(`${product.name} (Variáns)`)
          }
      } else {
          if (product.stock < item.quantity) {
              outOfStock.push(product.name)
          }
      }
  }

  if (outOfStock.length > 0) {
    throw new Error(`Nincs elegendő készlet a következő termék(ek)ből: ${outOfStock.join(', ')}.`)
  }

  // Calculate totals
  let subtotal = 0
  for (const item of cartItems) {
      const product = productById.get(item.id)! as any
      let price = product.price
      
      if (item.variantId) {
          const variant = variantById.get(item.variantId)! as any
          price = variant.price
      }
      
      subtotal += price * item.quantity
  }

  // Calculate Loyalty Discount
  let loyaltyDiscount = 0
  if (userId) {
      const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { totalSpent: true }
      })
      if (user) {
          loyaltyDiscount = calculateLoyaltyDiscountAmount(subtotal, user.totalSpent)
      }
  }

  const settingsList = await prisma.setting.findMany({
    where: {
      key: { in: ['free_shipping_threshold', 'shipping_fee'] }
    }
  })

  const settingsMap = new Map(settingsList.map((s: any) => [s.key, s.value]))
  const freeShippingThreshold = Number(settingsMap.get('free_shipping_threshold') || 20000)
  const shippingFee = Number(settingsMap.get('shipping_fee') || 2990)
  const shippingCost = subtotal >= freeShippingThreshold ? 0 : shippingFee

  let couponDiscount = 0
  let couponId = null
  
  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } })
    if (coupon && coupon.isActive) {
       if (coupon.usageLimit === null || coupon.usedCount < coupon.usageLimit) {
           if (!coupon.expiresAt || new Date() <= coupon.expiresAt) {
               if (coupon.discountType === 'PERCENTAGE') {
                   couponDiscount = Math.round((subtotal * coupon.discountValue) / 100)
               } else {
                   couponDiscount = coupon.discountValue
               }
               couponId = coupon.id
           }
       }
    }
  }

  const totalDiscount = loyaltyDiscount + couponDiscount
  const totalPrice = Math.max(0, subtotal + shippingCost - totalDiscount)

  // Transaction: Create order, decrement stock, increment coupon usage
  const order = await prisma.$transaction(async (tx: any) => {
    // Decrement stock with atomic check
    for (const item of cartItems) {
      if (item.variantId) {
        const result = await tx.productVariant.updateMany({
          where: {
            id: item.variantId,
            stock: { gte: item.quantity },
          },
          data: { stock: { decrement: item.quantity } },
        })
        if (result.count === 0) {
          throw new Error(`OUT_OF_STOCK_VARIANT:${item.variantId}`)
        }
      } else {
        const result = await tx.product.updateMany({
          where: {
            id: item.id,
            stock: { gte: item.quantity },
          },
          data: { stock: { decrement: item.quantity } },
        })
        if (result.count === 0) {
          throw new Error(`OUT_OF_STOCK_PRODUCT:${item.id}`)
        }
      }
    }

    // Increment coupon usage
    if (couponId) {
      const freshCoupon = await tx.coupon.findUnique({ where: { id: couponId } })
      if (!freshCoupon || !freshCoupon.isActive) throw new Error('INVALID_COUPON')
      if (freshCoupon.usageLimit !== null && freshCoupon.usedCount >= freshCoupon.usageLimit) {
        throw new Error('COUPON_LIMIT_REACHED')
      }

      await tx.coupon.update({
        where: { id: couponId },
        data: { usedCount: { increment: 1 } },
      })
    }

    // Create order
    const newOrder = await tx.order.create({
      data: {
        customerName,
        customerPhone,
        customerEmail,
        customerAddress,
        billingAddress,
        billingName,
        taxNumber,
        totalPrice,
        paymentMethod: paymentMethod,
        status: 'pending', // Default status
        userId: userId,
        couponCode: couponCode || null,
        loyaltyDiscount: loyaltyDiscount,
        discountAmount: couponDiscount,
        items: {
          create: cartItems.map((item) => {
            const product = productById.get(item.id)! as any
            let price = product.price
            if (item.variantId) {
              const variant = variantById.get(item.variantId)! as any
              price = variant.price
            }

            return {
              productId: item.id,
              variantId: item.variantId,
              name: product.name,
              quantity: item.quantity,
              price: price,
              selectedOptions: item.selectedOptions ? (item.selectedOptions as any) : undefined,
            }
          }),
        },
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })

    // Save address if requested
    if (saveAddress && userId && addressData) {
      const { name, street, city, zipCode, country, phoneNumber } = addressData as any
      
      if (name && street && city && zipCode) {
           const existingAddress = await tx.address.findFirst({
              where: {
                  userId: userId,
                  name,
                  street,
                  city,
                  zipCode,
                  country: country || 'Magyarország',
              }
           })

           if (!existingAddress) {
              await tx.address.create({
                data: {
                  userId: userId,
                  name,
                  street,
                  city,
                  zipCode,
                  phoneNumber,
                  country: country || 'Magyarország',
                  isDefault: false 
                }
              })
           }
      }
    }

    return newOrder
  })

  return {
    order,
    subtotal,
    shippingCost,
    totalPrice,
    productById,
    variantById
  }
}

export async function getOrderByIdService(id: string) {
  return await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: { product: true },
      },
    },
  })
}

export async function getOrdersService() {
  return await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: true,
      items: {
        include: {
          product: true
        }
      }
    }
  })
}

export async function updateOrderService(id: string, data: { status: string }) {
  return await prisma.order.update({
    where: { id },
    data: { status: data.status },
  })
}

export async function cancelOrderService(orderId: string, userId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true }
  })

  if (!order) {
    throw new Error('Order not found')
  }

  if (order.userId !== userId) {
    throw new Error('Forbidden')
  }

  if (order.status !== 'pending') {
    throw new Error('Only pending orders can be cancelled')
  }

  await prisma.$transaction(async (tx: any) => {
    // Restore stock
    for (const item of order.items) {
      if (item.variantId) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } }
        })
      } else if (item.productId) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } }
        })
      }
    }

    // Restore coupon usage
    if (order.couponCode) {
      await tx.coupon.update({
        where: { code: order.couponCode },
        data: { usedCount: { decrement: 1 } }
      })
    }

    // Update order status
    await tx.order.update({
      where: { id: orderId },
      data: { status: 'cancelled' }
    })
  })
}
