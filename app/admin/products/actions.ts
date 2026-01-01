'use server'

import { auth } from '@/lib/auth'
import { createProductService, updateProductService, deleteProductService, bulkUpdateProductsService, ProductSchema, CreateProductInput, UpdateProductInput } from '@/lib/services/productService'
import { revalidateTag } from 'next/cache'
import { CACHE_TAGS } from '@/lib/cache'
import { redirect } from 'next/navigation'

export type ActionState = {
  success?: boolean
  error?: string
  fieldErrors?: Record<string, string[]>
}

export async function createProductAction(data: CreateProductInput): Promise<ActionState> {
  try {
    const session = await auth()
    if (session?.user?.role !== 'admin') {
      return { success: false, error: 'Nincs jogosultságod ehhez a művelethez.' }
    }

    const result = ProductSchema.safeParse(data)

    if (!result.success) {
      return {
        success: false,
        error: 'Érvénytelen adatok.',
        fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]>
      }
    }

    await createProductService(result.data)
    
    revalidateTag(CACHE_TAGS.products, {})
    
    return { success: true }
  } catch (error: any) {
    console.error('Product create error:', error)
    return { success: false, error: error.message || 'Szerver hiba történt.' }
  }
}

export async function updateProductAction(id: number, data: UpdateProductInput): Promise<ActionState> {
  try {
    const session = await auth()
    if (session?.user?.role !== 'admin') {
      return { success: false, error: 'Nincs jogosultságod ehhez a művelethez.' }
    }

    const result = ProductSchema.partial().safeParse(data)

    if (!result.success) {
      return {
        success: false,
        error: 'Érvénytelen adatok.',
        fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]>
      }
    }

    await updateProductService(id, result.data)

    revalidateTag(CACHE_TAGS.products, {})

    return { success: true }
  } catch (error: any) {
    console.error('Product update error:', error)
    return { success: false, error: error.message || 'Szerver hiba történt.' }
  }
}

export async function deleteProductAction(id: number): Promise<ActionState> {
  try {
    const session = await auth()
    if (session?.user?.role !== 'admin') {
      return { success: false, error: 'Nincs jogosultságod ehhez a művelethez.' }
    }

    await deleteProductService(id)
    revalidateTag(CACHE_TAGS.products, {})
    return { success: true }
  } catch (error: any) {
    console.error('Product delete error:', error)
    return { success: false, error: error.message || 'Szerver hiba történt.' }
  }
}

export async function toggleProductVisibilityAction(id: number, isArchived: boolean): Promise<ActionState> {
  try {
    const session = await auth()
    if (session?.user?.role !== 'admin') {
      return { success: false, error: 'Nincs jogosultságod ehhez a művelethez.' }
    }

    await updateProductService(id, { isArchived })
    revalidateTag(CACHE_TAGS.products, {})
    return { success: true }
  } catch (error: any) {
    console.error('Product visibility toggle error:', error)
    return { success: false, error: error.message || 'Szerver hiba történt.' }
  }
}

export async function bulkUpdateProductsAction(productUpdates: any[], variantUpdates: any[]): Promise<ActionState> {
  try {
    const session = await auth()
    if (session?.user?.role !== 'admin') {
      return { success: false, error: 'Nincs jogosultságod ehhez a művelethez.' }
    }

    await bulkUpdateProductsService(productUpdates, variantUpdates)
    revalidateTag(CACHE_TAGS.products, {})
    return { success: true }
  } catch (error: any) {
    console.error('Bulk update error:', error)
    return { success: false, error: error.message || 'Szerver hiba történt.' }
  }
}
