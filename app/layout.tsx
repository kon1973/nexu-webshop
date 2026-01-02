import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'
import Navbar from './Navbar'
import { Providers } from './providers'
import { Toaster } from 'sonner'
import CartSidebar from './components/CartSidebar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import CookieBanner from './components/CookieBanner'
import SkipToContent from './components/Accessibility'
import { getSiteUrl } from '@/lib/site'
import { getSettings, getCategories } from '@/lib/cache'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap', // Optimize font loading
  preload: true,
})
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
  const categories = await getCategories()

  return (
    <html lang="hu" suppressHydrationWarning>
      <head>
        {/* Preconnect to critical third-party origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* DNS prefetch for analytics and payment providers */}
        <link rel="dns-prefetch" href="https://js.stripe.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        {/* Prefetch critical navigation routes */}
        <link rel="prefetch" href="/shop" as="document" />
      </head>
      <body className={`${inter.className} bg-[#0a0a0a] text-white`}>
        <Providers settings={settings}>
          <SkipToContent />
          <Navbar categories={categories} />
          <CartSidebar />
          <main id="main-content">{children}</main>
          <Footer settings={settings} />
          <ScrollToTop />
          <Toaster 
            position="bottom-right" 
            theme="dark"
            toastOptions={{
              style: {
                background: '#1a1a1a',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '16px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              },
              classNames: {
                toast: 'animate-slide-up',
                title: 'text-white font-semibold',
                description: 'text-gray-400 text-sm',
                success: 'border-green-500/20 [&>svg]:text-green-500',
                error: 'border-red-500/20 [&>svg]:text-red-500',
                warning: 'border-yellow-500/20 [&>svg]:text-yellow-500',
                info: 'border-blue-500/20 [&>svg]:text-blue-500',
              },
            }}
            expand
            richColors
            closeButton
          />
          <CookieBanner />
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  )
}


