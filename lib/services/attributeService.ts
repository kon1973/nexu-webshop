import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const AttributeSchema = z.object({
  name: z.string().min(1, "Név megadása kötelező"),
  values: z.array(z.string()).min(1, "Legalább egy érték megadása kötelező"),
})

export type AttributeInput = z.infer<typeof AttributeSchema>

export async function getAllAttributesService() {
  return await prisma.attribute.findMany({
    orderBy: { name: 'asc' },
  })
}

export async function createAttributeService(data: AttributeInput) {
  const validated = AttributeSchema.parse(data)

  const existing = await prisma.attribute.findUnique({
    where: { name: validated.name },
  })

  if (existing) {
    throw new Error('Már létezik attribútum ezzel a névvel')
  }

  return await prisma.attribute.create({
    data: validated,
  })
}

export async function updateAttributeService(id: string, data: Partial<AttributeInput>) {
  const validated = AttributeSchema.partial().parse(data)

  if (validated.name) {
    const existing = await prisma.attribute.findFirst({
      where: {
        name: validated.name,
        NOT: { id },
      },
    })

    if (existing) {
      throw new Error('Már létezik attribútum ezzel a névvel')
    }
  }

  return await prisma.attribute.update({
    where: { id },
    data: validated,
  })
}

export async function deleteAttributeService(id: string) {
  return await prisma.attribute.delete({
    where: { id },
  })
}
