'use client'

import { useState } from 'react'
import { Navigation, MapPin, Clock, Phone, Globe, X, Flag } from 'lucide-react'
import { Marker } from '@/types'
import { calculateTravelTime, formatTravelTime, TransportType } from '@/lib/utils/distance'
import { ReviewsList, ReportClosedModal } from '@/components/bodega'
import { FavoriteButton, FriendsAtBar } from '@/components/social'
import { CheckInButton, BarCheckIns } from '@/components/checkin'
import { BarPhotosSection } from '@/components/photos'
import { Id } from '@/convex/_generated/dataModel'
import { useUser } from '@clerk/nextjs'

// Helper to strip HTML and check if content has real text
function stripHtml(html: string | undefined): string {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '').trim()
}

function hasContent(value: string | undefined): boolean {
  return stripHtml(value).length > 0
}

interface MarkerWithDistance extends Marker {
  distance: number
}

interface BarDetailPanelProps {
  marker: MarkerWithDistance
  onClose: () => void
  onNavigate: () => void
  transportType: TransportType
}

export function BarDetailPanel({ marker, onClose, onNavigate, transportType }: BarDetailPanelProps) {
  const { isSignedIn } = useUser()
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)

  const travelTime = calculateTravelTime(marker.distance, transportType)
  const formattedTime = formatTravelTime(travelTime)
  const distanceMeters = marker.distance * 1000
  const formattedDistance = distanceMeters < 1000
    ? `${Math.round(distanceMeters)}m`
    : `${marker.distance.toFixed(1)}km`

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-white/[0.06]">
        <div className="flex items-start justify-between mb-4">
          <div className="w-16 h-16 rounded-2xl bg-bodega-primary flex items-center justify-center">
            <span className="text-3xl">🍺</span>
          </div>
          <div className="flex items-center gap-2">
            {marker._id && (
              <FavoriteButton barId={marker._id as Id<'bars'>} size="sm" />
            )}
            {marker._id && isSignedIn && (
              <button
                onClick={() => setIsReportModalOpen(true)}
                aria-label="Rapporter lukket"
                title="Rapporter lukket"
                className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.1] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-bodega-accent"
              >
                <Flag className="w-4 h-4 text-gray-400" />
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Luk"
              className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.1] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-bodega-accent"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white font-bodega-rounded mb-1">
          {marker.name}
        </h2>
        <p className="text-gray-400">
          {marker.street}
          {marker.city && `, ${marker.city}`}
        </p>

        {/* Distance and time badges */}
        <div className="flex items-center gap-3 mt-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-bodega-accent/10 rounded-full">
            <MapPin className="w-4 h-4 text-bodega-accent" />
            <span className="text-sm font-semibold text-bodega-accent">{formattedDistance}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.06] rounded-full">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-300">{formattedTime}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Description */}
        {hasContent(marker.description) && (
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Om stedet
            </h3>
            <p className="text-gray-300 leading-relaxed">
              {stripHtml(marker.description)}
            </p>
          </div>
        )}

        {/* Hours */}
        {hasContent(marker.hours) && (
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Åbningstider
            </h3>
            <p className="text-gray-300">
              {stripHtml(marker.hours)}
            </p>
          </div>
        )}

        {/* Contact info */}
        {(marker.phone || marker.website) && (
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Kontakt
            </h3>
            <div className="space-y-2">
              {marker.phone && (
                <a
                  href={`tel:${marker.phone}`}
                  className="flex items-center gap-3 px-4 py-3 bg-white/[0.04] rounded-xl hover:bg-white/[0.06] transition-colors"
                >
                  <Phone className="w-5 h-5 text-bodega-accent" />
                  <span className="text-white">{marker.phone}</span>
                </a>
              )}
              {marker.website && (
                <a
                  href={marker.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 bg-white/[0.04] rounded-xl hover:bg-white/[0.06] transition-colors"
                >
                  <Globe className="w-5 h-5 text-bodega-accent" />
                  <span className="text-white truncate">{marker.website.replace(/^https?:\/\//, '')}</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Friends at bar */}
        {marker._id && (
          <FriendsAtBar barId={marker._id as string} />
        )}

        {/* Photos */}
        {marker._id && (
          <BarPhotosSection barId={marker._id as Id<'bars'>} />
        )}

        {/* Who's here */}
        {marker._id && (
          <BarCheckIns barId={marker._id as Id<'bars'>} />
        )}

        {/* Reviews */}
        {marker._id && (
          <ReviewsList barId={marker._id as Id<'bars'>} />
        )}
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 p-6 border-t border-white/[0.06]">
        <div className="flex gap-3">
          {marker._id && (
            <CheckInButton barId={marker._id as Id<'bars'>} barName={marker.name} />
          )}
          <button
            onClick={onNavigate}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-bodega-accent text-white font-semibold rounded-xl hover:bg-bodega-accent/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-bodega-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bodega-surface"
          >
            <Navigation className="w-5 h-5" />
            <span>Vis rute</span>
          </button>
        </div>
      </div>

      {marker._id && (
        <ReportClosedModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          barId={marker._id as Id<'bars'>}
          barName={marker.name}
        />
      )}
    </div>
  )
}
