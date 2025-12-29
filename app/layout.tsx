import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from './Navbar'
import { Providers } from './providers'
import { Toaster } from 'sonner'
import CartSidebar from './components/CartSidebar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import { getSiteUrl } from '@/lib/site'
import { getSettings } from '@/lib/cache'

const inter = Inter({ subsets: ['latin'] })
const siteUrl = getSiteUrl()

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings()

  const siteName = settings.site_name || 'NEXU Webshop'
  const description = settings.site_description || 'A jövő technológiája'

  return {
    metadataBase: siteUrl,
    title: {
      default: siteName,
      template: `%s | ${siteName}`,
    },
    description: description,
    openGraph: {
      title: siteName,
      description: description,
      url: siteUrl,
      siteName: siteName,
      locale: 'hu_HU',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: siteName,
      description: description,
    },
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings()

  return (
    <html lang="hu" suppressHydrationWarning>
      <body className={`${inter.className} bg-[#0a0a0a] text-white`}>
        <Providers settings={settings}>
          <Navbar />
          <CartSidebar />
          <main>{children}</main>
          <Footer settings={settings} />
          <ScrollToTop />
          <Toaster position="bottom-right" theme="dark" />
        </Providers>
      </body>
    </html>
  )
}


