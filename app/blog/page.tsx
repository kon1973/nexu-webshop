import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, User } from 'lucide-react'
import type { Metadata } from 'next'
import { getImageUrl } from '@/lib/image'

export const metadata: Metadata = {
  title: 'Blog - NEXU Webshop',
  description: 'Hírek, tippek és újdonságok a technológia világából.',
}

export default async function BlogPage() {
  // @ts-ignore - Prisma client might not be updated yet
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
          Blog
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post: any) => (
            <Link 
              key={post.id} 
              href={`/blog/${post.slug}`}
              className="group bg-[#121212] border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all"
            >
              <div className="relative h-48 w-full overflow-hidden">
                {getImageUrl(post.image) ? (
                  <Image
                    src={getImageUrl(post.image)!}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                    <span className="text-4xl">📝</span>
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(post.createdAt).toLocaleDateString('hu-HU')}
                  </div>
                  <div className="flex items-center gap-1">
                    <User size={14} />
                    {post.author}
                  </div>
                </div>
                <h2 className="text-xl font-bold mb-2 group-hover:text-purple-400 transition-colors">
                  {post.title}
                </h2>
                <p className="text-gray-400 line-clamp-3">
                  {post.excerpt || post.content.substring(0, 150)}...
                </p>
              </div>
            </Link>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            Még nincsenek bejegyzések.
          </div>
        )}
      </div>
    </div>
  )
}
