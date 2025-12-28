'use client'

import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { UserAvatar } from '@/components/social'
import { useBarModal } from '@/components/views/BarModalProvider'
import { MapPin, UserPlus, Bell } from 'lucide-react'
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

  const getIcon = () => {
    switch (notification.type) {
      case 'friend_checkin':
        return <MapPin className="w-4 h-4 text-bodega-accent" />
      case 'new_follower':
        return <UserPlus className="w-4 h-4 text-blue-400" />
      default:
        return <Bell className="w-4 h-4 text-gray-400" />
    }
  }

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
      className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${
        notification.read
          ? 'bg-transparent hover:bg-white/[0.04]'
          : 'bg-bodega-accent/10 hover:bg-bodega-accent/15'
      }`}
      onClick={handleClick}
    >
      {/* Avatar or icon */}
      <div className="flex-shrink-0">
        {fromUser ? (
          <UserAvatar
            src={fromUser.avatarUrl}
            name={fromUser.displayName}
            size="md"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-white/[0.06] flex items-center justify-center">
            {getIcon()}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white text-sm">{notification.title}</p>
        <p className="text-sm text-gray-400 line-clamp-2">{notification.body}</p>
        <p className="text-xs text-gray-500 mt-1">{getTimeAgo(notification.createdAt)}</p>
      </div>

      {/* Unread indicator */}
      {!notification.read && (
        <div className="flex-shrink-0 w-2 h-2 rounded-full bg-bodega-accent mt-2" />
      )}
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
