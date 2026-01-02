import Link from 'next/link'
import { ArrowRight, Calendar, User } from 'lucide-react'
import { getImageUrl } from '@/lib/image'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  image: string | null
  author: string
  createdAt: Date
}

export default function LatestNews({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) return null

  return (
    <section className="py-24 bg-[#0f0f0f]">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Legfrissebb híreink</h2>
            <p className="text-gray-400">Tippek, trükkök és újdonságok a technológia világából.</p>
          </div>
          <Link
            href="/blog"
            className="hidden md:flex items-center gap-2 text-blue-400 hover:text-blue-300 font-bold transition-colors"
          >
            Összes bejegyzés <ArrowRight size={18} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link 
              key={post.id} 
              href={`/blog/${post.slug}`}
              className="group bg-[#1a1a1a] border border-white/5 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all hover:-translate-y-1"
            >
              <div className="relative h-48 w-full overflow-hidden">
                {getImageUrl(post.image) ? (
                  <img
                    src={getImageUrl(post.image)!}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                    <span className="text-4xl">📝</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] to-transparent opacity-60" />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(post.createdAt).toLocaleDateString('hu-HU')}
                  </div>
                  <div className="flex items-center gap-1">
                    <User size={14} />
                    {post.author}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-blue-400 transition-colors">
                  {post.title}
                </h3>
                <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed">
                  {post.excerpt}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center md:hidden">
          <Link
            href="/blog"
            className="w-full py-4 bg-white/5 border border-white/10 rounded-xl font-bold hover:bg-white/10 inline-flex items-center justify-center"
          >
            Összes bejegyzés
          </Link>
        </div>
      </div>
    </section>
  )
}
