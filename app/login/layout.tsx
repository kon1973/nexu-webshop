import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Bejelentkezés - NEXU Webshop',
  description: 'Jelentkezz be a fiókodba',
  robots: {
    index: false,
    follow: true,
  },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
