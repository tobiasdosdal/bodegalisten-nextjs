'use client'

import { useState, useMemo } from 'react'
import { Search, ChevronRight } from 'lucide-react'
import { Marker } from '@/types'
import { BodegaLoading, EmptyState } from '@/components/bodega'
import { calculateDistance, calculateTravelTime, formatTravelTime, TransportType } from '@/lib/utils/distance'

interface BarListViewProps {
  markers: Marker[]
  userLocation: [number, number]
  onSelectBar: (marker: Marker) => void
  isLoading?: boolean
  maxDistance?: number
  transportType?: TransportType
}

interface MarkerWithDistance extends Marker {
  distance: number
}

export function BarListView({ markers, userLocation, onSelectBar, isLoading, maxDistance = 20, transportType = 'walk' }: BarListViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [visibleCount, setVisibleCount] = useState(25)

  const markersWithDistance = useMemo(() => {
    return markers
      .map(marker => ({
        ...marker,
        distance: calculateDistance(
          userLocation[0],
          userLocation[1],
          typeof marker.lat === 'string' ? parseFloat(marker.lat) : marker.lat,
          typeof marker.lon === 'string' ? parseFloat(marker.lon) : marker.lon
        ),
      }))
      .filter(marker => marker.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance) as MarkerWithDistance[]
  }, [markers, userLocation, maxDistance])

  const filteredMarkers = useMemo(() => {
    if (!searchQuery.trim()) return markersWithDistance
    const query = searchQuery.toLowerCase()
    return markersWithDistance.filter(marker =>
      marker.name.toLowerCase().includes(query) ||
      marker.street?.toLowerCase().includes(query) ||
      marker.city?.toLowerCase().includes(query)
    )
  }, [markersWithDistance, searchQuery])

  const visibleMarkers = filteredMarkers.slice(0, visibleCount)
  const hasMore = filteredMarkers.length > visibleCount

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-black">
        <BodegaLoading />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-black">
      <header className="flex-shrink-0 px-4 lg:px-8 pt-14 lg:pt-8 pb-4 lg:pb-6 lg:max-w-2xl lg:mx-auto lg:w-full">
        <h1 className="text-3xl lg:text-3xl font-bold font-bodega-rounded text-white mb-4">
          Barer
        </h1>
        <div className="relative">
          <Search className="absolute left-4 lg:left-4 top-1/2 -translate-y-1/2 w-5 h-5 lg:w-5 lg:h-5 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Søg efter bar..."
            className="w-full pl-12 lg:pl-12 pr-4 py-3 lg:py-3 bg-bodega-surface border border-white/[0.08] rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-bodega-accent/50 text-[17px] lg:text-lg"
          />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 lg:px-8 pb-4 hide-scrollbar lg:max-w-2xl lg:mx-auto lg:w-full">
        {filteredMarkers.length === 0 ? (
          <EmptyState
            icon="wine"
            title="Ingen barer fundet"
            message={searchQuery ? `Ingen resultater for "${searchQuery}"` : "Ingen barer i nærheden"}
          />
        ) : (
          <div className="bg-bodega-surface rounded-bodega-lg overflow-hidden">
            {visibleMarkers.map((marker, index) => (
              <div key={marker.id}>
                <BarRow
                  marker={marker}
                  onSelect={() => onSelectBar(marker)}
                  transportType={transportType}
                />
                {index < visibleMarkers.length - 1 && (
                  <div className="h-px bg-white/[0.06] ml-[72px] lg:ml-[88px]" />
                )}
              </div>
            ))}
            
            {hasMore && (
              <button
                onClick={() => setVisibleCount(prev => prev + 25)}
                className="w-full py-4 lg:py-5 text-bodega-accent text-sm lg:text-base font-medium hover:bg-white/[0.02] lg:hover:bg-white/[0.04] transition-colors"
              >
                Vis flere ({filteredMarkers.length - visibleCount} mere)
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

interface BarRowProps {
  marker: MarkerWithDistance
  onSelect: () => void
  transportType: TransportType
}

function BarRow({ marker, onSelect, transportType }: BarRowProps) {
  const distanceMeters = marker.distance * 1000
  const travelTime = calculateTravelTime(marker.distance, transportType)
  const formattedTime = formatTravelTime(travelTime)
  const formattedDistance = distanceMeters < 1000
    ? `${Math.round(distanceMeters)}m`
    : `${marker.distance.toFixed(1)}km`

  return (
    <button
      onClick={onSelect}
      className="group w-full flex items-center gap-3 lg:gap-4 px-4 lg:px-6 py-4 lg:py-4 active:bg-white/[0.04] hover:bg-white/[0.02] lg:hover:bg-white/[0.04] transition-all active:scale-[0.99] text-left"
    >
      <div className="flex-shrink-0 w-12 h-12 lg:w-14 lg:h-14 rounded-xl bg-bodega-primary flex items-center justify-center">
        <span className="text-2xl lg:text-2xl">🍺</span>
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-white font-semibold text-[17px] lg:text-lg truncate">
          {marker.name}
        </h3>
        <div className="flex items-center gap-1.5 lg:gap-2 text-[14px] lg:text-sm mt-0.5">
          <span className="text-gray-400 truncate">{marker.street}</span>
          {marker.distance !== undefined && (
            <>
              <span className="text-gray-600 text-[10px] lg:text-xs">•</span>
              <span className="text-bodega-accent font-semibold">
                {formattedDistance}
              </span>
              <span className="text-gray-600 text-[10px] lg:text-xs">•</span>
              <span className="text-gray-400">
                {formattedTime}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2.5 flex-shrink-0">
        <ChevronRight className="w-5 h-5 lg:w-5 lg:h-5 text-gray-600 lg:opacity-0 lg:group-hover:opacity-100 lg:transition-opacity" />
      </div>
    </button>
  )
}
