import { prisma } from '@/lib/prisma'
import BulkEditTable from './BulkEditTable'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function BulkEditPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      take: 500, // Limit to 500 for performance
      include: { variants: true }
    }),
    prisma.category.findMany({
      orderBy: { name: 'asc' },
    })
  ])

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8 font-sans pt-24 selection:bg-purple-500/30">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/products"
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Tömeges szerkesztés</h1>
            <p className="text-gray-400">Árak és készletek gyors módosítása</p>
          </div>
        </div>

        <BulkEditTable initialProducts={products} categories={categories} />
      </div>
    </div>
  )
}
