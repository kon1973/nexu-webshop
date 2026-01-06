import { prisma } from '@/lib/prisma'
import { calculateProductSeoScore } from '@/lib/seo-utils'
import { logger } from '@/lib/logger'

export async function runSeoAudit() {
  // Fetch all non-archived products
  const products = await prisma.product.findMany({ where: { isArchived: false }, include: { _count: { select: { reviews: true } } } })

  const report: Array<{ id: number; name: string; score: number; issues: string[] }> = []
  let total = 0
  let criticalCount = 0

  for (const p of products) {
    const { score, issues } = calculateProductSeoScore({
      name: p.name,
      description: p.description,
      metaTitle: p.metaTitle,
      metaDescription: p.metaDescription,
      slug: p.slug,
      images: p.images,
      gtin: p.gtin,
      sku: p.sku
    })
    report.push({ id: p.id, name: p.name, score, issues })
    total += score
    if (score < 40) criticalCount += 1
  }

  const avgScore = products.length > 0 ? Math.round(total / products.length) : 0

  // Store audit in DB
  try {
    await prisma.seoAudit.create({
      data: {
        totalProducts: products.length,
        avgScore,
        criticalCount,
        payload: report as any
      }
    })
  } catch (err) {
    logger.error('Failed to store SEO audit', { error: (err as Error).message })
  }

  return { totalProducts: products.length, avgScore, criticalCount, report }
}
