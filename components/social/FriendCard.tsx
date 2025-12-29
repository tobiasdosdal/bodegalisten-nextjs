'use client'

import Link from 'next/link'
import { UserAvatar } from './UserAvatar'
import { OnlineStatus } from './OnlineStatus'
import { FollowButton } from './FollowButton'
import { MapPin, Users, ChevronRight } from 'lucide-react'

interface FriendCardProps {
  clerkId: string
  displayName: string
  avatarUrl?: string | null
  bio?: string | null
  lastActiveAt?: number | null
  isOnline: boolean
  isMutual?: boolean
  activeCheckIn?: {
    barId: string
    barName?: string
    message?: string
  } | null
  currentUserId?: string
  showFollowButton?: boolean
}

export function FriendCard({
  clerkId,
  displayName,
  avatarUrl,
  bio,
  lastActiveAt,
  isOnline,
  isMutual,
  activeCheckIn,
  currentUserId,
  showFollowButton = false,
}: FriendCardProps) {
  return (
    <div className="flex items-start gap-3 p-3 bg-bodega-surface rounded-xl border border-bodega-gold/10 hover:bg-bodega-gold/5 transition-colors">
      <Link href={`/user/${clerkId}`} className="relative flex-shrink-0">
        <UserAvatar src={avatarUrl} name={displayName} size="md" />
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-bodega-surface" />
        )}
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Link
            href={`/user/${clerkId}`}
            className="font-semibold text-bodega-cream truncate hover:text-bodega-gold transition-colors"
          >
            {displayName}
          </Link>
          {isMutual && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold text-bodega-gold bg-bodega-gold/15 rounded-full border border-bodega-gold/25">
              <Users className="w-3 h-3" />
              Ven
            </span>
          )}
        </div>

        {bio && (
          <p className="text-sm text-stone-500 truncate mt-0.5">{bio}</p>
        )}

        {activeCheckIn ? (
          <Link
            href={`/?bar=${activeCheckIn.barId}`}
            className="inline-flex items-center gap-1 mt-1.5 px-2 py-1 text-xs font-medium text-green-400 bg-green-500/10 rounded-lg border border-green-500/20 hover:bg-green-500/20 transition-colors"
          >
            <MapPin className="w-3 h-3" />
            <span>På {activeCheckIn.barName}</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        ) : (
          <OnlineStatus
            isOnline={isOnline}
            lastActiveAt={lastActiveAt}
            showLabel
            size="sm"
          />
        )}
      </div>

      {showFollowButton && currentUserId && currentUserId !== clerkId && (
        <FollowButton
          targetUserId={clerkId}
          size="sm"
        />
      )}
    </div>
  )
}
