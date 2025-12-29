'use client'

import { useUser } from '@clerk/nextjs'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { NotificationItem } from '@/components/notifications'
import { BodegaLoading } from '@/components/bodega'
import { Bell, CheckCheck } from 'lucide-react'

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
        <BodegaLoading />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6">
        <div className="w-16 h-16 rounded-2xl bg-bodega-gold/15 flex items-center justify-center mb-4 border border-bodega-gold/25">
          <Bell className="w-8 h-8 text-bodega-gold" />
        </div>
        <p className="text-stone-400 text-center">
          Log ind for at se notifikationer
        </p>
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
      {/* Header bar with unread count and mark all read */}
      <div className="sticky top-0 z-10 bg-bodega-surface/95 backdrop-blur-sm px-5 py-3 border-b border-bodega-gold/10">
        <div className="flex items-center justify-between">
          <p className="text-sm text-stone-500">
            {unreadCount > 0 ? `${unreadCount} ulæste beskeder` : 'Alle beskeder læst'}
          </p>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-bodega-gold bg-bodega-gold/10 rounded-lg border border-bodega-gold/20 hover:bg-bodega-gold/20 transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Marker alle læst
            </button>
          )}
        </div>
      </div>

      {/* Notifications list */}
      <div className="px-5 py-4">
        {notifications === undefined ? (
          <div className="flex justify-center py-8">
            <BodegaLoading />
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                fromUser={notification.fromUser}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-10 px-4 bg-stone-800/30 rounded-xl border border-stone-700/50">
            <div className="w-14 h-14 rounded-xl bg-bodega-gold/15 flex items-center justify-center mb-3 border border-bodega-gold/25">
              <Bell className="w-7 h-7 text-bodega-gold" />
            </div>
            <p className="text-sm text-bodega-cream font-medium mb-1">Ingen notifikationer</p>
            <p className="text-xs text-stone-500 text-center">
              Du får besked når dine venner tjekker ind
            </p>
          </div>
        )}
      </div>
    </>
  )
}
