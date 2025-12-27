'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin, Search, Loader2 } from 'lucide-react'

interface LocationPickerProps {
  lat: number
  lon: number
  onLocationChange: (lat: number, lon: number) => void
  onAddressFound?: (address: { street?: string; city?: string; postalCode?: string }) => void
}

async function geocodeAddress(query: string): Promise<{ lat: number; lon: number; address: { street?: string; city?: string; postalCode?: string } } | null> {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`,
    { headers: { 'User-Agent': 'Bodegalisten/1.0' } }
  )
  const data = await response.json()
  
  if (data.length === 0) return null
  
  const result = data[0]
  const addr = result.address || {}
  
  return {
    lat: parseFloat(result.lat),
    lon: parseFloat(result.lon),
    address: {
      street: addr.road ? `${addr.road}${addr.house_number ? ' ' + addr.house_number : ''}` : undefined,
      city: addr.city || addr.town || addr.village || addr.municipality,
      postalCode: addr.postcode,
    }
  }
}

async function reverseGeocode(lat: number, lon: number): Promise<{ street?: string; city?: string; postalCode?: string } | null> {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,
    { headers: { 'User-Agent': 'Bodegalisten/1.0' } }
  )
  const data = await response.json()
  
  if (!data.address) return null
  
  const addr = data.address
  return {
    street: addr.road ? `${addr.road}${addr.house_number ? ' ' + addr.house_number : ''}` : undefined,
    city: addr.city || addr.town || addr.village || addr.municipality,
    postalCode: addr.postcode,
  }
}

export function LocationPicker({ lat, lon, onLocationChange, onAddressFound }: LocationPickerProps) {
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState('')
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const container = containerRef.current

    const initMap = async () => {
      const L = (await import('leaflet')).default

      if (!container || mapRef.current) return

      const existingMap = (container as HTMLElement & { _leaflet_id?: number })._leaflet_id
      if (existingMap) return

      const map = L.map(container).setView([lat, lon], 15)

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
      }).addTo(map)

      const markerIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <svg width="32" height="42" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 26 16 26s16-14 16-26c0-8.84-7.16-16-16-16z" fill="#ef4444"/>
            <circle cx="16" cy="16" r="8" fill="white"/>
          </svg>
        `,
        iconSize: [32, 42],
        iconAnchor: [16, 42],
      })

      const marker = L.marker([lat, lon], { icon: markerIcon, draggable: true }).addTo(map)

      marker.on('dragend', async () => {
        const pos = marker.getLatLng()
        onLocationChange(pos.lat, pos.lng)
        if (onAddressFound) {
          const address = await reverseGeocode(pos.lat, pos.lng)
          if (address) onAddressFound(address)
        }
      })

      map.on('click', async (e: L.LeafletMouseEvent) => {
        const { lat: newLat, lng: newLon } = e.latlng
        marker.setLatLng([newLat, newLon])
        onLocationChange(newLat, newLon)
        if (onAddressFound) {
          const address = await reverseGeocode(newLat, newLon)
          if (address) onAddressFound(address)
        }
      })

      mapRef.current = map
      markerRef.current = marker
      setMapReady(true)

      setTimeout(() => map.invalidateSize(), 100)
      setTimeout(() => map.invalidateSize(), 300)
    }

    initMap()
  }, [])

  useEffect(() => {
    if (markerRef.current && mapRef.current && mapReady) {
      markerRef.current.setLatLng([lat, lon])
      mapRef.current.setView([lat, lon])
    }
  }, [lat, lon, mapReady])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setError('')

    try {
      const result = await geocodeAddress(searchQuery)
      if (result) {
        onLocationChange(result.lat, result.lon)
        if (onAddressFound) onAddressFound(result.address)
        if (mapRef.current && markerRef.current) {
          mapRef.current.setView([result.lat, result.lon], 17)
          markerRef.current.setLatLng([result.lat, result.lon])
        }
      } else {
        setError('Adresse ikke fundet')
      }
    } catch {
      setError('Fejl ved søgning')
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
            placeholder="Søg adresse eller sted..."
            className="w-full px-4 py-2.5 bg-white/[0.06] border border-white/[0.1] rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-bodega-accent focus:border-transparent pr-10"
          />
          <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        </div>
        <button
          type="button"
          onClick={handleSearch}
          disabled={isSearching}
          className="px-4 py-2.5 bg-bodega-accent text-white rounded-xl hover:bg-bodega-accent/90 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Søg
        </button>
      </div>
      
      {error && <p className="text-sm text-red-400">{error}</p>}
      
      <div 
        ref={containerRef} 
        className="w-full h-[300px] rounded-xl overflow-hidden border border-white/[0.1]"
        style={{ background: '#1a1a2e' }}
      />

      {!mapReady && (
        <div className="flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-bodega-accent border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      <p className="text-xs text-gray-500">
        Klik på kortet eller træk markøren for at vælge placering
      </p>
    </div>
  )
}
