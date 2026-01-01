'use server'

import { auth } from '@/lib/auth'
import { createCategoryService, updateCategoryService, deleteCategoryService, CategorySchema, CreateCategoryInput, UpdateCategoryInput } from '@/lib/services/categoryService'
import { revalidateTag } from 'next/cache'
import { CACHE_TAGS } from '@/lib/cache'

export type ActionState = {
  success?: boolean
  error?: string
  fieldErrors?: Record<string, string[]>
}

export async function createCategoryAction(data: CreateCategoryInput): Promise<ActionState> {
  try {
    const session = await auth()
    if (session?.user?.role !== 'admin') {
      return { success: false, error: 'Nincs jogosultságod ehhez a művelethez.' }
    }

    const result = CategorySchema.safeParse(data)

    if (!result.success) {
      return {
        success: false,
        error: 'Érvénytelen adatok.',
        fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]>
      }
    }

    await createCategoryService(result.data)
    revalidateTag(CACHE_TAGS.categories, {})
    return { success: true }
  } catch (error: any) {
    console.error('Category create error:', error)
    return { success: false, error: error.message || 'Szerver hiba történt.' }
  }
}

export async function updateCategoryAction(id: string, data: UpdateCategoryInput): Promise<ActionState> {
  try {
    const session = await auth()
    if (session?.user?.role !== 'admin') {
      return { success: false, error: 'Nincs jogosultságod ehhez a művelethez.' }
    }

    const result = CategorySchema.partial().safeParse(data)

    if (!result.success) {
      return {
        success: false,
        error: 'Érvénytelen adatok.',
        fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]>
      }
    }

    await updateCategoryService(id, result.data)
    revalidateTag(CACHE_TAGS.categories, {})
    return { success: true }
  } catch (error: any) {
    console.error('Category update error:', error)
    return { success: false, error: error.message || 'Szerver hiba történt.' }
  }
}

export async function deleteCategoryAction(id: string): Promise<ActionState> {
  try {
    const session = await auth()
    if (session?.user?.role !== 'admin') {
      return { success: false, error: 'Nincs jogosultságod ehhez a művelethez.' }
    }

    await deleteCategoryService(id)
    revalidateTag(CACHE_TAGS.categories, {})
    return { success: true }
  } catch (error: any) {
    console.error('Category delete error:', error)
    return { success: false, error: error.message || 'Szerver hiba történt.' }
  }
}
