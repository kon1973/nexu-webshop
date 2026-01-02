import { getCategoriesService } from '@/lib/services/categoryService'
import { getAllAttributesService } from '@/lib/services/attributeService'
import { getSpecificationTemplatesService } from '@/lib/services/specificationService'
import { prisma } from '@/lib/prisma'
import AddProductForm from './AddProductForm'

export const dynamic = 'force-dynamic'

export default async function AddProductPage() {
  const [categories, attributes, specTemplates, brands] = await Promise.all([
    getCategoriesService(),
    getAllAttributesService(),
    getSpecificationTemplatesService(),
    prisma.brand.findMany({ where: { isVisible: true }, orderBy: { name: 'asc' } })
  ])

  return (
    <AddProductForm 
      initialCategories={categories} 
      initialAttributes={attributes} 
      initialSpecTemplates={specTemplates}
      initialBrands={brands}
    />
  )
}


