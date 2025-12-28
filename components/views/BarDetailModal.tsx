'use client'

import { useState, useEffect } from 'react'
import { Navigation, MapPin, Clock, Phone, Globe, X, Flag } from 'lucide-react'
import { Marker } from '@/types'
import { calculateTravelTime, formatTravelTime, TransportType } from '@/lib/utils/distance'
import { ReviewsList, ReportClosedModal } from '@/components/bodega'
import { FavoriteButton, FriendsAtBar } from '@/components/social'
import { CheckInButton, BarCheckIns } from '@/components/checkin'
import { BarPhotosSection } from '@/components/photos'
import { Id } from '@/convex/_generated/dataModel'
import { useUser } from '@clerk/nextjs'

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

interface BarDetailModalProps {
  marker: MarkerWithDistance
  onClose: () => void
  onNavigate: () => void
  transportType: TransportType
}

export function BarDetailModal({ marker, onClose, onNavigate, transportType }: BarDetailModalProps) {
  const { isSignedIn } = useUser()
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)

  const travelTime = calculateTravelTime(marker.distance, transportType)
  const formattedTime = formatTravelTime(travelTime)
  const distanceMeters = marker.distance * 1000
  const formattedDistance = distanceMeters < 1000
    ? `${Math.round(distanceMeters)}m`
    : `${marker.distance.toFixed(1)}km`

  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="bar-modal-title"
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md max-h-[85vh] bg-bodega-surface rounded-2xl border border-bodega-gold/15 shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200"
        style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(245, 180, 65, 0.08)' }}
      >
        <div className="flex-shrink-0 p-6 border-b border-bodega-gold/10">
          <div className="flex items-start justify-between mb-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-bodega-primary to-bodega-secondary flex items-center justify-center border border-bodega-gold/20 shadow-lg">
              <span className="text-2xl" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }}>🍺</span>
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
                  className="w-8 h-8 rounded-full bg-bodega-gold/10 flex items-center justify-center hover:bg-bodega-gold/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-bodega-gold"
                >
                  <Flag className="w-4 h-4 text-stone-400" />
                </button>
              )}
              <button
                onClick={onClose}
                aria-label="Luk"
                className="w-8 h-8 rounded-full bg-bodega-gold/10 flex items-center justify-center hover:bg-bodega-gold/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-bodega-gold"
              >
                <X className="w-4 h-4 text-stone-400" />
              </button>
            </div>
          </div>

          <h2 id="bar-modal-title" className="text-xl font-display font-semibold text-bodega-cream tracking-tight mb-1">
            {marker.name}
          </h2>
          <p className="text-sm text-stone-400">
            {marker.street}
            {marker.city && `, ${marker.city}`}
          </p>

          <div className="flex items-center gap-2 mt-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-bodega-gold/15 rounded-full border border-bodega-gold/20">
              <MapPin className="w-3.5 h-3.5 text-bodega-gold" />
              <span className="text-xs font-semibold text-bodega-gold">{formattedDistance}</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-bodega-gold/8 rounded-full">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              <span className="text-xs text-stone-300">{formattedTime}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {hasContent(marker.description) && (
            <div>
              <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
                Om stedet
              </h3>
              <p className="text-sm text-stone-300 leading-relaxed">
                {stripHtml(marker.description)}
              </p>
            </div>
          )}

          {hasContent(marker.hours) && (
            <div>
              <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
                Åbningstider
              </h3>
              <p className="text-sm text-stone-300">
                {stripHtml(marker.hours)}
              </p>
            </div>
          )}

          {(marker.phone || marker.website) && (
            <div>
              <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
                Kontakt
              </h3>
              <div className="space-y-2">
                {marker.phone && (
                  <a
                    href={`tel:${marker.phone}`}
                    className="flex items-center gap-3 px-3 py-2.5 bg-bodega-gold/8 rounded-xl hover:bg-bodega-gold/12 transition-colors border border-bodega-gold/10"
                  >
                    <Phone className="w-4 h-4 text-bodega-gold" />
                    <span className="text-sm text-bodega-cream">{marker.phone}</span>
                  </a>
                )}
                {marker.website && (
                  <a
                    href={marker.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-3 py-2.5 bg-bodega-gold/8 rounded-xl hover:bg-bodega-gold/12 transition-colors border border-bodega-gold/10"
                  >
                    <Globe className="w-4 h-4 text-bodega-gold" />
                    <span className="text-sm text-bodega-cream truncate">{marker.website.replace(/^https?:\/\//, '')}</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {marker._id && (
            <FriendsAtBar barId={marker._id as string} />
          )}

          {marker._id && (
            <BarPhotosSection barId={marker._id as Id<'bars'>} />
          )}

          {marker._id && (
            <BarCheckIns barId={marker._id as Id<'bars'>} />
          )}

          {marker._id && (
            <ReviewsList barId={marker._id as Id<'bars'>} compact />
          )}
        </div>

        <div className="flex-shrink-0 p-4 border-t border-bodega-gold/10">
          <div className="flex gap-3">
            {marker._id && (
              <CheckInButton barId={marker._id as Id<'bars'>} barName={marker.name} />
            )}
            <button
              onClick={onNavigate}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-bodega-gold to-amber-500 text-bodega-primary font-semibold text-sm rounded-xl hover:brightness-110 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-bodega-gold focus-visible:ring-offset-2 focus-visible:ring-offset-bodega-surface shadow-lg"
              style={{ boxShadow: '0 4px 14px rgba(245, 180, 65, 0.25)' }}
            >
              <Navigation className="w-4 h-4" />
              <span>Vis rute</span>
            </button>
          </div>
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
    </>
  )
}
