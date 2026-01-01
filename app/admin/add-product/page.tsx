import { getCategoriesService } from '@/lib/services/categoryService'
import { getAllAttributesService } from '@/lib/services/attributeService'
import { getSpecificationTemplatesService } from '@/lib/services/specificationService'
import AddProductForm from './AddProductForm'

export const dynamic = 'force-dynamic'

export default async function AddProductPage() {
  const [categories, attributes, specTemplates] = await Promise.all([
    getCategoriesService(),
    getAllAttributesService(),
    getSpecificationTemplatesService()
  ])

  return (
    <AddProductForm 
      initialCategories={categories} 
      initialAttributes={attributes} 
      initialSpecTemplates={specTemplates} 
    />
  )
}


