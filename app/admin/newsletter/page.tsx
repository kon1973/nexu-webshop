import { prisma } from '@/lib/prisma'
import { Mail } from 'lucide-react'
import DeleteSubscriberButton from './DeleteSubscriberButton'
import SendNewsletterForm from './SendNewsletterForm'
import ExportSubscribersButton from './ExportSubscribersButton'
import type { NewsletterSubscriber } from '@prisma/client'

export default async function NewsletterPage() {
  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8 font-sans pt-24 selection:bg-purple-500/30">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Mail className="text-blue-500" />
            Hírlevél feliratkozók
          </h1>
          <div className="flex items-center gap-4">
            <div className="bg-blue-500/10 text-blue-400 px-4 py-2 rounded-full font-bold border border-blue-500/20">
              {subscribers.length} feliratkozó
            </div>
            <ExportSubscribersButton />
          </div>
        </div>

        <SendNewsletterForm />

        <div className="bg-[#121212] border border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-gray-400 text-sm uppercase">
              <tr>
                <th className="p-4">Email cím</th>
                <th className="p-4">Feliratkozás dátuma</th>
                <th className="p-4 text-right">Műveletek</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {subscribers.map((sub: NewsletterSubscriber) => (
                <tr key={sub.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-medium text-white">{sub.email}</td>
                  <td className="p-4 text-gray-400">
                    {new Date(sub.createdAt).toLocaleDateString('hu-HU', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="p-4 text-right">
                    <DeleteSubscriberButton id={sub.id} />
                  </td>
                </tr>
              ))}
              {subscribers.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-gray-500">
                    Még nincsenek feliratkozók.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
