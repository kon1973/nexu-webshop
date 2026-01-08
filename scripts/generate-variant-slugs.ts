/**
 * Script to generate SEO slugs for existing product variants
 * Run with: npx tsx scripts/generate-variant-slugs.ts
 */

import { PrismaClient } from '@prisma/client'
import { generateVariantSlug } from '../lib/seo-utils'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Fetching variants without slugs...')

  const variants = await prisma.productVariant.findMany({
    where: { slug: null },
    include: { product: { select: { name: true, slug: true } } }
  })

  console.log(`Found ${variants.length} variants without slugs`)

  if (variants.length === 0) {
    console.log('✅ All variants already have slugs!')
    return
  }

  let updated = 0
  let skipped = 0

  for (const variant of variants) {
    const attributes = variant.attributes as Record<string, string>
    
    if (!attributes || Object.keys(attributes).length === 0) {
      console.log(`⚠️ Skipping variant ${variant.id} - no attributes`)
      skipped++
      continue
    }

    const slug = generateVariantSlug(attributes)

    if (!slug) {
      console.log(`⚠️ Skipping variant ${variant.id} - empty slug generated`)
      skipped++
      continue
    }

    // Check for duplicate slug within the same product
    const existing = await prisma.productVariant.findFirst({
      where: {
        productId: variant.productId,
        slug: slug,
        NOT: { id: variant.id }
      }
    })

    if (existing) {
      // Append a unique suffix
      const uniqueSlug = `${slug}-${variant.id.slice(-4)}`
      await prisma.productVariant.update({
        where: { id: variant.id },
        data: { slug: uniqueSlug }
      })
      console.log(`✅ ${variant.product.name} → ${uniqueSlug} (deduplicated)`)
    } else {
      await prisma.productVariant.update({
        where: { id: variant.id },
        data: { slug }
      })
      console.log(`✅ ${variant.product.name} → ${slug}`)
    }
    
    updated++
  }

  console.log(`\n📊 Summary:`)
  console.log(`   Updated: ${updated}`)
  console.log(`   Skipped: ${skipped}`)
  console.log(`   Total: ${variants.length}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
