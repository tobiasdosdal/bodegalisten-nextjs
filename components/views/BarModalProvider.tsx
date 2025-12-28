'use client'

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { useGeolocation } from '@/hooks/useGeolocation'
import { useSettings } from '@/hooks/useSettings'
import { calculateDistance } from '@/lib/utils/distance'
import { Marker } from '@/types'
import { BarDetailModal } from './BarDetailModal'

interface MarkerWithDistance extends Marker {
  distance: number
}

interface BarModalContextType {
  openBar: (barId: string) => void
  closeBar: () => void
  isOpen: boolean
  selectedBarId: string | null
}

const BarModalContext = createContext<BarModalContextType | null>(null)

export function useBarModal() {
  const context = useContext(BarModalContext)
  if (!context) {
    throw new Error('useBarModal must be used within BarModalProvider')
  }
  return context
}

interface BarModalProviderProps {
  children: ReactNode
}

export function BarModalProvider({ children }: BarModalProviderProps) {
  const [selectedBarId, setSelectedBarId] = useState<string | null>(null)
  const [isDesktop, setIsDesktop] = useState(false)
  const { coordinates } = useGeolocation()
  const { transportType } = useSettings()

  const bar = useQuery(
    api.bars.getById,
    selectedBarId ? { id: selectedBarId as Id<'bars'> } : 'skip'
  )

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024)
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  const openBar = useCallback((barId: string) => {
    if (isDesktop) {
      setSelectedBarId(barId)
    } else {
      window.location.href = `/?bar=${barId}`
    }
  }, [isDesktop])

  const closeBar = useCallback(() => {
    setSelectedBarId(null)
  }, [])

  const markerWithDistance: MarkerWithDistance | null = bar ? {
    id: 0,
    _id: bar._id,
    map_id: 1,
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
    distance: calculateDistance(
      coordinates[0],
      coordinates[1],
      bar.lat,
      bar.lon
    ),
  } : null

  return (
    <BarModalContext.Provider value={{ openBar, closeBar, isOpen: !!selectedBarId, selectedBarId }}>
      {children}
      {isDesktop && markerWithDistance && (
        <BarDetailModal
          marker={markerWithDistance}
          onClose={closeBar}
          onNavigate={() => {
            window.location.href = `/?bar=${selectedBarId}`
          }}
          transportType={transportType}
        />
      )}
    </BarModalContext.Provider>
  )
}
