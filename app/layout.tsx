import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from './Navbar'
import { Providers } from './providers'
import { Toaster } from 'sonner'
import CartSidebar from './components/CartSidebar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import CookieBanner from './components/CookieBanner'
import SkipToContent from './components/Accessibility'
import { PWAProvider } from './components/PWAProvider'
import { getSiteUrl } from '@/lib/site'
import { getSettings, getCategories } from '@/lib/cache'
import OrganizationJsonLd from './components/OrganizationJsonLd'
import AIChatbot from './components/AIChatbot'
import ShoppingAssistant from './components/ShoppingAssistant'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap', // Optimize font loading
  preload: true,
})
const siteUrl = getSiteUrl()
const siteUrlString = typeof siteUrl === 'string' ? siteUrl : siteUrl.toString()

// Viewport configuration for PWA
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0a0a0a' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
}

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
    manifest: '/manifest.json',
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: siteName,
    },
    formatDetection: {
      telephone: false,
    },
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings()
  const categories = await getCategories()

  return (
    <html lang="hu" suppressHydrationWarning>
      <head>
        {/* Language and region targeting */}
        <link rel="alternate" hrefLang="hu" href={siteUrlString} />
        <link rel="alternate" hrefLang="x-default" href={siteUrlString} />
        {/* Preconnect to critical third-party origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Preconnect to image CDNs and storage */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        {/* DNS prefetch for analytics and payment providers */}
        <link rel="dns-prefetch" href="https://js.stripe.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://connect.facebook.net" />
        {/* Prefetch critical navigation routes */}
        <link rel="prefetch" href="/shop" as="document" />
        {/* PWA Apple Touch Icon */}
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.svg" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.svg" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icons/icon-152x152.svg" />
        {/* Favicon */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#0a0a0a" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${inter.className} bg-[#0a0a0a] text-white`}>
        <Providers settings={settings}>
          <PWAProvider>
            <SkipToContent />
            <OrganizationJsonLd settings={settings} />
            <Navbar categories={categories} />
            <CartSidebar />
            <main id="main-content">{children}</main>
            <Footer settings={settings} />
            <ScrollToTop />
            <ShoppingAssistant />
            <AIChatbot />
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
          </PWAProvider>
        </Providers>
      </body>
    </html>
  )
}


