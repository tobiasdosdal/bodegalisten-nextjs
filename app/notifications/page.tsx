'use client'

import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { NotificationItem } from '@/components/notifications'
import { ArrowLeft, Bell, CheckCheck, Loader2 } from 'lucide-react'

export default function NotificationsPage() {
  const router = useRouter()
  const { user, isLoaded } = useUser()

  const notifications = useQuery(
    api.notifications.getAll,
    user?.id ? { userId: user.id } : 'skip'
  )

  const markAllAsRead = useMutation(api.notifications.markAllAsRead)

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="w-8 h-8 text-bodega-accent animate-spin" />
      </div>
    )
  }

  if (!user) {
    router.push('/profile')
    return null
  }

  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0

  const handleMarkAllAsRead = () => {
    if (unreadCount > 0) {
      markAllAsRead({ userId: user.id })
    }
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.1] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-lg font-semibold text-white">Notifikationer</h1>
          <button
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              unreadCount > 0
                ? 'bg-white/[0.06] hover:bg-white/[0.1] text-white'
                : 'bg-transparent text-gray-600 cursor-not-allowed'
            }`}
            title="Marker alle som læst"
          >
            <CheckCheck className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Content */}
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
              Du får besked når dine venner tjekker ind i nærheden
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
