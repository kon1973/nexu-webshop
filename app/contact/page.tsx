import type { Metadata } from 'next'
import { Setting } from '@prisma/client'
import ContactClient from './ContactClient'
import { prisma } from '@/lib/prisma'
import { getSiteUrl } from '@/lib/site'

const siteUrl = getSiteUrl()

export const metadata: Metadata = {
  title: 'Kapcsolat',
  description: 'Lépj kapcsolatba velünk kérdés vagy észrevétel esetén. Gyors ügyfélszolgálat, email és telefonos elérhetőség.',
  alternates: { canonical: `${siteUrl}/contact` },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Kapcsolat | NEXU Webshop',
    description: 'Lépj kapcsolatba velünk kérdés vagy észrevétel esetén. Gyors ügyfélszolgálat, email és telefon.',
    url: `${siteUrl}/contact`,
    siteName: 'NEXU Webshop',
    locale: 'hu_HU',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Kapcsolat | NEXU Webshop',
    description: 'Lépj kapcsolatba velünk kérdés vagy észrevétel esetén.',
  },
}

export default async function ContactPage() {
  const settingsList = await prisma.setting.findMany()
  const settings = settingsList.reduce((acc: Record<string, string>, curr: Setting) => {
    acc[curr.key] = curr.value
    return acc
  }, {} as Record<string, string>)

  return <ContactClient settings={settings} />
}
