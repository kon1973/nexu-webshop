import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sikeres rendelés - NEXU Webshop',
  description: 'A rendelésed sikeresen leadtuk',
  robots: {
    index: false,
    follow: false,
  },
}

export default function SuccessLayout({ children }: { children: React.ReactNode }) {
  return children
}
