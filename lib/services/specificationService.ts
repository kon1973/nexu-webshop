import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const SpecificationTemplateSchema = z.object({
  name: z.string().min(1, "Név megadása kötelező"),
  fields: z.array(z.any()).min(1, "Legalább egy mező kötelező"),
})

export type CreateSpecificationTemplateInput = z.infer<typeof SpecificationTemplateSchema>
export type UpdateSpecificationTemplateInput = Partial<CreateSpecificationTemplateInput>

export async function getSpecificationTemplatesService() {
  return await prisma.specificationTemplate.findMany({
    orderBy: { name: 'asc' },
  })
}

export async function createSpecificationTemplateService(data: CreateSpecificationTemplateInput) {
  return await prisma.specificationTemplate.create({
    data: {
      name: data.name,
      fields: data.fields,
    },
  })
}

export async function updateSpecificationTemplateService(id: string, data: UpdateSpecificationTemplateInput) {
  return await prisma.specificationTemplate.update({
    where: { id },
    data: {
      name: data.name,
      fields: data.fields,
    },
  })
}

export async function deleteSpecificationTemplateService(id: string) {
  return await prisma.specificationTemplate.delete({
    where: { id },
  })
}
