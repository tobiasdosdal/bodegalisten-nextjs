'use client'

import { useEffect, useRef } from 'react'
import { useUser } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Bell } from 'lucide-react'
import Link from 'next/link'

export function NotificationBell() {
  const { user } = useUser()
  const prevCountRef = useRef<number>(0)

  const unreadCount = useQuery(
    api.notifications.getUnreadCount,
    user?.id ? { userId: user.id } : 'skip'
  )

  // Trigger browser notification when new notifications arrive
  useEffect(() => {
    if (unreadCount === undefined || unreadCount === 0) return
    if (unreadCount <= prevCountRef.current) {
      prevCountRef.current = unreadCount
      return
    }

    prevCountRef.current = unreadCount

    // Request permission and show notification
    if ('Notification' in window && Notification.permission === 'granted') {
      // We could show a notification here, but we'd need the actual notification content
      // For now, just play a sound or badge update would happen
    }
  }, [unreadCount])

  if (!user) return null

  return (
    <Link
      href="/notifications"
      className="relative w-10 h-10 rounded-full bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.1] transition-colors"
    >
      <Bell className="w-5 h-5 text-white" />
      {unreadCount !== undefined && unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1.5 flex items-center justify-center text-xs font-bold text-white bg-red-500 rounded-full">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  )
}
