'use client'

import { ShopError } from '@/app/components/ErrorBoundary'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <ShopError error={error} reset={reset} />
}
