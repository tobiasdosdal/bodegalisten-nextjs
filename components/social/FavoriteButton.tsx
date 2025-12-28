'use client'

import { useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { useUser, SignInButton } from '@clerk/nextjs'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { Heart, Loader2 } from 'lucide-react'

interface FavoriteButtonProps {
  barId: Id<'bars'>
  size?: 'sm' | 'md' | 'lg'
  showCount?: boolean
}

export function FavoriteButton({ barId, size = 'md', showCount = false }: FavoriteButtonProps) {
  const { isSignedIn, user } = useUser()
  const [isToggling, setIsToggling] = useState(false)

  const isFavorite = useQuery(
    api.favorites.isFavorite,
    user?.id ? { userId: user.id, barId } : 'skip'
  )

  const favoriteCount = useQuery(
    api.favorites.getFavoriteCount,
    showCount ? { barId } : 'skip'
  )

  const toggleFavorite = useMutation(api.favorites.toggle)

  const handleToggle = async () => {
    if (!user?.id) return

    setIsToggling(true)
    try {
      await toggleFavorite({ userId: user.id, barId })
    } catch (err) {
      console.error('Failed to toggle favorite:', err)
    } finally {
      setIsToggling(false)
    }
  }

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  // Not signed in - show sign in prompt
  if (!isSignedIn) {
    return (
      <SignInButton mode="modal">
        <button
          className={`${sizeClasses[size]} rounded-full bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.1] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-bodega-accent`}
          aria-label="Log ind for at gemme som favorit"
        >
          <Heart className={`${iconSizes[size]} text-gray-400`} />
        </button>
      </SignInButton>
    )
  }

  // Loading state
  if (isFavorite === undefined) {
    return (
      <button
        disabled
        className={`${sizeClasses[size]} rounded-full bg-white/[0.06] flex items-center justify-center`}
        aria-label="Indlæser..."
      >
        <Loader2 className={`${iconSizes[size]} text-gray-400 animate-spin`} />
      </button>
    )
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={handleToggle}
        disabled={isToggling}
        className={`${sizeClasses[size]} rounded-full ${
          isFavorite
            ? 'bg-red-500/20 hover:bg-red-500/30'
            : 'bg-white/[0.06] hover:bg-white/[0.1]'
        } flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-bodega-accent disabled:opacity-50`}
        aria-label={isFavorite ? 'Fjern fra favoritter' : 'Tilføj til favoritter'}
      >
        {isToggling ? (
          <Loader2 className={`${iconSizes[size]} text-gray-400 animate-spin`} />
        ) : (
          <Heart
            className={`${iconSizes[size]} transition-colors ${
              isFavorite
                ? 'fill-red-500 text-red-500'
                : 'text-gray-400'
            }`}
          />
        )}
      </button>
      {showCount && favoriteCount !== undefined && favoriteCount > 0 && (
        <span className="text-sm text-gray-400">{favoriteCount}</span>
      )}
    </div>
  )
}
