'use client'

import { useState, useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useGeolocation } from '@/hooks/useGeolocation'
import { useSettings } from '@/hooks/useSettings'
import { ResponsiveNavigation } from '@/components/layout/ResponsiveNavigation'
import { BarListView, SettingsView } from '@/components/views'
import { BodegaLoading } from '@/components/bodega'

const BodegaMapView = dynamic(
  () => import('@/components/views/BodegaMapView').then((mod) => mod.BodegaMapView),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-black">
        <BodegaLoading />
      </div>
    ),
  }
)

interface BarMarker {
  id: number
  _id: string // Convex document ID for reviews
  map_id: number
  name: string
  lat: number | string
  lon: number | string
  street?: string
  city?: string
  phone?: string
  website?: string
  hours?: string
  description?: string
  category?: string
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('map')
  const [selectedBar, setSelectedBar] = useState<BarMarker | null>(null)

  const bars = useQuery(api.bars.list)
  const { coordinates } = useGeolocation()
  const { maxDistance, transportType, setMaxDistance, setTransportType, loaded: settingsLoaded } = useSettings()

  const markers: BarMarker[] = useMemo(() => {
    if (!bars) return []
    return bars.map((bar, index) => ({
      id: index,
      _id: bar._id, // Convex document ID for reviews
      map_id: 1, // Default map ID for the bar list
      name: bar.name,
      lat: bar.lat,
      lon: bar.lon,
      street: bar.street,
      city: bar.city,
      phone: bar.phone,
      website: bar.website,
      hours: bar.hours,
      description: bar.description,
      category: bar.category,
    }))
  }, [bars])

  const handleSelectBar = useCallback((marker: BarMarker) => {
    setSelectedBar(marker)
    setActiveTab('map')
  }, [])

  const handleDeselectBar = useCallback(() => {
    setSelectedBar(null)
  }, [])

  const isLoading = bars === undefined || !settingsLoaded

  if (isLoading) {
    return (
      <main className="flex h-screen items-center justify-center bg-black">
        <BodegaLoading />
      </main>
    )
  }

  return (
    <div className="flex h-screen bg-black">
      {/* Navigation: Bottom tabs on mobile, left sidebar on desktop */}
      <ResponsiveNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main content area */}
      <main className="flex-1 overflow-hidden pb-[64px] lg:pb-0 lg:pl-20">
        {activeTab === 'map' && (
          <BodegaMapView
            markers={markers}
            userLocation={coordinates}
            onSelectBar={handleSelectBar}
            selectedBar={selectedBar}
            onDeselectBar={handleDeselectBar}
            maxDistance={maxDistance}
            transportType={transportType}
          />
        )}

        {activeTab === 'list' && (
          <BarListView
            markers={markers}
            userLocation={coordinates}
            onSelectBar={handleSelectBar}
            maxDistance={maxDistance}
            transportType={transportType}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            maxDistance={maxDistance}
            transportType={transportType}
            onMaxDistanceChange={setMaxDistance}
            onTransportTypeChange={setTransportType}
          />
        )}
      </main>
    </div>
  )
}
