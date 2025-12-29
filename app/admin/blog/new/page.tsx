import BlogForm from '../BlogForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewBlogPostPage() {
  return (
    <div className="container mx-auto px-4 pt-24 pb-12 space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/blog"
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-3xl font-bold">Új bejegyzés</h1>
      </div>

      <div className="bg-[#121212] border border-white/10 rounded-xl p-6">
        <BlogForm />
      </div>
    </div>
  )
}
