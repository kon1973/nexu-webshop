import type { Metadata } from 'next'
import { Setting } from '@prisma/client'
import ContactClient from './ContactClient'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'Kapcsolat - NEXU Webshop',
  description: 'Lépj kapcsolatba velünk kérdés vagy észrevétel esetén.',
}

export default async function ContactPage() {
  const settingsList = await prisma.setting.findMany()
  const settings = settingsList.reduce((acc: Record<string, string>, curr: Setting) => {
    acc[curr.key] = curr.value
    return acc
  }, {} as Record<string, string>)

  return <ContactClient settings={settings} />
}
