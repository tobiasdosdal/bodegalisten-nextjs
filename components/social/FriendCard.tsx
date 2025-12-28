'use client'

import Link from 'next/link'
import { UserAvatar } from './UserAvatar'
import { OnlineStatus } from './OnlineStatus'
import { FollowButton } from './FollowButton'
import { MapPin, Users } from 'lucide-react'

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
    <div className="flex items-start gap-3 p-3 bg-white/[0.04] rounded-xl hover:bg-white/[0.06] transition-colors">
      <Link href={`/user/${clerkId}`} className="relative flex-shrink-0">
        <UserAvatar src={avatarUrl} name={displayName} size="md" />
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-black" />
        )}
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Link
            href={`/user/${clerkId}`}
            className="font-medium text-white truncate hover:underline"
          >
            {displayName}
          </Link>
          {isMutual && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-bodega-accent bg-bodega-accent/20 rounded-full">
              <Users className="w-3 h-3" />
              Ven
            </span>
          )}
        </div>

        {bio && (
          <p className="text-sm text-gray-400 truncate mt-0.5">{bio}</p>
        )}

        {activeCheckIn ? (
          <Link
            href={`/?bar=${activeCheckIn.barId}`}
            className="flex items-center gap-1 mt-1 text-xs text-bodega-accent hover:underline"
          >
            <MapPin className="w-3 h-3" />
            <span>På {activeCheckIn.barName}</span>
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
