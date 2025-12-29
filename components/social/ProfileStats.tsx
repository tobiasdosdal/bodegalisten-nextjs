'use client'

import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Star, MapPin, Camera, Users, Heart } from 'lucide-react'

interface ProfileStatsProps {
  clerkId: string
  compact?: boolean
}

export function ProfileStats({ clerkId, compact = false }: ProfileStatsProps) {
  const stats = useQuery(api.profiles.getProfileStats, { clerkId })

  if (!stats) {
    return (
      <div className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-8 bg-stone-800/50 rounded-lg mb-1" />
            <div className="h-5 w-8 bg-stone-800/50 rounded mb-1" />
            <div className="h-3 w-12 bg-stone-800/50 rounded" />
          </div>
        ))}
      </div>
    )
  }

  const statItems = [
    { icon: Star, value: stats.reviewCount, label: 'Anmeldelser', color: 'text-amber-400', bg: 'bg-amber-500/15' },
    { icon: MapPin, value: stats.checkInCount, label: 'Check-ins', color: 'text-green-400', bg: 'bg-green-500/15' },
    { icon: Camera, value: stats.photoCount, label: 'Fotos', color: 'text-blue-400', bg: 'bg-blue-500/15' },
    { icon: Heart, value: stats.favoriteCount, label: 'Favoritter', color: 'text-red-400', bg: 'bg-red-500/15' },
    { icon: Users, value: stats.followerCount, label: 'Følgere', color: 'text-bodega-gold', bg: 'bg-bodega-gold/15' },
  ]

  return (
    <div className="grid grid-cols-5 gap-1">
      {statItems.map((stat) => (
        <div key={stat.label} className="flex flex-col items-center text-center p-2 rounded-xl hover:bg-stone-800/30 transition-colors">
          <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center mb-1.5`}>
            <stat.icon className={`w-4 h-4 ${stat.color}`} />
          </div>
          <span className="text-lg font-bold text-bodega-cream">{stat.value}</span>
          <p className="text-[10px] text-stone-500 leading-tight">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}
