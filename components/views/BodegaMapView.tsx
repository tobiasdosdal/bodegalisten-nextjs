'use client'

import { useState, useMemo, useCallback, useRef, useEffect, KeyboardEvent } from 'react'
import { Dice5, Navigation, X, MapPin, Clock, Phone, Globe } from 'lucide-react'
import { Marker } from '@/types'
import { calculateDistance, calculateTravelTime, formatTravelTime, TransportType } from '@/lib/utils/distance'
import { BarDetailPanel } from './BarDetailPanel'
import { ReviewsList } from '@/components/bodega'
import { Id } from '@/convex/_generated/dataModel'

// Helper to strip HTML and check if content has real text
function stripHtml(html: string | undefined): string {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '').trim()
}

function hasContent(value: string | undefined): boolean {
  return stripHtml(value).length > 0
}

interface BodegaMapViewProps {
  markers: Marker[]
  userLocation: [number, number]
  onSelectBar: (marker: Marker) => void
  selectedBar: Marker | null
  onDeselectBar: () => void
  maxDistance: number
  transportType?: TransportType
}

interface MarkerWithDistance extends Marker {
  distance: number
}

export function BodegaMapView({
  markers,
  userLocation,
  onSelectBar,
  selectedBar,
  onDeselectBar,
  maxDistance,
  transportType = 'walk',
}: BodegaMapViewProps) {
  const [mapReady, setMapReady] = useState(false)
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markersLayerRef = useRef<L.LayerGroup | null>(null)
  const userMarkerRef = useRef<L.Marker | null>(null)
  const routeLayerRef = useRef<L.Polyline | null>(null)

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

  const selectedBarWithDistance = useMemo(() => {
    if (!selectedBar) return null
    return markersWithDistance.find(m => m.id === selectedBar.id) || null
  }, [selectedBar, markersWithDistance])

  // Clear route when bar is deselected
  useEffect(() => {
    if (!selectedBar && routeLayerRef.current) {
      routeLayerRef.current.remove()
      routeLayerRef.current = null
    }
  }, [selectedBar])

  const handleRandomBar = useCallback(() => {
    if (markersWithDistance.length === 0) return
    const randomIndex = Math.floor(Math.random() * markersWithDistance.length)
    onSelectBar(markersWithDistance[randomIndex])
  }, [markersWithDistance, onSelectBar])

  const handleNavigate = useCallback(async () => {
    if (!selectedBar || !mapRef.current) return

    const L = require('leaflet') as typeof import('leaflet')
    const map = mapRef.current
    const lat = typeof selectedBar.lat === 'string' ? parseFloat(selectedBar.lat) : selectedBar.lat
    const lon = typeof selectedBar.lon === 'string' ? parseFloat(selectedBar.lon) : selectedBar.lon

    // Map transport type to OSRM profile
    const osrmProfile = transportType === 'walk' ? 'foot' : transportType === 'bike' ? 'bike' : 'car'

    // Remove existing route
    if (routeLayerRef.current) {
      routeLayerRef.current.remove()
      routeLayerRef.current = null
    }

    try {
      // Fetch route from OSRM using selected transport type
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/${osrmProfile}/${userLocation[1]},${userLocation[0]};${lon},${lat}?overview=full&geometries=geojson`
      )
      const data = await response.json()

      if (data.routes && data.routes[0]) {
        const coordinates = data.routes[0].geometry.coordinates.map(
          (coord: [number, number]) => [coord[1], coord[0]] as [number, number]
        )

        // Draw the route
        routeLayerRef.current = L.polyline(coordinates, {
          color: '#3b82f6',
          weight: 4,
          opacity: 0.8,
          dashArray: '10, 10',
        }).addTo(map)

        // Fit map to show both user and destination
        const bounds = L.latLngBounds([userLocation, [lat, lon]])
        map.fitBounds(bounds, { padding: [50, 50] })
      }
    } catch (error) {
      console.error('Failed to fetch route:', error)
      // Fallback: just zoom to the bar
      map.setView([lat, lon], 17)
    }
  }, [selectedBar, userLocation, transportType])

  useEffect(() => {
    if (!mapContainerRef.current) return
    
    let map: L.Map | null = null
    let cancelled = false

    const initMap = async () => {
      const L = (await import('leaflet')).default

      if (cancelled || !mapContainerRef.current) return
      
      const containerWithLeaflet = mapContainerRef.current as HTMLElement & { _leaflet_id?: number }
      const alreadyInitialized = !!containerWithLeaflet._leaflet_id
      if (alreadyInitialized) return

      map = L.map(mapContainerRef.current, {
        center: userLocation,
        zoom: 13,
        zoomControl: false,
      })

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map)

      mapRef.current = map
      markersLayerRef.current = L.layerGroup().addTo(map)
      setMapReady(true)
    }

    initMap()

    return () => {
      cancelled = true
      if (map) {
        map.remove()
      }
      mapRef.current = null
      markersLayerRef.current = null
    }
  }, [])

  // User location marker effect
  useEffect(() => {
    if (!mapRef.current || !mapReady) return

    const L = require('leaflet') as typeof import('leaflet')
    const map = mapRef.current

    // Remove existing user marker
    if (userMarkerRef.current) {
      userMarkerRef.current.remove()
    }

    // Create user location marker
    const userIcon = L.divIcon({
      className: 'user-location-marker',
      html: `<div class="user-location-inner"><div class="user-location-dot"></div></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    })

    userMarkerRef.current = L.marker(userLocation, {
      icon: userIcon,
      interactive: false,
      zIndexOffset: 1000,
    }).addTo(map)

    // Center map on user location
    map.setView(userLocation, map.getZoom())

  }, [userLocation, mapReady])

  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current || !mapReady) return

    const L = require('leaflet') as typeof import('leaflet')
    const map = mapRef.current
    const LABEL_ZOOM_THRESHOLD = 15

    const updateMarkers = () => {
      markersLayerRef.current!.clearLayers()
      const currentZoom = map.getZoom()
      const showLabels = currentZoom >= LABEL_ZOOM_THRESHOLD

      markersWithDistance.forEach((marker) => {
        const lat = typeof marker.lat === 'string' ? parseFloat(marker.lat) : marker.lat
        const lon = typeof marker.lon === 'string' ? parseFloat(marker.lon) : marker.lon
        const isSelected = selectedBar?.id === marker.id

        const distanceMeters = marker.distance * 1000
        const distanceText = distanceMeters < 1000
          ? `${Math.round(distanceMeters)}m`
          : `${marker.distance.toFixed(1)}km`

        const size = isSelected ? 36 : 28
        const icon = L.divIcon({
          className: 'bodega-marker',
          html: `<div class="bodega-marker-inner ${isSelected ? 'selected' : ''}" style="width:${size}px;height:${size}px;">🍺</div>`,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        })

        const markerElement = L.marker([lat, lon], {
          icon,
          interactive: true,
          bubblingMouseEvents: false,
        })

        // Add permanent label with bar name and distance (only when zoomed in)
        if (showLabels) {
          markerElement.bindTooltip(
            `<div>${marker.name}</div><div class="distance">${distanceText}</div>`,
            {
              permanent: true,
              direction: 'center',
              offset: [0, size / 2 + 24],
              className: 'bodega-label',
            }
          )
        }

        // Use click handler for selection
        markerElement.on('click', (e) => {
          L.DomEvent.stopPropagation(e)
          onSelectBar(marker)
        })

        markersLayerRef.current!.addLayer(markerElement)
      })
    }

    updateMarkers()

    // Update markers when zoom changes
    map.on('zoomend', updateMarkers)

    return () => {
      map.off('zoomend', updateMarkers)
    }
  }, [markersWithDistance, selectedBar, onSelectBar, mapReady])

  return (
    <div className="relative h-full w-full lg:flex">
      {/* Map container */}
      <div className="absolute inset-0 lg:relative lg:flex-1">
        <div
          ref={mapContainerRef}
          className="absolute inset-0 z-0"
          style={{ background: '#0f1412' }}
        />

        {!mapReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
            <div className="w-8 h-8 border-2 border-bodega-accent border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Mobile FABs - hidden when bottom sheet is visible */}
        <div className={`lg:hidden ${selectedBarWithDistance ? 'hidden' : ''}`}>
          <button
            onClick={handleRandomBar}
            aria-label="Vælg tilfældig bar"
            className="absolute bottom-3 left-4 z-20 w-12 h-12 rounded-full bg-bodega-primary flex items-center justify-center shadow-bodega-card transition-transform active:scale-95 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <Dice5 className="w-5 h-5 text-white" aria-hidden="true" />
          </button>

          <button
            onClick={() => {
              if (mapRef.current) {
                mapRef.current.setView(userLocation, 14)
              }
            }}
            aria-label="Centrer kort på min placering"
            className="absolute bottom-3 right-4 z-20 w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-bodega-card transition-transform active:scale-95 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-bodega-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <Navigation className="w-5 h-5 text-bodega-primary" aria-hidden="true" />
          </button>
        </div>

        {/* Desktop FABs - in sidebar area, stacked vertically */}
        <div className="hidden lg:flex fixed left-0 bottom-8 w-20 flex-col items-center gap-3 z-50">
          <button
            onClick={handleRandomBar}
            aria-label="Vælg tilfældig bar"
            className="w-12 h-12 rounded-full bg-bodega-primary flex items-center justify-center shadow-bodega-card transition-transform active:scale-95 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <Dice5 className="w-5 h-5 text-white" aria-hidden="true" />
          </button>

          <button
            onClick={() => {
              if (mapRef.current) {
                mapRef.current.setView(userLocation, 14)
              }
            }}
            aria-label="Centrer kort på min placering"
            className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-bodega-card transition-transform active:scale-95 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-bodega-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <Navigation className="w-5 h-5 text-bodega-primary" aria-hidden="true" />
          </button>
        </div>

        {/* Mobile: Bottom sheet */}
        <div className="lg:hidden">
          {selectedBarWithDistance && (
            <BarDetailSheet
              marker={selectedBarWithDistance}
              onClose={onDeselectBar}
              onNavigate={handleNavigate}
              transportType={transportType}
            />
          )}
        </div>
      </div>

      {/* Desktop: Side panel - only shown when bar is selected */}
      {selectedBarWithDistance && (
        <div className="hidden lg:block w-[400px] border-l border-white/[0.06] bg-bodega-surface overflow-hidden">
          <BarDetailPanel
            marker={selectedBarWithDistance}
            onClose={onDeselectBar}
            onNavigate={handleNavigate}
            transportType={transportType}
          />
        </div>
      )}
    </div>
  )
}

interface BarDetailSheetProps {
  marker: MarkerWithDistance
  onClose: () => void
  onNavigate: () => void
  transportType: TransportType
}

function BarDetailSheet({ marker, onClose, onNavigate, transportType }: BarDetailSheetProps) {
  const [expanded, setExpanded] = useState(false)
  const travelTime = calculateTravelTime(marker.distance, transportType)
  const formattedTime = formatTravelTime(travelTime)
  const distanceMeters = marker.distance * 1000
  const formattedDistance = distanceMeters < 1000
    ? `${Math.round(distanceMeters)}m`
    : `${marker.distance.toFixed(1)}km`
  const sheetRef = useRef<HTMLDivElement>(null)

  const hasExtraContent = hasContent(marker.description) || hasContent(marker.hours) || marker.phone || marker.website || marker._id

  useEffect(() => {
    sheetRef.current?.focus()
  }, [])

  useEffect(() => {
    setExpanded(false)
  }, [marker.id])

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <div
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="bar-detail-title"
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      className={`absolute bottom-4 left-3 right-3 bg-bodega-surface rounded-bodega-xl border border-white/10 animate-in slide-in-from-bottom-4 z-40 focus:outline-none transition-all duration-300 ${
        expanded ? 'max-h-[70vh]' : 'max-h-[280px]'
      }`}
    >
      {/* Drag handle */}
      <button
        onClick={() => hasExtraContent && setExpanded(!expanded)}
        className="w-full pt-3 pb-2 flex justify-center"
        aria-label={expanded ? 'Minimer' : 'Udvid'}
      >
        <div className="w-10 h-1 bg-gray-500/40 rounded-full" aria-hidden="true" />
      </button>

      {/* Close button */}
      <button
        onClick={onClose}
        aria-label="Luk"
        className="absolute right-3 top-3 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center active:scale-95 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-bodega-accent"
      >
        <X className="w-4 h-4 text-white/60" aria-hidden="true" />
      </button>

      <div className={`px-4 pb-4 ${expanded ? 'overflow-y-auto max-h-[calc(70vh-60px)]' : ''}`}>
        {/* Header with icon */}
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-bodega-primary flex items-center justify-center">
            <span className="text-2xl">🍺</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 id="bar-detail-title" className="text-xl font-bold text-white font-bodega-rounded leading-tight">
              {marker.name}
            </h3>
            <p className="text-sm text-gray-400 truncate">
              {marker.street}{marker.city && `, ${marker.city}`}
            </p>
          </div>
        </div>

        {/* Distance and time badges */}
        <div className="flex items-center gap-2 mb-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-bodega-accent/15 rounded-full">
            <MapPin className="w-3.5 h-3.5 text-bodega-accent" />
            <span className="text-xs font-semibold text-bodega-accent">{formattedDistance}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white/[0.06] rounded-full">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs text-gray-300">{formattedTime}</span>
          </div>
        </div>

        {/* Expanded content */}
        {expanded && (
          <div className="space-y-4 mb-4 animate-in fade-in slide-in-from-top-2 duration-200">
            {hasContent(marker.description) && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Om stedet</h4>
                <p className="text-sm text-gray-300 leading-relaxed">{stripHtml(marker.description)}</p>
              </div>
            )}

            {hasContent(marker.hours) && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Åbningstider</h4>
                <p className="text-sm text-gray-300">{stripHtml(marker.hours)}</p>
              </div>
            )}

            {(marker.phone || marker.website) && (
              <div className="space-y-2">
                {marker.phone && (
                  <a
                    href={`tel:${marker.phone}`}
                    className="flex items-center gap-3 px-3 py-3 bg-white/[0.04] rounded-xl active:bg-white/[0.08] transition-colors"
                  >
                    <Phone className="w-4 h-4 text-bodega-accent" />
                    <span className="text-sm text-white">{marker.phone}</span>
                  </a>
                )}
                {marker.website && (
                  <a
                    href={marker.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-3 py-3 bg-white/[0.04] rounded-xl active:bg-white/[0.08] transition-colors"
                  >
                    <Globe className="w-4 h-4 text-bodega-accent" />
                    <span className="text-sm text-white truncate">{marker.website.replace(/^https?:\/\//, '')}</span>
                  </a>
                )}
              </div>
            )}

            {/* Reviews */}
            {marker._id && (
              <ReviewsList barId={marker._id as Id<'bars'>} compact />
            )}
          </div>
        )}

        {/* Expand hint */}
        {hasExtraContent && !expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="w-full py-2 mb-3 text-xs text-gray-500 active:text-gray-400"
          >
            Tryk for at se mere info
          </button>
        )}

        {/* Action button */}
        <button
          onClick={onNavigate}
          className="w-full flex items-center justify-center gap-2 py-3 bg-bodega-accent text-white font-semibold text-sm rounded-xl active:scale-[0.98] transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-bodega-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          <Navigation className="w-4 h-4" aria-hidden="true" />
          <span>Vis rute</span>
        </button>
      </div>
    </div>
  )
}
