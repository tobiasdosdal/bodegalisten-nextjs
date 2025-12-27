'use client'

import { useEffect } from 'react'
import { ErrorFallback } from '@/components/bodega'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('App error:', error)
  }, [error])

  return (
    <main className="flex h-screen items-center justify-center bg-black">
      <ErrorFallback
        error={error}
        resetErrorBoundary={reset}
        title="Noget gik galt"
        message="Der opstod en uventet fejl i appen. Prøv venligst igen."
      />
    </main>
  )
}
