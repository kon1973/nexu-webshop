import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Calendar, User, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  // @ts-ignore
  const post = await prisma.blogPost.findUnique({
    where: { slug },
    select: { title: true, excerpt: true }
  })

  if (!post) return { title: 'Bejegyzés nem található' }

  return {
    title: post.title,
    description: post.excerpt,
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  // @ts-ignore
  const post = await prisma.blogPost.findUnique({
    where: { slug },
  })

  if (!post || !post.published) return notFound()

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <Link 
          href="/blog"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          Vissza a bloghoz
        </Link>

        <article>
          <header className="mb-8">
            <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              {post.title}
            </h1>
            
            <div className="flex items-center gap-6 text-gray-400 mb-8 border-b border-white/10 pb-8">
              <div className="flex items-center gap-2">
                <Calendar size={18} />
                {new Date(post.createdAt).toLocaleDateString('hu-HU', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              <div className="flex items-center gap-2">
                <User size={18} />
                {post.author}
              </div>
            </div>

            {post.image && (
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-10">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}
          </header>

          <div 
            className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-a:text-purple-400 hover:prose-a:text-purple-300"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </div>
    </div>
  )
}
