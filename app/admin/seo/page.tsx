import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Metadata } from 'next'
import { calculateProductSeoScore } from '@/lib/seo-utils'
import SeoAuditClient from './SeoAuditClient'
import RunSeoAuditButton from './RunSeoAuditButton.client'

export const metadata: Metadata = {
  title: 'SEO Audit - Admin',
  description: 'Ellenőrizd a termékek SEO állapotát',
}

interface ProductSeoData {
  id: number
  name: string
  slug: string | null
  description: string | null
  metaTitle: string | null
  metaDescription: string | null
  images: string[]
  gtin: string | null
  sku: string | null
  score: number
  issues: string[]
}

interface CategorySeoData {
  id: string
  name: string
  slug: string | null
  description: string | null
  metaTitle: string | null
  metaDescription: string | null
  productCount: number
}

async function getSeoAuditData() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { isArchived: false },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        metaTitle: true,
        metaDescription: true,
        images: true,
        gtin: true,
        sku: true,
      },
      orderBy: { name: 'asc' }
    }),
    prisma.category.findMany({
      orderBy: { name: 'asc' }
    })
  ])

  // Get product count per category
  const productCounts = await prisma.product.groupBy({
    by: ['category'],
    _count: { id: true },
    where: { isArchived: false }
  })
  const categoryProductCount = new Map(productCounts.map(pc => [pc.category, pc._count.id]))

  // Calculate SEO score for each product
  const productsWithScore: ProductSeoData[] = products.map(p => {
    const { score, issues } = calculateProductSeoScore({
      name: p.name,
      description: p.description,
      metaTitle: p.metaTitle,
      metaDescription: p.metaDescription,
      slug: p.slug,
      images: p.images,
      gtin: p.gtin,
      sku: p.sku,
    })
    return { ...p, score, issues }
  })

  // Sort by score (lowest first for priority fixes)
  productsWithScore.sort((a, b) => a.score - b.score)

  const categoriesData: CategorySeoData[] = categories.map(c => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    metaTitle: c.metaTitle,
    metaDescription: c.metaDescription,
    productCount: categoryProductCount.get(c.name) || 0
  }))

  // Calculate stats
  const stats = {
    totalProducts: products.length,
    productsWithSlug: products.filter(p => p.slug).length,
    productsWithMetaTitle: products.filter(p => p.metaTitle).length,
    productsWithMetaDescription: products.filter(p => p.metaDescription).length,
    productsWithGtin: products.filter(p => p.gtin).length,
    productsWithImages: products.filter(p => p.images.length > 0).length,
    avgScore: productsWithScore.length > 0 
      ? Math.round(productsWithScore.reduce((sum, p) => sum + p.score, 0) / productsWithScore.length)
      : 0,
    categoriesWithMeta: categories.filter(c => c.metaTitle || c.metaDescription).length,
    totalCategories: categories.length,
  }

  return { products: productsWithScore, categories: categoriesData, stats }
}

function ScoreBadge({ score }: { score: number }) {
  let color = 'bg-red-700 text-white'
  if (score >= 80) color = 'bg-green-600 text-white'
  else if (score >= 60) color = 'bg-lime-600 text-white'
  else if (score >= 40) color = 'bg-orange-500 text-white'

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {score}%
    </span>
  )
}

function StatCard({ title, value, total, icon }: { title: string, value: number, total: number, icon: string }) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0
  
  return (
    <div className="bg-white/4 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-100">{value} / {total}</p>
          <p className="text-sm text-gray-400">{percentage}%</p>
        </div>
        <div className="text-3xl text-gray-300">{icon}</div>
      </div>
    </div>
  )
}

export default async function SeoAuditPage() {
  const { products, categories, stats } = await getSeoAuditData()
  
  const criticalIssues = products.filter(p => p.score < 40)
  const needsImprovement = products.filter(p => p.score >= 40 && p.score < 70)
  const goodSeo = products.filter(p => p.score >= 70)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">SEO Audit</h1>
          <p className="text-sm text-gray-400 mt-1">
            Átlagos SEO pontszám: <span className="font-bold text-lg text-purple-400">{stats.avgScore}%</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <RunSeoAuditButton />
          <Link
            href="/admin/seo/audits"
            className="bg-white/10 hover:bg-white/15 text-white text-sm px-4 py-2 rounded-lg transition-colors"
          >
            📋 Audit Napló
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Slug beállítva" value={stats.productsWithSlug} total={stats.totalProducts} icon="🔗" />
        <StatCard title="Meta Title" value={stats.productsWithMetaTitle} total={stats.totalProducts} icon="📝" />
        <StatCard title="Meta Description" value={stats.productsWithMetaDescription} total={stats.totalProducts} icon="📄" />
        <StatCard title="GTIN/EAN kód" value={stats.productsWithGtin} total={stats.totalProducts} icon="🏷️" />
        <StatCard title="Van termékkép" value={stats.productsWithImages} total={stats.totalProducts} icon="🖼️" />
        <StatCard title="Kategória SEO" value={stats.categoriesWithMeta} total={stats.totalCategories} icon="📁" />
      </div>

      {/* Score Distribution */}
      <div className="bg-white/4 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4 text-gray-100">SEO Pontszám Eloszlás</h2>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex h-8 rounded-full overflow-hidden">
              {criticalIssues.length > 0 && (
                <div 
                  className="bg-red-600 flex items-center justify-center text-white text-xs"
                  style={{ width: `${(criticalIssues.length / products.length) * 100}%` }}
                >
                  {criticalIssues.length}
                </div>
              )}
              {needsImprovement.length > 0 && (
                <div 
                  className="bg-yellow-500 flex items-center justify-center text-black text-xs"
                  style={{ width: `${(needsImprovement.length / products.length) * 100}%` }}
                >
                  {needsImprovement.length}
                </div>
              )}
              {goodSeo.length > 0 && (
                <div 
                  className="bg-green-600 flex items-center justify-center text-white text-xs"
                  style={{ width: `${(goodSeo.length / products.length) * 100}%` }}
                >
                  {goodSeo.length}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-4 text-sm text-gray-300">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-600 rounded"></span> Kritikus (&lt;40%)</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-500 rounded"></span> Javítandó (40-70%)</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-600 rounded"></span> Jó (&gt;70%)</span>
          </div>
        </div>
      </div>

          {/* Products Table (client-side with filters + dark mode) */}
      <SeoAuditClient products={products.slice(0, 500)} />

      {/* Categories Table */}
      <div className="bg-white/4 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <h2 className="text-lg font-semibold text-gray-100">Kategóriák SEO állapota</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/5">
            <thead className="bg-[#070707]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Kategória</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Slug</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Meta Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Meta Desc</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Termékek</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Művelet</th>
              </tr>
            </thead>
            <tbody className="bg-transparent divide-y divide-white/5">
              {categories.map((category) => (
                <tr key={category.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-100">{category.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {category.slug ? (
                      <span className="text-green-400 text-sm">{category.slug}</span>
                    ) : (
                      <span className="text-red-400">✗</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {category.metaTitle ? (
                      <span className="text-green-400">✓</span>
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {category.metaDescription ? (
                      <span className="text-green-600">✓</span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {category.productCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link 
                      href={`/admin/categories?edit=${category.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Szerkesztés
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="bg-[#071028] rounded-lg p-4">
        <h3 className="font-semibold text-gray-100 mb-2">💡 SEO Tippek</h3>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• <strong>Meta Title:</strong> 30-60 karakter, tartalmazzon kulcsszavakat</li>
          <li>• <strong>Meta Description:</strong> 120-160 karakter, cselekvésre ösztönző</li>
          <li>• <strong>Slug:</strong> Rövid, olvasható URL, kötőjellel elválasztva</li>
          <li>• <strong>Képek:</strong> Min. 3 termékkép különböző szögekből</li>
          <li>• <strong>GTIN/EAN:</strong> Google Merchant Center-hez ajánlott</li>
          <li>• <strong>Leírás:</strong> Min. 50 szó egyedi, hasznos tartalom</li>
        </ul>
      </div>
    </div>
  )
}
