import { getCategoriesService } from '@/lib/services/categoryService'
import CategoriesClient from './CategoriesClient'

export const dynamic = 'force-dynamic'

export default async function CategoriesPage() {
  const categories = await getCategoriesService()

  return <CategoriesClient initialCategories={categories} />
}
