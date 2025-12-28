'use client'

import { useQuery } from 'convex/react'
import { useUser } from '@clerk/nextjs'
import { api } from '@/convex/_generated/api'
import { ActivityItem } from './ActivityItem'
import { Loader2, Rss } from 'lucide-react'
import Link from 'next/link'

interface ActivityFeedProps {
  type: 'personal' | 'discover'
}

export function ActivityFeed({ type }: ActivityFeedProps) {
  const { user } = useUser()

  const personalFeed = useQuery(
    api.feed.getPersonalFeed,
    type === 'personal' && user?.id ? { userId: user.id, limit: 30 } : 'skip'
  )

  const publicFeed = useQuery(
    api.feed.getPublicFeed,
    type === 'discover' ? { limit: 30 } : 'skip'
  )

  const activities = type === 'personal' ? personalFeed : publicFeed
  const isLoading = activities === undefined

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-bodega-accent animate-spin" />
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-white/[0.06] flex items-center justify-center mb-4">
          <Rss className="w-8 h-8 text-gray-500" />
        </div>
        {type === 'personal' ? (
          <>
            <h3 className="text-lg font-medium text-white mb-2">
              Ingen aktivitet endnu
            </h3>
            <p className="text-gray-400 mb-4">
              Følg andre brugere for at se deres aktivitet her
            </p>
            <Link
              href="/"
              className="text-bodega-accent hover:underline"
            >
              Find barer og brugere
            </Link>
          </>
        ) : (
          <>
            <h3 className="text-lg font-medium text-white mb-2">
              Ingen offentlig aktivitet
            </h3>
            <p className="text-gray-400">
              Vær den første til at dele noget!
            </p>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <ActivityItem key={activity._id} activity={activity} />
      ))}
    </div>
  )
}
