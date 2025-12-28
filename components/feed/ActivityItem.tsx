'use client'

import Link from 'next/link'
import { UserAvatar } from '@/components/social'
import { useBarModal } from '@/components/views/BarModalProvider'
import { Star, MapPin, Camera, Heart } from 'lucide-react'

interface ActivityItemProps {
  activity: {
    _id: string
    userId: string
    type: string
    barId: string
    createdAt: number
    user: {
      clerkId: string
      displayName: string
      avatarUrl?: string | null
    }
    bar: {
      _id: string
      name: string
      city?: string
    } | null
    data?: {
      rating?: number
      comment?: string
      photoUrl?: string
      caption?: string
      message?: string
    }
  }
}

function formatRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Lige nu'
  if (minutes < 60) return `${minutes} min siden`
  if (hours < 24) return `${hours} time${hours > 1 ? 'r' : ''} siden`
  if (days < 7) return `${days} dag${days > 1 ? 'e' : ''} siden`

  return new Date(timestamp).toLocaleDateString('da-DK', {
    day: 'numeric',
    month: 'short',
  })
}

function getActivityIcon(type: string) {
  switch (type) {
    case 'review':
      return <Star className="w-4 h-4 text-yellow-500" />
    case 'checkin':
      return <MapPin className="w-4 h-4 text-green-500" />
    case 'photo':
      return <Camera className="w-4 h-4 text-blue-500" />
    case 'favorite':
      return <Heart className="w-4 h-4 text-red-500" />
    default:
      return null
  }
}

function getActivityText(type: string): string {
  switch (type) {
    case 'review':
      return 'anmeldte'
    case 'checkin':
      return 'tjekkede ind på'
    case 'photo':
      return 'delte et billede fra'
    case 'favorite':
      return 'tilføjede til favoritter'
    default:
      return 'interagerede med'
  }
}

export function ActivityItem({ activity }: ActivityItemProps) {
  const { user, bar, data, type, createdAt } = activity
  const { openBar } = useBarModal()

  return (
    <div className="p-4 bg-white/[0.02] rounded-xl hover:bg-white/[0.04] transition-colors">
      <div className="flex gap-3">
        {/* User avatar */}
        <Link href={`/users/${user.clerkId}`} className="flex-shrink-0">
          <UserAvatar
            src={user.avatarUrl}
            name={user.displayName}
            size="md"
          />
        </Link>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="text-sm">
              <Link
                href={`/users/${user.clerkId}`}
                className="font-medium text-white hover:text-bodega-accent transition-colors"
              >
                {user.displayName}
              </Link>
              <span className="text-gray-400"> {getActivityText(type)} </span>
              {bar && (
                <button
                  onClick={() => openBar(bar._id)}
                  className="font-medium text-white hover:text-bodega-accent transition-colors"
                >
                  {bar.name}
                </button>
              )}
            </p>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {getActivityIcon(type)}
            </div>
          </div>

          {/* Time */}
          <p className="text-xs text-gray-500 mb-2">
            {formatRelativeTime(createdAt)}
            {bar?.city && ` · ${bar.city}`}
          </p>

          {/* Type-specific content */}
          {type === 'review' && data?.rating && (
            <div className="mt-2">
              <div className="flex items-center gap-1 mb-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= data.rating!
                        ? 'fill-yellow-500 text-yellow-500'
                        : 'text-gray-600'
                    }`}
                  />
                ))}
              </div>
              {data.comment && (
                <p className="text-sm text-gray-300 line-clamp-2">
                  {data.comment}
                </p>
              )}
            </div>
          )}

          {type === 'checkin' && data?.message && (
            <p className="mt-2 text-sm text-gray-300 italic">
              &quot;{data.message}&quot;
            </p>
          )}

          {type === 'photo' && data?.photoUrl && (
            <div className="mt-2">
              <img
                src={data.photoUrl}
                alt={data.caption || 'Uploaded photo'}
                className="w-full max-w-xs rounded-lg object-cover"
              />
              {data.caption && (
                <p className="mt-1 text-sm text-gray-400">{data.caption}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
