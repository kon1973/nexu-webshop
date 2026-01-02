'use server'

import { prisma } from '@/lib/prisma'

type Specification = {
  key: string
  value: string | boolean
  type: 'text' | 'boolean' | 'header'
}

export type SpecificationFilter = {
  key: string
  type: 'text' | 'boolean' | 'range'
  values?: string[]
  booleanCount?: { true: number; false: number }
  min?: number
  max?: number
}

// Grouped specifications with optional header
export type SpecificationGroup = {
  header: string | null // null means "Egyéb" (uncategorized)
  specs: SpecificationFilter[]
}

export async function getSpecifications(category?: string): Promise<SpecificationGroup[]> {
  try {
    // Get all non-archived products with specifications
    const products = await prisma.product.findMany({
      where: {
        isArchived: false,
        ...(category ? { category } : {})
      },
      select: {
        specifications: true
      }
    })

    // Map to track which header each spec key belongs to (most common header wins)
    const specHeaderMap = new Map<string, Map<string, number>>() // specKey -> headerName -> count
    // Aggregate specifications
    const specMap = new Map<string, SpecificationFilter>()

    for (const product of products) {
      const specs = product.specifications as Specification[] | null
      if (!specs || !Array.isArray(specs)) continue

      let currentHeader: string | null = null

      for (const spec of specs) {
        if (!spec.key) continue
        
        // Track headers for grouping
        if (spec.type === 'header') {
          currentHeader = spec.key
          continue
        }

        // Track which header this spec falls under
        if (!specHeaderMap.has(spec.key)) {
          specHeaderMap.set(spec.key, new Map())
        }
        const headerCounts = specHeaderMap.get(spec.key)!
        const headerKey = currentHeader || '__uncategorized__'
        headerCounts.set(headerKey, (headerCounts.get(headerKey) || 0) + 1)

        const existing = specMap.get(spec.key)

        if (spec.type === 'boolean') {
          if (!existing) {
            specMap.set(spec.key, {
              key: spec.key,
              type: 'boolean',
              booleanCount: { true: spec.value === true ? 1 : 0, false: spec.value === false ? 1 : 0 }
            })
          } else if (existing.type === 'boolean' && existing.booleanCount) {
            if (spec.value === true) existing.booleanCount.true++
            else existing.booleanCount.false++
          }
        } else if (typeof spec.value === 'string' && spec.value.trim()) {
          const stringValue = spec.value.trim()
          
          // Check if it looks like a numeric value (with units like GB, mm, mAh, etc.)
          const numericMatch = stringValue.match(/^([\d,.]+)\s*(.*)$/)
          
          if (numericMatch) {
            const numValue = parseFloat(numericMatch[1].replace(',', '.'))
            
            if (!existing) {
              specMap.set(spec.key, {
                key: spec.key,
                type: 'range',
                min: numValue,
                max: numValue,
                values: [stringValue]
              })
            } else if (existing.type === 'range') {
              if (numValue < (existing.min ?? Infinity)) existing.min = numValue
              if (numValue > (existing.max ?? -Infinity)) existing.max = numValue
              if (!existing.values?.includes(stringValue)) {
                existing.values = [...(existing.values || []), stringValue]
              }
            }
          } else {
            // Regular text value
            if (!existing) {
              specMap.set(spec.key, {
                key: spec.key,
                type: 'text',
                values: [stringValue]
              })
            } else if (existing.type === 'text' && existing.values) {
              if (!existing.values.includes(stringValue)) {
                existing.values.push(stringValue)
              }
            }
          }
        }
      }
    }

    // Filter valid specs
    const validSpecs = Array.from(specMap.values())
      .filter(spec => {
        if (spec.type === 'text') return (spec.values?.length ?? 0) > 1
        if (spec.type === 'boolean') return (spec.booleanCount?.true ?? 0) > 0 || (spec.booleanCount?.false ?? 0) > 0
        if (spec.type === 'range') return spec.min !== spec.max
        return false
      })

    // Determine the most common header for each spec
    const specToHeader = new Map<string, string | null>()
    for (const spec of validSpecs) {
      const headerCounts = specHeaderMap.get(spec.key)
      if (headerCounts) {
        let maxCount = 0
        let bestHeader: string | null = null
        for (const [header, count] of headerCounts) {
          if (count > maxCount) {
            maxCount = count
            bestHeader = header === '__uncategorized__' ? null : header
          }
        }
        specToHeader.set(spec.key, bestHeader)
      }
    }

    // Group specs by header
    const groups = new Map<string | null, SpecificationFilter[]>()
    for (const spec of validSpecs) {
      const header = specToHeader.get(spec.key) ?? null
      if (!groups.has(header)) {
        groups.set(header, [])
      }
      groups.get(header)!.push(spec)
    }

    // Sort specs within each group
    for (const specs of groups.values()) {
      specs.sort((a, b) => a.key.localeCompare(b.key, 'hu'))
    }

    // Convert to array and sort groups (headers alphabetically, null/"Egyéb" at end)
    const result: SpecificationGroup[] = []
    const headers = Array.from(groups.keys()).sort((a, b) => {
      if (a === null) return 1
      if (b === null) return -1
      return a.localeCompare(b, 'hu')
    })

    for (const header of headers) {
      result.push({
        header,
        specs: groups.get(header)!
      })
    }

    return result
  } catch (error) {
    console.error('Error fetching specifications:', error)
    return []
  }
}
