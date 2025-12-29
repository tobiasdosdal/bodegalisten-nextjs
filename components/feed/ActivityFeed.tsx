'use client'

import { useQuery } from 'convex/react'
import { useUser } from '@clerk/nextjs'
import { api } from '@/convex/_generated/api'
import { ActivityItem } from './ActivityItem'
import { Users, Compass, MapPin } from 'lucide-react'
import Link from 'next/link'
import { BodegaLoading } from '@/components/bodega'

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
      <div className="flex items-center justify-center py-16">
        <BodegaLoading />
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center mb-5 border border-bodega-gold/20">
          {type === 'personal' ? (
            <Users className="w-10 h-10 text-bodega-gold" />
          ) : (
            <Compass className="w-10 h-10 text-bodega-gold" />
          )}
        </div>
        {type === 'personal' ? (
          <>
            <h3 className="text-xl font-display font-semibold text-bodega-cream mb-2">
              Ingen aktivitet endnu
            </h3>
            <p className="text-stone-400 mb-5 max-w-xs">
              Følg andre brugere for at se deres check-ins, anmeldelser og billeder her
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-bodega-gold to-amber-500 text-bodega-primary font-semibold text-sm rounded-xl hover:brightness-110 transition-all"
            >
              <MapPin className="w-4 h-4" />
              <span>Find barer</span>
            </Link>
          </>
        ) : (
          <>
            <h3 className="text-xl font-display font-semibold text-bodega-cream mb-2">
              Ingen offentlig aktivitet
            </h3>
            <p className="text-stone-400 max-w-xs">
              Vær den første til at dele noget! Tjek ind på en bar eller del et billede.
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
