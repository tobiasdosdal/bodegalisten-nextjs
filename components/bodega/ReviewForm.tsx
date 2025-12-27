'use client'

import { useState } from 'react'
import { useMutation } from 'convex/react'
import { useUser, SignInButton } from '@clerk/nextjs'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { Star, Loader2 } from 'lucide-react'

interface ReviewFormProps {
  barId: Id<'bars'>
  onSuccess: () => void
  onCancel: () => void
}

export function ReviewForm({ barId, onSuccess, onCancel }: ReviewFormProps) {
  const { isSignedIn, user } = useUser()
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const createReview = useMutation(api.reviews.create)

  // Show login prompt if not authenticated
  if (!isSignedIn) {
    return (
      <div className="mb-4 p-4 bg-white/[0.04] rounded-xl text-center">
        <p className="text-sm text-gray-400 mb-3">
          Log ind for at skrive en anmeldelse
        </p>
        <SignInButton mode="modal">
          <button className="px-4 py-2 text-sm font-medium text-white bg-bodega-accent rounded-lg hover:bg-bodega-accent/90 transition-colors">
            Log ind
          </button>
        </SignInButton>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      setError('Vælg venligst en bedømmelse')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await createReview({
        barId,
        rating,
        comment: comment.trim() || undefined,
        userId: user?.id,
        userName: user?.fullName || user?.firstName || undefined,
      })
      onSuccess()
    } catch (err) {
      setError('Kunne ikke gemme anmeldelse. Prøv igen.')
      console.error('Failed to create review:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const displayRating = hoveredRating || rating

  return (
    <form onSubmit={handleSubmit} className="mb-4 p-4 bg-white/[0.04] rounded-xl">
      {/* Star rating picker */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-400 mb-2">
          Din bedømmelse
        </label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="p-1 transition-transform hover:scale-110 active:scale-95"
            >
              <Star
                className={`w-7 h-7 transition-colors ${
                  star <= displayRating
                    ? 'fill-[rgb(var(--bodega-gold))] text-[rgb(var(--bodega-gold))]'
                    : 'text-gray-600'
                }`}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm text-gray-400">
              {rating} / 5
            </span>
          )}
        </div>
      </div>

      {/* Comment field */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-400 mb-2">
          Kommentar (valgfri)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Fortæl om din oplevelse..."
          rows={3}
          className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-bodega-accent/50 resize-none text-sm"
        />
      </div>

      {/* Error message */}
      {error && (
        <p className="mb-3 text-sm text-red-400">{error}</p>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-white bg-bodega-accent rounded-lg hover:bg-bodega-accent/90 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Gemmer...
            </>
          ) : (
            'Gem anmeldelse'
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2.5 text-sm font-medium text-gray-400 hover:text-white transition-colors disabled:opacity-50"
        >
          Annuller
        </button>
      </div>
    </form>
  )
}
