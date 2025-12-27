'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Admin error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8 text-red-500" />
      </div>

      <h2 className="text-xl font-bold text-white mb-2">
        Fejl i admin
      </h2>

      <p className="text-gray-400 text-sm mb-6 max-w-sm">
        Der opstod en fejl i admin-panelet. Prøv venligst igen.
      </p>

      {process.env.NODE_ENV === 'development' && error && (
        <pre className="text-xs text-red-400 bg-red-500/10 p-3 rounded-lg mb-6 max-w-full overflow-x-auto">
          {error.message}
        </pre>
      )}

      <div className="flex gap-3">
        <Link
          href="/admin"
          className="flex items-center gap-2 px-4 py-2 bg-gray-500/10 border border-gray-500/20 rounded-lg text-gray-400 font-semibold text-sm transition-colors hover:bg-gray-500/20"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Til dashboard</span>
        </Link>

        <button
          onClick={reset}
          className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 font-semibold text-sm transition-colors hover:bg-green-500/20"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Prøv igen</span>
        </button>
      </div>
    </div>
  )
}
