'use client'

import { Marker } from '@/types'

interface MarkerListProps {
  markers: Marker[]
  selectedMarkerId?: number
  onSelectMarker: (marker: Marker) => void
}

export function MarkerList({
  markers,
  selectedMarkerId,
  onSelectMarker,
}: MarkerListProps) {
  return (
    <div className="space-y-2 p-3">
      {markers.map((marker) => {
        const address = [marker.street, marker.city]
          .filter(Boolean)
          .join(', ')

        return (
          <button
            key={marker.id}
            onClick={() => onSelectMarker(marker)}
            className={`w-full text-left p-3 rounded-lg transition-colors ${
              selectedMarkerId === marker.id
                ? 'bg-blue-100 border border-blue-300'
                : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <h4 className="font-semibold text-sm">{marker.name}</h4>
            {address && (
              <p className="text-xs text-gray-500 truncate">{address}</p>
            )}
            {marker.hours && (
              <p className="text-xs text-gray-400 truncate">{marker.hours}</p>
            )}
          </button>
        )
      })}
    </div>
  )
}
