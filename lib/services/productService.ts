import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { z } from 'zod'

export const ProductSchema = z.object({
  name: z.string().min(1, "Név megadása kötelező"),
  category: z.string().min(1, "Kategória megadása kötelező"),
  price: z.coerce.number().int().positive("Az árnak pozitív egész számnak kell lennie"),
  stock: z.coerce.number().int().nonnegative().default(10),
  salePrice: z.coerce.number().int().positive().optional().nullable(),
  salePercentage: z.coerce.number().min(0).max(100).optional().nullable(),
  saleStartDate: z.string().optional().nullable(),
  saleEndDate: z.string().optional().nullable(),
  description: z.string().default(''),
  fullDescription: z.string().default(''),
  image: z.string().default('\u{1f4e6}'),
  images: z.array(z.string()).default([]),
  variants: z.array(z.any()).default([]),
  specifications: z.array(z.any()).default([]),
  options: z.array(z.any()).default([]),
  isArchived: z.boolean().default(false),
})

export type CreateProductInput = z.infer<typeof ProductSchema>
export type UpdateProductInput = Partial<CreateProductInput>

export type GetProductsParams = {
  page?: number
  limit?: number
  search?: string
  category?: string
  stock?: 'low' | 'out' | string
  sort?: string
  minPrice?: number
  maxPrice?: number
  isArchived?: boolean
  inStock?: boolean
  onSale?: boolean
  isNew?: boolean
  minRating?: number
}

export async function getProductsService(params: GetProductsParams) {
  const { page = 1, limit = 20, search, category, stock, sort, minPrice, maxPrice, isArchived, inStock, onSale, isNew, minRating } = params
  const skip = (page - 1) * limit

  const searchTerms = search ? search.trim().split(/\s+/).filter(t => t.length > 0) : []

  // Calculate the date 30 days ago for "new products" filter
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const where: Prisma.ProductWhereInput = {
    AND: [
      searchTerms.length > 0
        ? {
            AND: searchTerms.map(term => ({
              OR: [
                { name: { contains: term, mode: 'insensitive' } },
                { description: { contains: term, mode: 'insensitive' } },
                { category: { contains: term, mode: 'insensitive' } },
              ]
            }))
          }
        : {},
      category ? { category } : {},
      stock === 'low' ? { stock: { lt: 5, gt: 0 } } : {},
      stock === 'out' ? { stock: 0 } : {},
      minPrice ? { price: { gte: minPrice } } : {},
      maxPrice ? { price: { lte: maxPrice } } : {},
      isArchived !== undefined ? { isArchived } : {},
      // New filters
      inStock ? { stock: { gt: 0 } } : {},
      onSale ? { 
        salePrice: { not: null },
        OR: [
          { saleEndDate: null },
          { saleEndDate: { gte: new Date() } }
        ]
      } : {},
      isNew ? { createdAt: { gte: thirtyDaysAgo } } : {},
      minRating ? { rating: { gte: minRating } } : {},
    ],
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' }
  
  if (sort === 'price_asc' || sort === 'price-asc') orderBy = { price: 'asc' }
  if (sort === 'price_desc' || sort === 'price-desc') orderBy = { price: 'desc' }
  if (sort === 'name_asc' || sort === 'name-asc') orderBy = { name: 'asc' }
  if (sort === 'name_desc' || sort === 'name-desc') orderBy = { name: 'desc' }
  if (sort === 'rating') orderBy = { rating: 'desc' }

  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      take: limit,
      skip,
      include: {
        variants: true,
        options: true,
        _count: { select: { reviews: true } }
      }
    }),
    prisma.product.count({ where }),
  ])

  return {
    products,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  }
}

export async function getProductByIdService(id: number, onlyApprovedReviews = false) {
  return await prisma.product.findUnique({
    where: { id },
    include: {
      variants: true,
      options: true,
      reviews: {
        where: onlyApprovedReviews ? { status: 'approved' } : {},
        include: { user: { select: { name: true, image: true } } },
        orderBy: { createdAt: 'desc' }
      }
    }
  })
}

export async function createProductService(data: CreateProductInput) {
  const { name, category, price, stock, salePrice, salePercentage, saleStartDate, saleEndDate, description, fullDescription, image, images, variants, specifications, isArchived } = data

  // Calculate stock from variants if they exist
  let finalStock = stock
  if (variants && variants.length > 0) {
    finalStock = variants.reduce((sum: number, v: any) => sum + (Number(v.stock) || 0), 0)
  }

  // Calculate options from variants
  const optionsMap = new Map<string, Set<string>>()
  for (const v of variants) {
    if (v.attributes && typeof v.attributes === 'object') {
      for (const [key, value] of Object.entries(v.attributes)) {
         if (typeof value === 'string') {
           if (!optionsMap.has(key)) {
             optionsMap.set(key, new Set())
           }
           optionsMap.get(key)!.add(value)
         }
      }
    }
  }

  const optionsData = Array.from(optionsMap.entries()).map(([name, valuesSet]) => ({
    name,
    values: Array.from(valuesSet)
  }))

  return await prisma.product.create({
    data: {
      name,
      category,
      price,
      stock: finalStock,
      salePrice: salePrice || null,
      salePercentage: salePercentage || null,
      saleStartDate: saleStartDate ? new Date(saleStartDate) : null,
      saleEndDate: saleEndDate ? new Date(saleEndDate) : null,
      description,
      fullDescription,
      image,
      images,
      specifications,
      isArchived,
      rating: 5.0,
      options: {
        create: optionsData
      },
      variants: {
        create: variants.map((v: any) => ({
          attributes: v.attributes,
          price: Number(v.price),
          salePrice: v.salePrice ? Number(v.salePrice) : null,
          salePercentage: v.salePercentage ? Number(v.salePercentage) : null,
          saleStartDate: v.saleStartDate ? new Date(v.saleStartDate) : null,
          saleEndDate: v.saleEndDate ? new Date(v.saleEndDate) : null,
          stock: Number(v.stock),
          sku: v.sku || null,
          images: v.image ? [v.image] : [],
        }))
      }
    },
  })
}

export async function updateProductService(id: number, data: UpdateProductInput) {
  const { name, category, price, stock, salePrice, salePercentage, saleStartDate, saleEndDate, description, fullDescription, image, images, variants, specifications, isArchived } = data

  // Calculate stock from variants if they exist
  let finalStock = stock
  if (variants && variants.length > 0) {
    finalStock = variants.reduce((sum: number, v: any) => sum + (Number(v.stock) || 0), 0)
  }

  return await prisma.$transaction(async (tx: any) => {
    // 1. Update basic product info
    const product = await tx.product.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(category ? { category } : {}),
        ...(price ? { price } : {}),
        ...(finalStock !== undefined ? { stock: finalStock } : {}),
        salePrice: salePrice ?? null,
        salePercentage: salePercentage ?? null,
        saleStartDate: saleStartDate ? new Date(saleStartDate) : null,
        saleEndDate: saleEndDate ? new Date(saleEndDate) : null,
        ...(description ? { description } : {}),
        ...(fullDescription ? { fullDescription } : {}),
        ...(image ? { image } : {}),
        ...(images ? { images } : {}),
        ...(isArchived !== undefined ? { isArchived } : {}),
        ...(specifications ? { specifications } : {}),
      },
    })

    // 2. Handle variants if provided
    if (variants) {
      // Get existing variant IDs
      const existingVariants = await tx.productVariant.findMany({
        where: { productId: id },
        select: { id: true }
      })
      const existingVariantIds = existingVariants.map((v: any) => v.id)

      // IDs present in the request
      const incomingVariantIds = variants
        .filter((v: any) => v.id)
        .map((v: any) => v.id)

      // Determine variants to delete
      const variantsToDelete = existingVariantIds.filter((vid: any) => !incomingVariantIds.includes(vid))
      if (variantsToDelete.length > 0) {
        await tx.productVariant.deleteMany({
          where: { id: { in: variantsToDelete } }
        })
      }

      // Upsert/Create variants
      for (const v of variants) {
        const variantData = {
          attributes: v.attributes,
          price: Number(v.price),
          salePrice: v.salePrice ? Number(v.salePrice) : null,
          salePercentage: v.salePercentage ? Number(v.salePercentage) : null,
          saleStartDate: v.saleStartDate ? new Date(v.saleStartDate) : null,
          saleEndDate: v.saleEndDate ? new Date(v.saleEndDate) : null,
          stock: Number(v.stock),
          sku: v.sku || null,
          images: v.image ? [v.image] : [],
        }

        if (v.id && existingVariantIds.includes(v.id)) {
          // Update existing
          await tx.productVariant.update({
            where: { id: v.id },
            data: variantData
          })
        } else {
          // Create new
          await tx.productVariant.create({
            data: {
              ...variantData,
              productId: id
            }
          })
        }
      }

      // 3. Update ProductOptions based on variants
      // Collect all attributes from variants
      const optionsMap = new Map<string, Set<string>>()
      for (const v of variants) {
        if (v.attributes && typeof v.attributes === 'object') {
          for (const [key, value] of Object.entries(v.attributes)) {
             if (typeof value === 'string') {
               if (!optionsMap.has(key)) {
                 optionsMap.set(key, new Set())
               }
               optionsMap.get(key)!.add(value)
             }
          }
        }
      }

      // Delete existing options
      await tx.productOption.deleteMany({ where: { productId: id } })

      // Create new options
      const optionsData = Array.from(optionsMap.entries()).map(([name, valuesSet]) => ({
        name,
        values: Array.from(valuesSet)
      }))

      if (optionsData.length > 0) {
        await tx.productOption.createMany({
          data: optionsData.map(opt => ({
            productId: id,
            name: opt.name,
            values: opt.values
          }))
        })
      }
    }

    return product
  })
}

export async function deleteProductService(id: number) {
  return await prisma.product.delete({ where: { id } })
}

export async function bulkUpdateProductsService(productUpdates: any[], variantUpdates: any[]) {
  const transactions = []

  if (Array.isArray(productUpdates)) {
    transactions.push(...productUpdates.map((update: any) => {
      const { id, ...data } = update
      return prisma.product.update({
        where: { id },
        data,
      })
    }))
  }

  if (Array.isArray(variantUpdates)) {
    transactions.push(...variantUpdates.map((update: any) => {
      const { id, ...data } = update
      return prisma.productVariant.update({
        where: { id },
        data,
      })
    }))
  }

  if (transactions.length > 0) {
    await prisma.$transaction(transactions)
  }

  return transactions.length
}
