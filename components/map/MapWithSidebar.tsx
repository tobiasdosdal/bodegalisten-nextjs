'use client'

import { useState, useRef, useEffect } from 'react'
import { MapViewer } from './MapViewer'
import { MarkerList } from './MarkerList'
import { Marker } from '@/types'
import { Menu, X, MapPin } from 'lucide-react'

interface MapWithSidebarProps {
  markers: Marker[]
}

export function MapWithSidebar({ markers }: MapWithSidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [selectedMarker, setSelectedMarker] = useState<Marker | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  const filteredMarkers = markers.filter((marker) => {
    const query = searchQuery.toLowerCase()
    return (
      marker.name.toLowerCase().includes(query) ||
      marker.city?.toLowerCase().includes(query) ||
      marker.category?.toLowerCase().includes(query)
    )
  })

  const handleMarkerClick = (marker: Marker) => {
    setSelectedMarker(marker)
  }

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && containerRef.current.clientWidth < 768) {
        setSidebarOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div ref={containerRef} className="relative w-full h-screen overflow-hidden bg-gray-50">
      <MapViewer
        markers={markers}
        onMarkerClick={handleMarkerClick}
        defaultCenter={[55.6761, 12.5683]}
        defaultZoom={12}
      />

      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute top-4 left-4 z-10 p-2 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow md:hidden"
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      <div
        className={`absolute top-0 left-0 h-full w-80 bg-white shadow-lg transition-transform duration-300 ease-in-out z-20 flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:static md:translate-x-0 md:w-96`}
      >
        <div className="flex-shrink-0 p-4 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Locations</h2>
            </div>
          <input
            type="text"
            placeholder="Search by name, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredMarkers.length > 0 ? (
            <MarkerList
              markers={filteredMarkers}
              selectedMarkerId={selectedMarker?.id}
              onSelectMarker={handleMarkerClick}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <MapPin className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm text-center">No locations found</p>
            </div>
          )}
        </div>

        {selectedMarker && (
          <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-blue-50">
            <h3 className="font-semibold text-gray-900 mb-2">{selectedMarker.name}</h3>
            {selectedMarker.description && (
              <p className="text-sm text-gray-600 mb-2">{selectedMarker.description}</p>
            )}
            <div className="space-y-1 text-xs text-gray-600">
              {selectedMarker.street && (
                <div>{selectedMarker.street}</div>
              )}
              {selectedMarker.city && (
                <div>{selectedMarker.city} {selectedMarker.postal_code}</div>
              )}
              {selectedMarker.phone && (
                <div>📞 {selectedMarker.phone}</div>
              )}
              {selectedMarker.website && (
                <div>
                  <a
                    href={selectedMarker.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Website
                  </a>
                </div>
              )}
              {selectedMarker.hours && (
                <div>🕐 {selectedMarker.hours}</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
