'use client'

import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { UserAvatar } from '@/components/social'
import { Users } from 'lucide-react'
import Link from 'next/link'

interface BarCheckInsProps {
  barId: Id<'bars'>
}

function formatTimeRemaining(expiresAt: number): string {
  const remaining = expiresAt - Date.now()
  const hours = Math.floor(remaining / 3600000)
  const minutes = Math.floor((remaining % 3600000) / 60000)

  if (hours > 0) {
    return `${hours}t ${minutes}m`
  }
  return `${minutes}m`
}

export function BarCheckIns({ barId }: BarCheckInsProps) {
  const checkIns = useQuery(api.checkIns.getActiveByBar, { barId })

  if (checkIns === undefined) {
    return null // Loading silently
  }

  if (checkIns.length === 0) {
    return null // Don't show section if empty
  }

  return (
    <div className="border-t border-white/[0.06] pt-4">
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-4 h-4 text-green-500" />
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
          Her nu ({checkIns.length})
        </h3>
      </div>

      <div className="space-y-2">
        {checkIns.slice(0, 5).map((checkIn) => (
          <Link
            key={checkIn._id}
            href={`/users/${checkIn.user.clerkId}`}
            className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-white/[0.04] transition-colors"
          >
            <UserAvatar
              src={checkIn.user.avatarUrl}
              name={checkIn.user.displayName}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {checkIn.user.displayName}
              </p>
              {checkIn.message && (
                <p className="text-xs text-gray-400 truncate">
                  {checkIn.message}
                </p>
              )}
            </div>
            <span className="text-xs text-gray-500">
              {formatTimeRemaining(checkIn.expiresAt)}
            </span>
          </Link>
        ))}

        {checkIns.length > 5 && (
          <p className="text-xs text-gray-500 text-center py-1">
            +{checkIns.length - 5} flere
          </p>
        )}
      </div>
    </div>
  )
}
