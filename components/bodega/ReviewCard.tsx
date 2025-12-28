'use client'

import Link from 'next/link'
import { StarRating } from './StarRating'
import { UserAvatar } from '@/components/social'

interface ReviewCardProps {
  rating: number
  comment?: string
  createdAt: number
  userId?: string
  userName?: string
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

export function ReviewCard({ rating, comment, createdAt, userId, userName }: ReviewCardProps) {
  const displayName = userName || 'Anonym'

  return (
    <div className="py-4 border-b border-white/[0.06] last:border-b-0">
      <div className="flex items-start gap-3">
        {/* User avatar */}
        {userId ? (
          <Link href={`/users/${userId}`} className="flex-shrink-0">
            <UserAvatar name={displayName} size="sm" />
          </Link>
        ) : (
          <div className="flex-shrink-0">
            <UserAvatar name={displayName} size="sm" />
          </div>
        )}

        {/* Review content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              {userId ? (
                <Link
                  href={`/users/${userId}`}
                  className="text-sm font-medium text-white hover:text-bodega-accent transition-colors"
                >
                  {displayName}
                </Link>
              ) : (
                <span className="text-sm font-medium text-gray-400">
                  {displayName}
                </span>
              )}
              <span className="text-xs text-gray-500">{formatDate(createdAt)}</span>
            </div>
            <StarRating rating={rating} size="sm" />
          </div>
          {comment && (
            <p className="text-sm text-gray-300 leading-relaxed">{comment}</p>
          )}
        </div>
      </div>
    </div>
  )
}
