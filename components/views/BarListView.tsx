'use client'

import { useState, useMemo, useEffect } from 'react'
import { Search, ChevronRight, MapPin, Footprints } from 'lucide-react'
import { Marker } from '@/types'
import { BodegaLoading, EmptyState } from '@/components/bodega'
import { useBarModal } from '@/components/views/BarModalProvider'
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

type DistanceSection = {
  title: string
  subtitle: string
  markers: MarkerWithDistance[]
}

export function BarListView({ markers, userLocation, onSelectBar, isLoading, maxDistance = 20, transportType = 'walk' }: BarListViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [visibleCount, setVisibleCount] = useState(30)
  const [isDesktop, setIsDesktop] = useState(false)
  const { openBar } = useBarModal()

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024)
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  const handleSelectBar = (marker: Marker) => {
    if (isDesktop && marker._id) {
      openBar(marker._id)
    } else {
      onSelectBar(marker)
    }
  }

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

  // Group markers by distance sections
  const sections = useMemo((): DistanceSection[] => {
    const nearby = filteredMarkers.filter(m => m.distance < 0.5)
    const walking = filteredMarkers.filter(m => m.distance >= 0.5 && m.distance < 1)
    const further = filteredMarkers.filter(m => m.distance >= 1 && m.distance < 2)
    const far = filteredMarkers.filter(m => m.distance >= 2)

    const result: DistanceSection[] = []
    if (nearby.length > 0) result.push({ title: 'Lige om hjørnet', subtitle: '< 500m', markers: nearby })
    if (walking.length > 0) result.push({ title: 'Gåafstand', subtitle: '500m - 1km', markers: walking })
    if (further.length > 0) result.push({ title: 'Kort gåtur', subtitle: '1 - 2km', markers: further })
    if (far.length > 0) result.push({ title: 'Længere væk', subtitle: '> 2km', markers: far })

    return result
  }, [filteredMarkers])

  // Flatten sections for pagination
  const allMarkersFlat = sections.flatMap(s => s.markers)
  const hasMore = allMarkersFlat.length > visibleCount

  // Get visible sections with their markers
  const visibleSections = useMemo(() => {
    let remaining = visibleCount
    return sections.map(section => {
      const visibleInSection = section.markers.slice(0, remaining)
      remaining -= visibleInSection.length
      return { ...section, markers: visibleInSection }
    }).filter(s => s.markers.length > 0)
  }, [sections, visibleCount])

  const nearbyCount = filteredMarkers.filter(m => m.distance < 1).length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-black">
        <BodegaLoading />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <header className="flex-shrink-0 px-4 lg:px-8 pt-14 lg:pt-8 pb-4 lg:pb-6 lg:max-w-2xl lg:mx-auto lg:w-full">
        <div className="mb-4">
          <h1 className="text-3xl lg:text-4xl font-display font-semibold text-bodega-cream tracking-tight">
            Barer
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            {filteredMarkers.length} barer{nearbyCount > 0 && ` • ${nearbyCount} inden for 1km`}
          </p>
        </div>
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500 group-focus-within:text-bodega-gold transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Søg efter bar..."
            className="w-full pl-12 pr-4 py-3.5 bg-stone-800/50 border border-stone-700/50 rounded-xl text-bodega-cream placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-bodega-gold/40 focus:border-bodega-gold/30 focus:bg-stone-800/70 text-[17px] lg:text-lg transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors"
            >
              <span className="text-sm">Ryd</span>
            </button>
          )}
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
          <div className="space-y-4">
            {visibleSections.map((section) => (
              <div key={section.title}>
                {/* Section header */}
                <div className="flex items-baseline justify-between mb-2 px-1">
                  <h2 className="text-sm font-semibold text-bodega-cream">{section.title}</h2>
                  <span className="text-xs text-stone-500">{section.subtitle}</span>
                </div>

                {/* Section content */}
                <div className="bg-bodega-surface rounded-2xl overflow-hidden border border-bodega-gold/10">
                  {section.markers.map((marker, index) => (
                    <div key={marker.id}>
                      <BarRow
                        marker={marker}
                        onSelect={() => handleSelectBar(marker)}
                        transportType={transportType}
                      />
                      {index < section.markers.length - 1 && (
                        <div className="h-px bg-stone-800/80 ml-[72px] lg:ml-[88px]" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {hasMore && (
              <button
                onClick={() => setVisibleCount(prev => prev + 30)}
                className="w-full py-4 text-bodega-gold text-sm font-medium bg-bodega-surface rounded-xl border border-bodega-gold/10 hover:bg-bodega-gold/5 active:scale-[0.99] transition-all"
              >
                Vis flere ({allMarkersFlat.length - visibleCount} mere)
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
      className="group w-full flex items-center gap-3 lg:gap-4 px-4 lg:px-5 py-3.5 lg:py-4 active:bg-bodega-gold/5 hover:bg-bodega-gold/[0.03] lg:hover:bg-bodega-gold/5 transition-all active:scale-[0.99] text-left"
    >
      <div className="flex-shrink-0 w-12 h-12 lg:w-14 lg:h-14 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg">
        <span className="text-2xl" style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.3))' }}>🍺</span>
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-bodega-cream font-semibold text-[16px] lg:text-lg truncate group-hover:text-bodega-gold transition-colors">
          {marker.name}
        </h3>
        <p className="text-sm text-stone-500 truncate mt-0.5">
          {marker.street}
        </p>
        {marker.distance !== undefined && (
          <div className="flex items-center gap-2 mt-2">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-bodega-gold/10 rounded-full">
              <MapPin className="w-3 h-3 text-bodega-gold" />
              <span className="text-xs font-medium text-bodega-gold">{formattedDistance}</span>
            </div>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-stone-800/50 rounded-full">
              <Footprints className="w-3 h-3 text-stone-400" />
              <span className="text-xs text-stone-400">{formattedTime}</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center flex-shrink-0">
        <ChevronRight className="w-5 h-5 text-stone-600 group-hover:text-bodega-gold transition-colors" />
      </div>
    </button>
  )
}
