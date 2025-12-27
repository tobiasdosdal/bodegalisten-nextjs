'use client'

import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { ChevronDown, ChevronUp, Star } from 'lucide-react'
import { ReviewCard } from './ReviewCard'
import { ReviewForm } from './ReviewForm'

interface ReviewsListProps {
  barId: Id<'bars'>
  compact?: boolean
}

export function ReviewsList({ barId, compact = false }: ReviewsListProps) {
  const [expanded, setExpanded] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const stats = useQuery(api.reviews.getStats, { barId })
  const reviews = useQuery(api.reviews.getByBar, expanded ? { barId } : 'skip')

  const isLoading = stats === undefined

  if (isLoading) {
    return (
      <div className="py-4 animate-pulse">
        <div className="h-5 w-32 bg-white/[0.06] rounded" />
      </div>
    )
  }

  return (
    <div className={compact ? '' : 'border-t border-white/[0.06]'}>
      {/* Header - always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full flex items-center justify-between ${compact ? 'py-3' : 'py-4'} text-left group`}
      >
        <div className="flex items-center gap-2">
          <span className={`font-semibold text-white ${compact ? 'text-sm' : ''}`}>
            Anmeldelser
          </span>
          {stats.count > 0 && (
            <div className="flex items-center gap-1.5 text-gray-400">
              <Star className="w-3.5 h-3.5 fill-[rgb(var(--bodega-gold))] text-[rgb(var(--bodega-gold))]" />
              <span className={compact ? 'text-xs' : 'text-sm'}>{stats.avgRating.toFixed(1)}</span>
              <span className={`text-gray-600 ${compact ? 'text-xs' : 'text-sm'}`}>
                ({stats.count})
              </span>
            </div>
          )}
          {stats.count === 0 && (
            <span className={`text-gray-500 ${compact ? 'text-xs' : 'text-sm'}`}>
              Ingen endnu
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-gray-500 group-hover:text-gray-400 transition-colors" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-gray-400 transition-colors" />
        )}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="pb-4 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Write review button / form */}
          {showForm ? (
            <ReviewForm
              barId={barId}
              onSuccess={() => setShowForm(false)}
              onCancel={() => setShowForm(false)}
            />
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="w-full mb-4 py-2.5 text-sm font-medium text-bodega-accent border border-bodega-accent/30 rounded-xl hover:bg-bodega-accent/10 transition-colors"
            >
              Skriv en anmeldelse
            </button>
          )}

          {/* Reviews list */}
          {reviews === undefined ? (
            <div className="py-4 text-center text-gray-500 text-sm">
              Indlæser...
            </div>
          ) : reviews.length === 0 ? (
            <div className="py-4 text-center text-gray-500 text-sm">
              Vær den første til at anmelde denne bar
            </div>
          ) : (
            <div>
              {reviews
                .sort((a, b) => b.createdAt - a.createdAt)
                .map((review) => (
                  <ReviewCard
                    key={review._id}
                    rating={review.rating}
                    comment={review.comment}
                    createdAt={review.createdAt}
                    userId={review.userId}
                  />
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
