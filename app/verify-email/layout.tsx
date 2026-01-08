import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Email megerősítése - NEXU Webshop',
  description: 'Email cím megerősítése',
  robots: {
    index: false,
    follow: false,
  },
}

export default function VerifyEmailLayout({ children }: { children: React.ReactNode }) {
  return children
}
