import { describe, it, expect } from 'vitest'
import { normalizeCanonicalUrl, generateProductMetaDescription } from '@/lib/seo-utils'

describe('seo-utils', () => {
  it('normalizeCanonicalUrl keeps allowed params only', () => {
    const url = 'https://example.com/shop?search=phone&utm_source=google&page=2&category=phones'
    const normalized = normalizeCanonicalUrl(url, ['search','category','page'])
    expect(normalized).toContain('search=phone')
    expect(normalized).toContain('category=phones')
    expect(normalized).toContain('page=2')
    expect(normalized).not.toContain('utm_source')
  })

  it('generateProductMetaDescription creates meaningful description', () => {
    const desc = generateProductMetaDescription({
      name: 'NEXU Phone X',
      price: 199990,
      salePrice: 179990,
      brand: { name: 'NEXU' },
      stock: 5,
      specifications: [{ key: 'Kijelző', value: '6.7"' }, { key: 'RAM', value: '8GB' }]
    })
    expect(desc).toContain('NEXU NEXU Phone X')
    expect(desc).toContain('készlet')
    expect(desc.length).toBeGreaterThan(50)
  })
})