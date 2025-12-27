'use client'

import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorFallbackProps {
  error?: Error
  resetErrorBoundary?: () => void
  title?: string
  message?: string
}

export function ErrorFallback({
  error,
  resetErrorBoundary,
  title = 'Noget gik galt',
  message = 'Der opstod en uventet fejl. Prøv venligst igen.'
}: ErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8 text-red-500" />
      </div>

      <h2 className="text-xl font-bold text-white mb-2 font-bodega-rounded">
        {title}
      </h2>

      <p className="text-gray-400 text-sm mb-6 max-w-sm">
        {message}
      </p>

      {error && process.env.NODE_ENV === 'development' && (
        <pre className="text-xs text-red-400 bg-red-500/10 p-3 rounded-lg mb-6 max-w-full overflow-x-auto">
          {error.message}
        </pre>
      )}

      {resetErrorBoundary && (
        <button
          onClick={resetErrorBoundary}
          className="flex items-center gap-2 px-4 py-2 bg-bodega-accent/10 border border-bodega-accent/20 rounded-bodega-sm text-bodega-accent font-semibold text-sm transition-colors hover:bg-bodega-accent/20"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Prøv igen</span>
        </button>
      )}
    </div>
  )
}
