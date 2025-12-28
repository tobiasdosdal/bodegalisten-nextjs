import { NextResponse } from 'next/server'

/**
 * Standardized API error handler for consistent error responses
 */
export function handleApiError(error: unknown, defaultMessage: string, status = 500) {
  console.error(defaultMessage, error)
  return NextResponse.json(
    {
      success: false,
      error: error instanceof Error ? error.message : defaultMessage,
    },
    { status }
  )
}
