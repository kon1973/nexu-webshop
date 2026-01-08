import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Jelszó visszaállítása - NEXU Webshop',
  description: 'Új jelszó beállítása',
  robots: {
    index: false,
    follow: false,
  },
}

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return children
}
