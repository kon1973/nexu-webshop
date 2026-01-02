'use client'

import { CartError } from '@/app/components/ErrorBoundary'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <CartError error={error} reset={reset} />
}
