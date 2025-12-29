import { prisma } from '@/lib/prisma'
import BlogForm from '../BlogForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  // @ts-ignore
  const post = await prisma.blogPost.findUnique({
    where: { id },
  })

  if (!post) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 pt-24 pb-12 space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/blog"
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-3xl font-bold">Bejegyzés szerkesztése</h1>
      </div>

      <div className="bg-[#121212] border border-white/10 rounded-xl p-6">
        <BlogForm initialData={post} />
      </div>
    </div>
  )
}
