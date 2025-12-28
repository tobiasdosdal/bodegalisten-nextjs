'use client'

import { useState, useMemo } from 'react'
import { Search, ChevronRight } from 'lucide-react'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useGeolocation } from '@/hooks/useGeolocation'
import { useSettings } from '@/hooks/useSettings'
import { useBarModal } from '@/components/views/BarModalProvider'
import { BodegaLoading } from '@/components/bodega'
import { calculateDistance, calculateTravelTime, formatTravelTime } from '@/lib/utils/distance'

interface BarWithDistance {
  _id: string
  name: string
  lat: number
  lon: number
  street?: string
  city?: string
  distance: number
}

export function ListModalContent() {
  const [searchQuery, setSearchQuery] = useState('')
  const [visibleCount, setVisibleCount] = useState(15)
  const { openBar } = useBarModal()
  const { coordinates } = useGeolocation()
  const { maxDistance, transportType } = useSettings()

  const bars = useQuery(api.bars.list)

  const barsWithDistance = useMemo(() => {
    if (!bars) return []
    return bars
      .map(bar => ({
        ...bar,
        distance: calculateDistance(
          coordinates[0],
          coordinates[1],
          bar.lat,
          bar.lon
        ),
      }))
      .filter(bar => bar.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance) as BarWithDistance[]
  }, [bars, coordinates, maxDistance])

  const filteredBars = useMemo(() => {
    if (!searchQuery.trim()) return barsWithDistance
    const query = searchQuery.toLowerCase()
    return barsWithDistance.filter(bar =>
      bar.name.toLowerCase().includes(query) ||
      bar.street?.toLowerCase().includes(query) ||
      bar.city?.toLowerCase().includes(query)
    )
  }, [barsWithDistance, searchQuery])

  const visibleBars = filteredBars.slice(0, visibleCount)
  const hasMore = filteredBars.length > visibleCount

  if (bars === undefined) {
    return (
      <div className="flex justify-center py-12">
        <BodegaLoading />
      </div>
    )
  }

  return (
    <>
      <div className="sticky top-0 bg-bodega-surface px-4 py-3 border-b border-white/[0.06]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Søg efter bar..."
            className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-bodega-accent/50 text-sm"
          />
        </div>
      </div>

      {filteredBars.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">
            {searchQuery ? `Ingen resultater for "${searchQuery}"` : 'Ingen barer i nærheden'}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-white/[0.06]">
          {visibleBars.map((bar) => {
            const distanceMeters = bar.distance * 1000
            const travelTime = calculateTravelTime(bar.distance, transportType)
            const formattedTime = formatTravelTime(travelTime)
            const formattedDistance = distanceMeters < 1000
              ? `${Math.round(distanceMeters)}m`
              : `${bar.distance.toFixed(1)}km`

            return (
              <button
                key={bar._id}
                onClick={() => openBar(bar._id)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.04] transition-colors text-left"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-bodega-primary flex items-center justify-center">
                  <span className="text-lg">🍺</span>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium text-sm truncate">
                    {bar.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs mt-0.5">
                    <span className="text-gray-400 truncate">{bar.street}</span>
                    <span className="text-gray-600">•</span>
                    <span className="text-bodega-accent font-medium">{formattedDistance}</span>
                    <span className="text-gray-600">•</span>
                    <span className="text-gray-400">{formattedTime}</span>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
              </button>
            )
          })}

          {hasMore && (
            <button
              onClick={() => setVisibleCount(prev => prev + 15)}
              className="w-full py-3 text-bodega-accent text-sm font-medium hover:bg-white/[0.02] transition-colors"
            >
              Vis flere ({filteredBars.length - visibleCount} mere)
            </button>
          )}
        </div>
      )}
    </>
  )
}
