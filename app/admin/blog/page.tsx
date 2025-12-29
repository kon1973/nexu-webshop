import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, Edit, Eye } from 'lucide-react'
import DeleteBlogButton from './DeleteBlogButton'

export default async function AdminBlogPage() {
  // @ts-ignore
  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="container mx-auto px-4 pt-24 pb-12 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Blog Bejegyzések</h1>
        <Link
          href="/admin/blog/new"
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Új bejegyzés
        </Link>
      </div>

      <div className="bg-[#121212] border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-gray-400">
            <tr>
              <th className="p-4">Cím</th>
              <th className="p-4">Szerző</th>
              <th className="p-4">Státusz</th>
              <th className="p-4">Dátum</th>
              <th className="p-4 text-right">Műveletek</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {posts.map((post: any) => (
              <tr key={post.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4 font-medium">{post.title}</td>
                <td className="p-4 text-gray-400">{post.author}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    post.published ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {post.published ? 'Publikálva' : 'Vázlat'}
                  </span>
                </td>
                <td className="p-4 text-gray-400">
                  {new Date(post.createdAt).toLocaleDateString('hu-HU')}
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                      title="Megtekintés"
                    >
                      <Eye size={18} />
                    </Link>
                    <Link
                      href={`/admin/blog/${post.id}`}
                      className="p-2 hover:bg-blue-500/10 rounded-lg text-gray-400 hover:text-blue-500 transition-colors"
                      title="Szerkesztés"
                    >
                      <Edit size={18} />
                    </Link>
                    <DeleteBlogButton id={post.id} />
                  </div>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  Még nincsenek bejegyzések.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
