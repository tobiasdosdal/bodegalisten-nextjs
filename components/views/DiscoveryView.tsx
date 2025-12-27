'use client'

import { useState, useMemo, useCallback } from 'react'
import { Dice5, MapPin, Navigation } from 'lucide-react'
import { Marker } from '@/types'
import { BodegaCard } from '@/components/bodega'
import { calculateDistance } from '@/lib/utils/distance'

interface DiscoveryViewProps {
  markers: Marker[]
  userLocation: [number, number]
  onSelectBar: (marker: Marker) => void
}

interface MarkerWithDistance extends Marker {
  distance: number
}

export function DiscoveryView({ markers, userLocation, onSelectBar }: DiscoveryViewProps) {
  const [randomBar, setRandomBar] = useState<MarkerWithDistance | null>(null)

  const markersWithDistance = useMemo(() => {
    return markers.map(marker => ({
      ...marker,
      distance: calculateDistance(
        userLocation[0],
        userLocation[1],
        typeof marker.lat === 'string' ? parseFloat(marker.lat) : marker.lat,
        typeof marker.lon === 'string' ? parseFloat(marker.lon) : marker.lon
      ),
    })) as MarkerWithDistance[]
  }, [markers, userLocation])

  const findRandomBar = useCallback(() => {
    if (markersWithDistance.length === 0) return
    const randomIndex = Math.floor(Math.random() * markersWithDistance.length)
    setRandomBar(markersWithDistance[randomIndex])
  }, [markersWithDistance])

  const handleNavigate = useCallback(() => {
    if (!randomBar) return
    const lat = typeof randomBar.lat === 'string' ? parseFloat(randomBar.lat) : randomBar.lat
    const lon = typeof randomBar.lon === 'string' ? parseFloat(randomBar.lon) : randomBar.lon
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`, '_blank')
  }, [randomBar])

  return (
    <div className="flex flex-col h-full bg-black">
      <header className="flex-shrink-0 px-4 pt-14 pb-4">
        <h1 className="text-bodega-title font-bold font-bodega-rounded text-white">
          Opdag
        </h1>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-4 hide-scrollbar">
        <BodegaCard elevated className="p-4">
          <div className="flex items-start gap-3 mb-4">
            <span className="text-[32px]">🎲</span>
            <div>
              <h2 className="text-bodega-headline font-semibold text-white">
                Tilfældig Bodega
              </h2>
              <p className="text-bodega-caption text-gray-400">
                Lad os vælge en bodega til dig!
              </p>
            </div>
          </div>

          {randomBar ? (
            <RandomBarCard 
              marker={randomBar} 
              onNavigate={handleNavigate}
              onNewRandom={findRandomBar}
              onSelect={() => onSelectBar(randomBar)}
            />
          ) : (
            <button
              onClick={findRandomBar}
              className="w-full flex items-center justify-center gap-2 py-4 bodega-gradient rounded-bodega-md text-white font-semibold transition-transform active:scale-[0.98]"
            >
              <Dice5 className="w-5 h-5" />
              <span>Overrask mig!</span>
            </button>
          )}
        </BodegaCard>
      </main>
    </div>
  )
}

interface RandomBarCardProps {
  marker: MarkerWithDistance
  onNavigate: () => void
  onNewRandom: () => void
  onSelect: () => void
}

function RandomBarCard({ marker, onNavigate, onNewRandom, onSelect }: RandomBarCardProps) {
  const distanceMeters = marker.distance * 1000

  return (
    <div className="space-y-3">
      <button
        onClick={onSelect}
        className="w-full bodega-card-elevated rounded-bodega-lg p-4 text-left transition-transform active:scale-[0.99]"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-bodega-md bg-bodega-accent/10 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-bodega-accent" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-bodega-headline font-semibold text-white truncate">
              {marker.name}
            </h3>
            <div className="flex items-center gap-1 text-bodega-caption text-gray-400">
              <MapPin className="w-2.5 h-2.5" />
              <span className="truncate">{marker.street}</span>
            </div>
          </div>

          <div className="flex-shrink-0 px-2 py-1 bg-bodega-accent/10 rounded-bodega-xs">
            <span className="text-xs font-bold font-mono text-bodega-accent">
              {distanceMeters < 1000 
                ? `${Math.round(distanceMeters)}m` 
                : `${marker.distance.toFixed(1)}km`}
            </span>
          </div>
        </div>
      </button>

      <div className="flex gap-3">
        <button
          onClick={onNavigate}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-bodega-accent/10 border border-bodega-accent/20 rounded-bodega-md text-bodega-accent font-semibold text-sm transition-colors hover:bg-bodega-accent/20"
        >
          <Navigation className="w-4 h-4" />
          <span>Rute</span>
        </button>
        <button
          onClick={onNewRandom}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-bodega-accent/10 border border-bodega-accent/20 rounded-bodega-md text-bodega-accent font-semibold text-sm transition-colors hover:bg-bodega-accent/20"
        >
          <Dice5 className="w-4 h-4" />
          <span>Ny tilfældig</span>
        </button>
      </div>
    </div>
  )
}
