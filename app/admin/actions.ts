'use server'

import { auth } from '@/lib/auth'
import { generateProductCatalogPDF } from '@/lib/pdf-catalog'

export type CatalogExportOptions = {
  includeOutOfStock?: boolean
  includeArchived?: boolean
  categories?: string[]
  sortBy?: 'name' | 'price' | 'category'
  title?: string
}

export type CatalogActionResult = {
  success: boolean
  pdfBase64?: string
  fileName?: string
  error?: string
}

export async function exportCatalogAction(options: CatalogExportOptions = {}): Promise<CatalogActionResult> {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'admin') {
      return { 
        success: false, 
        error: 'Nincs jogosultságod ehhez a művelethez.' 
      }
    }

    // Generate PDF
    const pdfBuffer = await generateProductCatalogPDF({
      includeOutOfStock: options.includeOutOfStock ?? false,
      includeArchived: options.includeArchived ?? false,
      categories: options.categories,
      sortBy: options.sortBy ?? 'category',
      title: options.title ?? 'NEXU Termékkatalógus',
    })

    // Convert buffer to base64 for client-side download
    const pdfBase64 = pdfBuffer.toString('base64')
    const fileName = `nexu-katalogus-${new Date().toISOString().split('T')[0]}.pdf`

    return {
      success: true,
      pdfBase64,
      fileName,
    }
  } catch (error) {
    console.error('Catalog export error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Hiba történt a katalógus generálása során',
    }
  }
}

export async function getCategoriesAction(): Promise<{ success: boolean; categories?: string[]; error?: string }> {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'admin') {
      return { 
        success: false, 
        error: 'Nincs jogosultságod ehhez a művelethez.' 
      }
    }

    const { generateCategoryList } = await import('@/lib/pdf-catalog')
    const categories = await generateCategoryList()

    return {
      success: true,
      categories,
    }
  } catch (error) {
    console.error('Get categories error:', error)
    return {
      success: false,
      error: 'Hiba történt a kategóriák lekérése során',
    }
  }
}
