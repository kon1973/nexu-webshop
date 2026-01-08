import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Regisztráció - NEXU Webshop',
  description: 'Hozz létre egy új fiókot',
  robots: {
    index: false,
    follow: true,
  },
}

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children
}
