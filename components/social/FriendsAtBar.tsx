'use client'

import { useQuery } from 'convex/react'
import { useUser } from '@clerk/nextjs'
import { api } from '@/convex/_generated/api'
import { UserAvatar } from './UserAvatar'
import { Users } from 'lucide-react'
import Link from 'next/link'

interface FriendsAtBarProps {
  barId: string
  compact?: boolean
}

export function FriendsAtBar({ barId, compact = false }: FriendsAtBarProps) {
  const { user } = useUser()

  const friendsActive = useQuery(
    api.checkIns.getFriendsActive,
    user?.id ? { userId: user.id } : 'skip'
  )

  if (!user || !friendsActive) return null

  // Filter to friends at this specific bar
  const friendsAtThisBar = friendsActive.filter(
    (checkIn) => checkIn.bar?._id === barId
  )

  if (friendsAtThisBar.length === 0) return null

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-2 py-1.5 bg-bodega-accent/20 rounded-full">
        <Users className="w-3.5 h-3.5 text-bodega-accent" />
        <div className="flex -space-x-2">
          {friendsAtThisBar.slice(0, 3).map((friend) => (
            <UserAvatar
              key={friend.userId}
              src={friend.user.avatarUrl}
              name={friend.user.displayName}
              size="sm"
              className="border-2 border-black"
            />
          ))}
        </div>
        {friendsAtThisBar.length > 3 && (
          <span className="text-xs font-medium text-bodega-accent">
            +{friendsAtThisBar.length - 3}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="p-3 bg-bodega-accent/10 rounded-xl border border-bodega-accent/20">
      <div className="flex items-center gap-2 mb-2">
        <Users className="w-4 h-4 text-bodega-accent" />
        <span className="text-sm font-medium text-bodega-accent">
          {friendsAtThisBar.length === 1 ? 'En ven' : `${friendsAtThisBar.length} venner`} er her
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {friendsAtThisBar.map((friend) => (
          <Link
            key={friend.userId}
            href={`/user/${friend.userId}`}
            className="flex items-center gap-2 px-2 py-1 bg-black/20 rounded-lg hover:bg-black/30 transition-colors"
          >
            <UserAvatar
              src={friend.user.avatarUrl}
              name={friend.user.displayName}
              size="sm"
            />
            <span className="text-sm text-white">{friend.user.displayName}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
