import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pénztár - NEXU Webshop',
  description: 'Rendelés véglegesítése',
  robots: {
    index: false,
    follow: false,
  },
}

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children
}
