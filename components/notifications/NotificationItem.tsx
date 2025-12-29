'use client'

import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { UserAvatar } from '@/components/social'
import { useBarModal } from '@/components/views/BarModalProvider'
import { MapPin, UserPlus, Bell, Star, Heart, MessageCircle, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { Id } from '@/convex/_generated/dataModel'

interface NotificationItemProps {
  notification: {
    _id: Id<'notifications'>
    type: string
    title: string
    body: string
    url?: string
    fromUserId?: string
    read: boolean
    createdAt: number
  }
  fromUser?: {
    displayName: string
    avatarUrl?: string | null
  } | null
}

const notificationStyles = {
  friend_checkin: {
    icon: MapPin,
    color: 'text-green-400',
    bg: 'bg-green-500/15',
    border: 'border-green-500/25',
  },
  new_follower: {
    icon: UserPlus,
    color: 'text-blue-400',
    bg: 'bg-blue-500/15',
    border: 'border-blue-500/25',
  },
  new_review: {
    icon: Star,
    color: 'text-amber-400',
    bg: 'bg-amber-500/15',
    border: 'border-amber-500/25',
  },
  new_favorite: {
    icon: Heart,
    color: 'text-red-400',
    bg: 'bg-red-500/15',
    border: 'border-red-500/25',
  },
  new_comment: {
    icon: MessageCircle,
    color: 'text-purple-400',
    bg: 'bg-purple-500/15',
    border: 'border-purple-500/25',
  },
  default: {
    icon: Bell,
    color: 'text-bodega-gold',
    bg: 'bg-bodega-gold/15',
    border: 'border-bodega-gold/25',
  },
}

export function NotificationItem({ notification, fromUser }: NotificationItemProps) {
  const markAsRead = useMutation(api.notifications.markAsRead)
  const { openBar } = useBarModal()

  const handleClick = () => {
    if (!notification.read) {
      markAsRead({ notificationId: notification._id })
    }
  }

  const extractBarId = (url: string): string | null => {
    const match = url.match(/[?&]bar=([^&]+)/)
    return match ? match[1] : null
  }

  const handleBarClick = (e: React.MouseEvent) => {
    if (notification.url) {
      const barId = extractBarId(notification.url)
      if (barId) {
        e.preventDefault()
        handleClick()
        openBar(barId)
      }
    }
  }

  const style = notificationStyles[notification.type as keyof typeof notificationStyles] || notificationStyles.default
  const IconComponent = style.icon

  const getTimeAgo = (timestamp: number): string => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return 'Lige nu'
    if (minutes < 60) return `${minutes} min`
    if (hours < 24) return `${hours}t`
    if (days === 1) return 'I går'
    return `${days}d`
  }

  const content = (
    <div
      className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
        notification.read
          ? 'bg-bodega-surface border-bodega-gold/10 hover:bg-bodega-gold/5'
          : 'bg-bodega-gold/10 border-bodega-gold/20 hover:bg-bodega-gold/15'
      }`}
      onClick={handleClick}
    >
      {/* Avatar or icon */}
      <div className="flex-shrink-0">
        {fromUser ? (
          <div className="relative">
            <UserAvatar
              src={fromUser.avatarUrl}
              name={fromUser.displayName}
              size="md"
            />
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${style.bg} flex items-center justify-center border-2 border-bodega-surface`}>
              <IconComponent className={`w-2.5 h-2.5 ${style.color}`} />
            </div>
          </div>
        ) : (
          <div className={`w-10 h-10 rounded-xl ${style.bg} flex items-center justify-center border ${style.border}`}>
            <IconComponent className={`w-5 h-5 ${style.color}`} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-bodega-cream text-sm">{notification.title}</p>
        <p className="text-sm text-stone-400 line-clamp-2 mt-0.5">{notification.body}</p>
        <p className="text-xs text-stone-500 mt-1.5">{getTimeAgo(notification.createdAt)}</p>
      </div>

      {/* Unread indicator or chevron */}
      <div className="flex-shrink-0 flex items-center">
        {!notification.read ? (
          <div className="w-2.5 h-2.5 rounded-full bg-bodega-gold shadow-lg shadow-bodega-gold/30" />
        ) : notification.url ? (
          <ChevronRight className="w-4 h-4 text-stone-600" />
        ) : null}
      </div>
    </div>
  )

  if (notification.url) {
    const barId = extractBarId(notification.url)
    if (barId) {
      return (
        <button onClick={handleBarClick} className="w-full text-left">
          {content}
        </button>
      )
    }
    return (
      <Link href={notification.url} onClick={handleClick}>
        {content}
      </Link>
    )
  }

  return content
}
