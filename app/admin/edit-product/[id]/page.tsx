import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import EditProductForm from './EditProductForm'

export default async function EditProductPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const id = Number.parseInt(params.id, 10)

  if (Number.isNaN(id)) return notFound()

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      options: true,
      variants: true,
    },
  })

  if (!product) return notFound()

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-12 font-sans selection:bg-purple-500/30">
      <EditProductForm product={product} />
    </div>
  )
}

