'use client'

import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { NotificationItem } from '@/components/notifications'
import { BodegaLoading } from '@/components/bodega'
import { ArrowLeft, Bell, CheckCheck } from 'lucide-react'

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
      <div className="flex items-center justify-center min-h-screen bg-background">
        <BodegaLoading />
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex-shrink-0 px-4 lg:px-8 pt-14 lg:pt-8 pb-4 lg:pb-6 lg:max-w-2xl lg:mx-auto lg:w-full">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-full bg-stone-800/50 flex items-center justify-center hover:bg-stone-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-stone-400" />
            </button>
            <div>
              <h1 className="text-3xl lg:text-4xl font-display font-semibold text-bodega-cream tracking-tight">
                Notifikationer
              </h1>
              <p className="text-sm text-stone-500 mt-0.5">
                {unreadCount > 0 ? `${unreadCount} ulæste` : 'Alle læst'}
              </p>
            </div>
          </div>
          <button
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              unreadCount > 0
                ? 'bg-bodega-gold/15 border border-bodega-gold/25 hover:bg-bodega-gold/25 text-bodega-gold'
                : 'bg-stone-800/30 text-stone-600 cursor-not-allowed'
            }`}
            title="Marker alle som læst"
          >
            <CheckCheck className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 lg:px-8 pb-8 lg:max-w-2xl lg:mx-auto lg:w-full">
        {notifications === undefined ? (
          <div className="flex justify-center py-12">
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
          <div className="flex flex-col items-center py-12 px-6 bg-bodega-surface rounded-2xl border border-bodega-gold/10">
            <div className="w-16 h-16 rounded-2xl bg-bodega-gold/15 flex items-center justify-center mb-4 border border-bodega-gold/25">
              <Bell className="w-8 h-8 text-bodega-gold" />
            </div>
            <p className="text-bodega-cream font-medium mb-1">Ingen notifikationer endnu</p>
            <p className="text-sm text-stone-500 text-center">
              Du får besked når dine venner tjekker ind i nærheden
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
