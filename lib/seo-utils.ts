/**
 * SEO Utilities for automatic meta description and title generation
 */

/**
 * Generate an SEO-friendly meta description from product data
 */
export function generateProductMetaDescription(product: {
  name: string
  description?: string | null
  price: number
  salePrice?: number | null
  category?: string
  brand?: { name: string } | null
  stock?: number
  specifications?: Array<{ key: string; value: string | boolean }> | null
}): string {
  const parts: string[] = []
  
  // Brand and name
  if (product.brand?.name) {
    parts.push(`${product.brand.name} ${product.name}`)
  } else {
    parts.push(product.name)
  }
  
  // Price info
  const price = product.salePrice || product.price
  if (product.salePrice && product.salePrice < product.price) {
    const discount = Math.round((1 - product.salePrice / product.price) * 100)
    parts.push(`most ${discount}% kedvezménnyel ${price.toLocaleString('hu-HU')} Ft`)
  } else {
    parts.push(`${price.toLocaleString('hu-HU')} Ft`)
  }
  
  // Stock status
  if (product.stock !== undefined) {
    if (product.stock > 10) {
      parts.push('raktáron')
    } else if (product.stock > 0) {
      parts.push('limitált készlet')
    }
  }
  
  // Add key specs (max 2)
  if (product.specifications && Array.isArray(product.specifications)) {
    const keySpecs = product.specifications
      .filter(s => typeof s.value === 'string' && s.value.length < 30)
      .slice(0, 2)
      .map(s => `${s.key}: ${s.value}`)
    
    if (keySpecs.length > 0) {
      parts.push(keySpecs.join(', '))
    }
  }
  
  // Fallback to description if too short
  let description = parts.join(' | ')
  
  if (description.length < 80 && product.description) {
    const cleanDesc = product.description.replace(/<[^>]*>/g, '').trim()
    if (cleanDesc.length > 0) {
      description = `${description}. ${cleanDesc}`
    }
  }
  
  // Truncate to 160 chars
  if (description.length > 160) {
    description = description.slice(0, 157) + '...'
  }
  
  return description
}

/**
 * Generate SEO-friendly meta title
 */
export function generateProductMetaTitle(product: {
  name: string
  category?: string
  brand?: { name: string } | null
}): string {
  const parts: string[] = []
  
  parts.push(product.name)
  
  if (product.brand?.name && !product.name.toLowerCase().includes(product.brand.name.toLowerCase())) {
    parts.push(product.brand.name)
  }
  
  // Title is auto-suffixed by Next.js template, so keep it under 50 chars
  let title = parts.join(' - ')
  if (title.length > 50) {
    title = product.name.slice(0, 50)
  }
  
  return title
}

/**
 * Generate category meta description
 */
export function generateCategoryMetaDescription(category: {
  name: string
  description?: string | null
  productCount?: number
}): string {
  let description = `Böngészd a ${category.name} kategória termékeit a NEXU Store-ban.`
  
  if (category.productCount && category.productCount > 0) {
    description += ` ${category.productCount} termék elérhető.`
  }
  
  if (category.description) {
    const cleanDesc = category.description.replace(/<[^>]*>/g, '').trim()
    if (cleanDesc.length > 0) {
      description += ` ${cleanDesc}`
    }
  }
  
  description += ' Ingyenes szállítás 30.000 Ft felett, gyors kiszállítás.'
  
  if (description.length > 160) {
    description = description.slice(0, 157) + '...'
  }
  
  return description
}

/**
 * Calculate SEO score for a product
 */
export function calculateProductSeoScore(product: {
  name: string
  description?: string | null
  metaTitle?: string | null
  metaDescription?: string | null
  slug?: string | null
  images?: string[]
  gtin?: string | null
  sku?: string | null
}): { score: number; issues: string[] } {
  const issues: string[] = []
  let score = 0
  const maxScore = 100
  
  // Title (20 points)
  if (product.metaTitle) {
    if (product.metaTitle.length >= 30 && product.metaTitle.length <= 60) {
      score += 20
    } else {
      score += 10
      issues.push('Meta title hossza nem optimális (30-60 karakter)')
    }
  } else if (product.name.length >= 20) {
    score += 10
    issues.push('Nincs egyedi meta title megadva')
  } else {
    issues.push('Rövid terméknév, nincs meta title')
  }
  
  // Description (25 points)
  if (product.metaDescription) {
    if (product.metaDescription.length >= 120 && product.metaDescription.length <= 160) {
      score += 25
    } else {
      score += 15
      issues.push('Meta description hossza nem optimális (120-160 karakter)')
    }
  } else if (product.description && product.description.length >= 50) {
    score += 10
    issues.push('Nincs egyedi meta description')
  } else {
    issues.push('Hiányzik a termék leírás és meta description')
  }
  
  // Slug (15 points)
  if (product.slug) {
    if (product.slug.length >= 10 && product.slug.length <= 60) {
      score += 15
    } else {
      score += 8
      issues.push('Slug hossza nem optimális')
    }
  } else {
    issues.push('Nincs SEO-barát slug beállítva')
  }
  
  // Images (15 points)
  if (product.images && product.images.length > 0) {
    score += Math.min(15, product.images.length * 5)
    if (product.images.length < 3) {
      issues.push('Kevés termékkép (ajánlott: min. 3)')
    }
  } else {
    issues.push('Nincsenek termékképek')
  }
  
  // Product identifiers (15 points)
  if (product.gtin) score += 8
  else issues.push('Nincs GTIN/EAN kód')
  
  if (product.sku) score += 7
  else issues.push('Nincs SKU kód')
  
  // Description quality (10 points)
  if (product.description) {
    const wordCount = product.description.split(/\s+/).length
    if (wordCount >= 50) {
      score += 10
    } else if (wordCount >= 20) {
      score += 5
      issues.push('Rövid termékleírás (ajánlott: min. 50 szó)')
    } else {
      issues.push('Nagyon rövid termékleírás')
    }
  }
  
  return {
    score: Math.min(maxScore, score),
    issues
  }
}

/**
 * Normalize canonical URL by preserving only allowed query params (default: none)
 */
export function normalizeCanonicalUrl(rawUrl: string, allowedParams: string[] = []): string {
  try {
    const u = new URL(rawUrl)
    const params = new URLSearchParams()
    for (const name of allowedParams) {
      if (u.searchParams.has(name)) {
        params.set(name, u.searchParams.get(name) || '')
      }
    }
    u.search = params.toString()
    // Remove trailing ? if empty
    return u.toString()
  } catch (err) {
    return rawUrl
  }
}

/**
 * Generate SEO-friendly slug from text
 * Converts Hungarian characters and removes special chars
 */
export function generateSlug(text: string): string {
  const hungarianMap: Record<string, string> = {
    'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ö': 'o', 'ő': 'o',
    'ú': 'u', 'ü': 'u', 'ű': 'u',
    'Á': 'a', 'É': 'e', 'Í': 'i', 'Ó': 'o', 'Ö': 'o', 'Ő': 'o',
    'Ú': 'u', 'Ü': 'u', 'Ű': 'u'
  }
  
  return text
    .toLowerCase()
    .split('')
    .map(char => hungarianMap[char] || char)
    .join('')
    .replace(/[^a-z0-9\s-]/g, '')  // Remove special chars
    .replace(/\s+/g, '-')          // Replace spaces with dashes
    .replace(/-+/g, '-')           // Collapse multiple dashes
    .replace(/^-|-$/g, '')         // Trim dashes from ends
    .slice(0, 100)                 // Max length
}

/**
 * Generate SEO-friendly slug for a product variant from its attributes
 * Example: { "Szín": "Fekete", "Tárhely": "256GB" } => "fekete-256gb"
 */
export function generateVariantSlug(attributes: Record<string, string>): string {
  // Priority order for variant attributes
  const priorityOrder = [
    'Tárhely', 'Storage', 'Memória', 'Memory', 'RAM',
    'Szín', 'Color', 'Colour',
    'Méret', 'Size',
    'Verzió', 'Version', 'Edition'
  ]
  
  // Get values in priority order, then any remaining
  const sortedValues: string[] = []
  const usedKeys = new Set<string>()
  
  // First, add priority keys in order
  for (const key of priorityOrder) {
    const matchKey = Object.keys(attributes).find(k => k.toLowerCase() === key.toLowerCase())
    if (matchKey && attributes[matchKey]) {
      sortedValues.push(attributes[matchKey])
      usedKeys.add(matchKey)
    }
  }
  
  // Then add any remaining attributes
  for (const [key, value] of Object.entries(attributes)) {
    if (!usedKeys.has(key) && value) {
      sortedValues.push(value)
    }
  }
  
  // Generate slug from combined values
  return generateSlug(sortedValues.join(' '))
}

/**
 * Get variant URL - returns slug-based URL if available, otherwise ID-based
 */
export function getVariantUrl(productUrl: string, variant: { id: string; slug?: string | null }): string {
  if (variant.slug) {
    return `${productUrl}?v=${variant.slug}`
  }
  return `${productUrl}?variant=${variant.id}`
}
