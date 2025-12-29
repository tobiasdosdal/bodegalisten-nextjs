'use client'

import Link from 'next/link'
import { UserAvatar } from '@/components/social'
import { useBarModal } from '@/components/views/BarModalProvider'
import { Star, MapPin, Camera, Heart, Clock } from 'lucide-react'

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
  if (minutes < 60) return `${minutes} min`
  if (hours < 24) return `${hours}t`
  if (days < 7) return `${days}d`

  return new Date(timestamp).toLocaleDateString('da-DK', {
    day: 'numeric',
    month: 'short',
  })
}

function getActivityIcon(type: string) {
  switch (type) {
    case 'review':
      return <Star className="w-4 h-4" />
    case 'checkin':
      return <MapPin className="w-4 h-4" />
    case 'photo':
      return <Camera className="w-4 h-4" />
    case 'favorite':
      return <Heart className="w-4 h-4" />
    default:
      return null
  }
}

function getActivityStyle(type: string) {
  switch (type) {
    case 'review':
      return { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' }
    case 'checkin':
      return { bg: 'bg-green-500/15', text: 'text-green-400', border: 'border-green-500/30' }
    case 'photo':
      return { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30' }
    case 'favorite':
      return { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30' }
    default:
      return { bg: 'bg-stone-500/15', text: 'text-stone-400', border: 'border-stone-500/30' }
  }
}

function getActivityLabel(type: string): string {
  switch (type) {
    case 'review':
      return 'Anmeldelse'
    case 'checkin':
      return 'Check-in'
    case 'photo':
      return 'Billede'
    case 'favorite':
      return 'Favorit'
    default:
      return 'Aktivitet'
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
  const style = getActivityStyle(type)

  return (
    <div className="p-4 bg-bodega-surface rounded-2xl border border-bodega-gold/10 hover:border-bodega-gold/20 transition-all">
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
          {/* Header row with badge and time */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ${style.bg} border ${style.border}`}>
              <span className={style.text}>{getActivityIcon(type)}</span>
              <span className={`text-xs font-medium ${style.text}`}>{getActivityLabel(type)}</span>
            </div>
            <div className="flex items-center gap-1 text-stone-500">
              <Clock className="w-3 h-3" />
              <span className="text-xs">{formatRelativeTime(createdAt)}</span>
            </div>
          </div>

          {/* Activity text */}
          <p className="text-sm mb-1">
            <Link
              href={`/users/${user.clerkId}`}
              className="font-semibold text-bodega-cream hover:text-bodega-gold transition-colors"
            >
              {user.displayName}
            </Link>
            <span className="text-stone-400"> {getActivityText(type)} </span>
            {bar && (
              <button
                onClick={() => openBar(bar._id)}
                className="font-semibold text-bodega-cream hover:text-bodega-gold transition-colors"
              >
                {bar.name}
              </button>
            )}
          </p>

          {/* Location */}
          {bar?.city && (
            <p className="text-xs text-stone-500 mb-2">
              {bar.city}
            </p>
          )}

          {/* Type-specific content */}
          {type === 'review' && data?.rating && (
            <div className="mt-3 p-3 bg-stone-800/30 rounded-xl border border-stone-700/30">
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= data.rating!
                        ? 'fill-bodega-gold text-bodega-gold'
                        : 'text-stone-600'
                    }`}
                  />
                ))}
                <span className="ml-1 text-xs font-medium text-bodega-gold">{data.rating}/5</span>
              </div>
              {data.comment && (
                <p className="text-sm text-stone-300 leading-relaxed line-clamp-3">
                  {data.comment}
                </p>
              )}
            </div>
          )}

          {type === 'checkin' && data?.message && (
            <div className="mt-3 p-3 bg-stone-800/30 rounded-xl border border-stone-700/30">
              <p className="text-sm text-stone-300 italic leading-relaxed">
                &quot;{data.message}&quot;
              </p>
            </div>
          )}

          {type === 'photo' && data?.photoUrl && (
            <div className="mt-3">
              <img
                src={data.photoUrl}
                alt={data.caption || 'Uploaded photo'}
                className="w-full max-w-sm rounded-xl object-cover border border-stone-700/30"
              />
              {data.caption && (
                <p className="mt-2 text-sm text-stone-400">{data.caption}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
