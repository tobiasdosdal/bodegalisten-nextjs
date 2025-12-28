'use client'

import { useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { useUser, SignInButton } from '@clerk/nextjs'
import { api } from '@/convex/_generated/api'
import { UserPlus, UserMinus, Loader2 } from 'lucide-react'

interface FollowButtonProps {
  targetUserId: string
  size?: 'sm' | 'md'
}

export function FollowButton({ targetUserId, size = 'md' }: FollowButtonProps) {
  const { isSignedIn, user } = useUser()
  const [isToggling, setIsToggling] = useState(false)

  const isFollowing = useQuery(
    api.follows.isFollowing,
    user?.id
      ? { followerId: user.id, followingId: targetUserId }
      : 'skip'
  )

  const toggleFollow = useMutation(api.follows.toggle)

  // Can't follow yourself
  if (user?.id === targetUserId) {
    return null
  }

  const handleToggle = async () => {
    if (!user?.id) return

    setIsToggling(true)
    try {
      await toggleFollow({ currentUserId: user.id, targetUserId })
    } catch (err) {
      console.error('Failed to toggle follow:', err)
    } finally {
      setIsToggling(false)
    }
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
  }

  // Not signed in
  if (!isSignedIn) {
    return (
      <SignInButton mode="modal">
        <button
          className={`${sizeClasses[size]} flex items-center gap-2 font-medium text-white bg-bodega-accent rounded-lg hover:bg-bodega-accent/90 transition-colors`}
        >
          <UserPlus className="w-4 h-4" />
          Følg
        </button>
      </SignInButton>
    )
  }

  // Loading
  if (isFollowing === undefined) {
    return (
      <button
        disabled
        className={`${sizeClasses[size]} flex items-center gap-2 font-medium text-gray-400 bg-white/[0.06] rounded-lg`}
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        Indlæser...
      </button>
    )
  }

  if (isFollowing) {
    return (
      <button
        onClick={handleToggle}
        disabled={isToggling}
        className={`${sizeClasses[size]} flex items-center gap-2 font-medium text-white border border-white/20 rounded-lg hover:bg-white/[0.06] transition-colors disabled:opacity-50`}
      >
        {isToggling ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <UserMinus className="w-4 h-4" />
        )}
        Følger
      </button>
    )
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isToggling}
      className={`${sizeClasses[size]} flex items-center gap-2 font-medium text-white bg-bodega-accent rounded-lg hover:bg-bodega-accent/90 transition-colors disabled:opacity-50`}
    >
      {isToggling ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <UserPlus className="w-4 h-4" />
      )}
      Følg
    </button>
  )
}
