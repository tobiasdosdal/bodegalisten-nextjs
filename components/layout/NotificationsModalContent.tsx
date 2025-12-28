'use client'

import { useUser } from '@clerk/nextjs'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { NotificationItem } from '@/components/notifications'
import { Bell, CheckCheck, Loader2 } from 'lucide-react'

export function NotificationsModalContent() {
  const { user, isLoaded } = useUser()

  const notifications = useQuery(
    api.notifications.getAll,
    user?.id ? { userId: user.id } : 'skip'
  )

  const markAllAsRead = useMutation(api.notifications.markAllAsRead)

  if (!isLoaded) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-bodega-accent animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Log ind for at se notifikationer</p>
      </div>
    )
  }

  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0

  const handleMarkAllAsRead = () => {
    if (unreadCount > 0) {
      markAllAsRead({ userId: user.id })
    }
  }

  return (
    <>
      {unreadCount > 0 && (
        <div className="sticky top-0 bg-bodega-surface px-4 py-2 border-b border-white/[0.06]">
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2 text-sm text-bodega-accent hover:text-bodega-accent/80 transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            Marker alle som læst
          </button>
        </div>
      )}
      
      <div className="px-4 py-2">
        {notifications === undefined ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-bodega-accent animate-spin" />
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-1">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                fromUser={notification.fromUser}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/[0.04] flex items-center justify-center">
              <Bell className="w-8 h-8 text-gray-500" />
            </div>
            <p className="text-gray-400">Ingen notifikationer endnu</p>
            <p className="text-sm text-gray-500 mt-1">
              Du får besked når dine venner tjekker ind
            </p>
          </div>
        )}
      </div>
    </>
  )
}
