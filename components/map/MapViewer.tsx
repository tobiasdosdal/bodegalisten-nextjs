'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import { Marker } from '@/types'

// Custom marker icon using inline SVG to avoid bundler issues
const createCustomIcon = (color: string = '#3b82f6') => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <svg width="32" height="42" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 26 16 26s16-14 16-26c0-8.84-7.16-16-16-16z" fill="${color}"/>
        <circle cx="16" cy="16" r="8" fill="white"/>
      </svg>
    `,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -42],
  })
}

const defaultIcon = createCustomIcon('#3b82f6')

interface MapViewerProps {
  markers: Marker[]
  defaultCenter?: [number, number]
  defaultZoom?: number
  onMarkerClick?: (marker: Marker) => void
}

export function MapViewer({
  markers,
  defaultCenter = [55.6761, 12.5683],
  defaultZoom = 12,
  onMarkerClick,
}: MapViewerProps) {
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    mapRef.current = L.map(containerRef.current).setView(defaultCenter, defaultZoom)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(mapRef.current)

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [defaultCenter, defaultZoom])

  useEffect(() => {
    if (!mapRef.current) return

    const markerLayers: L.Marker[] = []

    markers.forEach((marker) => {
       const lat = parseFloat(String(marker.lat))
       const lon = parseFloat(String(marker.lon))
      
      if (isNaN(lat) || isNaN(lon)) return

      const address = [marker.street, marker.city, marker.postal_code]
        .filter(Boolean)
        .join(', ')

      const leafletMarker = L.marker([lat, lon], { icon: defaultIcon })
        .addTo(mapRef.current!)
        .bindPopup(
          `<div class="max-w-xs">
            <h3 class="font-bold">${marker.name}</h3>
            ${marker.description ? `<p class="text-sm">${marker.description}</p>` : ''}
            ${address ? `<p class="text-xs text-gray-600">${address}</p>` : ''}
            ${marker.phone ? `<p class="text-xs">📞 ${marker.phone}</p>` : ''}
            ${marker.hours ? `<p class="text-xs">🕐 ${marker.hours}</p>` : ''}
          </div>`
        )

      if (onMarkerClick) {
        leafletMarker.on('click', () => {
          onMarkerClick(marker)
        })
      }

      markerLayers.push(leafletMarker)
    })

    if (markerLayers.length > 0 && mapRef.current) {
      const group = new L.FeatureGroup(markerLayers)
      mapRef.current.fitBounds(group.getBounds().pad(0.1))
    }

    return () => {
      markerLayers.forEach((layer) => {
        if (mapRef.current) {
          mapRef.current.removeLayer(layer)
        }
      })
    }
  }, [markers, onMarkerClick])

  return <div ref={containerRef} className="w-full h-full" />
}
