'use client'

import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Star, MapPin, Camera, Users, Heart } from 'lucide-react'

interface ProfileStatsProps {
  clerkId: string
}

export function ProfileStats({ clerkId }: ProfileStatsProps) {
  const stats = useQuery(api.profiles.getProfileStats, { clerkId })

  if (!stats) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-8 w-12 bg-white/[0.06] rounded mb-1 mx-auto" />
            <div className="h-4 w-16 bg-white/[0.06] rounded mx-auto" />
          </div>
        ))}
      </div>
    )
  }

  const statItems = [
    { icon: Star, value: stats.reviewCount, label: 'Anmeldelser' },
    { icon: MapPin, value: stats.checkInCount, label: 'Check-ins' },
    { icon: Camera, value: stats.photoCount, label: 'Fotos' },
    { icon: Heart, value: stats.favoriteCount, label: 'Favoritter' },
    { icon: Users, value: stats.followerCount, label: 'Følgere' },
  ]

  return (
    <div className="grid grid-cols-5 gap-2">
      {statItems.map((stat) => (
        <div key={stat.label} className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <stat.icon className="w-4 h-4 text-bodega-accent" />
            <span className="text-xl font-bold text-white">{stat.value}</span>
          </div>
          <p className="text-xs text-gray-400">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}
