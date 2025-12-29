import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const CategorySchema = z.object({
  name: z.string().min(1, "Név megadása kötelező"),
  icon: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
})

export type CreateCategoryInput = z.infer<typeof CategorySchema>
export type UpdateCategoryInput = Partial<CreateCategoryInput>

export async function getCategoriesService() {
  return await prisma.category.findMany({
    orderBy: { name: 'asc' }
  })
}

export async function createCategoryService(data: CreateCategoryInput) {
  const slug = data.name.toLowerCase()
    .replace(/&/g, 'and')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')

  return await prisma.category.create({
    data: {
      ...data,
      slug
    }
  })
}

export async function updateCategoryService(id: string, data: UpdateCategoryInput) {
  let slug = undefined
  if (data.name) {
    slug = data.name.toLowerCase()
      .replace(/&/g, 'and')
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
  }

  return await prisma.category.update({
    where: { id },
    data: {
      ...data,
      ...(slug ? { slug } : {})
    }
  })
}

export async function deleteCategoryService(id: string) {
  return await prisma.category.delete({
    where: { id }
  })
}
