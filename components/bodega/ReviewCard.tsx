'use client'

import { StarRating } from './StarRating'

interface ReviewCardProps {
  rating: number
  comment?: string
  createdAt: number
  userId?: string
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'I dag'
  if (diffDays === 1) return 'I går'
  if (diffDays < 7) return `${diffDays} dage siden`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} uger siden`

  return date.toLocaleDateString('da-DK', {
    day: 'numeric',
    month: 'short',
    year: diffDays > 365 ? 'numeric' : undefined
  })
}

export function ReviewCard({ rating, comment, createdAt, userId }: ReviewCardProps) {
  return (
    <div className="py-4 border-b border-white/[0.06] last:border-b-0">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <StarRating rating={rating} size="sm" />
          <span className="text-xs text-gray-500">{formatDate(createdAt)}</span>
        </div>
        {userId && (
          <span className="text-xs text-gray-600">Bruger</span>
        )}
      </div>
      {comment && (
        <p className="text-sm text-gray-300 leading-relaxed">{comment}</p>
      )}
    </div>
  )
}
