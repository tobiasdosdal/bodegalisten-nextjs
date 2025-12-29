'use client'

import { useState, useEffect } from 'react'
import { Navigation, MapPin, Clock, Phone, Globe, X, Flag, Share2, Copy, ExternalLink } from 'lucide-react'
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
  const [copied, setCopied] = useState(false)

  const travelTime = calculateTravelTime(marker.distance, transportType)
  const formattedTime = formatTravelTime(travelTime)
  const distanceMeters = marker.distance * 1000
  const formattedDistance = distanceMeters < 1000
    ? `${Math.round(distanceMeters)}m`
    : `${marker.distance.toFixed(1)}km`

  const fullAddress = `${marker.street}${marker.city ? `, ${marker.city}` : ''}`

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(fullAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: marker.name,
          text: `Tjek ${marker.name} ud på Bodegalisten!`,
          url: window.location.href,
        })
      } catch {
        // User cancelled or error
      }
    }
  }

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
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md max-h-[85vh] bg-bodega-surface rounded-2xl border border-bodega-gold/15 shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
        style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(245, 180, 65, 0.08)' }}
      >
        {/* Hero Section */}
        <div className="relative flex-shrink-0">
          <div
            className="h-32 bg-gradient-to-br from-bodega-primary via-bodega-secondary to-bodega-primary"
            style={{
              backgroundImage: `
                radial-gradient(ellipse at 30% 20%, rgba(245, 180, 65, 0.15) 0%, transparent 50%),
                radial-gradient(ellipse at 80% 80%, rgba(120, 45, 55, 0.2) 0%, transparent 40%),
                linear-gradient(135deg, hsl(25, 30%, 14%) 0%, hsl(350, 35%, 18%) 50%, hsl(25, 30%, 12%) 100%)
              `
            }}
          >
            {/* Decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-bodega-gold/5 blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-bodega-burgundy/10 blur-xl" />
            </div>
          </div>

          {/* Floating action buttons */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5">
            {marker._id && (
              <FavoriteButton barId={marker._id as Id<'bars'>} size="sm" />
            )}
            {marker._id && isSignedIn && (
              <button
                onClick={() => setIsReportModalOpen(true)}
                aria-label="Rapporter lukket"
                title="Rapporter lukket"
                className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center hover:bg-black/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-bodega-gold"
              >
                <Flag className="w-4 h-4 text-white/80" />
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Luk"
              className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center hover:bg-black/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-bodega-gold"
            >
              <X className="w-4 h-4 text-white/80" />
            </button>
          </div>

          {/* Beer icon badge */}
          <div className="absolute -bottom-6 left-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center border-4 border-bodega-surface shadow-xl">
              <span className="text-2xl" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>🍺</span>
            </div>
          </div>
        </div>

        {/* Header Info */}
        <div className="flex-shrink-0 pt-8 px-5 pb-4">
          <h2 id="bar-modal-title" className="text-xl font-display font-semibold text-bodega-cream tracking-tight mb-0.5">
            {marker.name}
          </h2>
          <p className="text-sm text-stone-400 mb-3">
            {fullAddress}
          </p>

          {/* Stats row */}
          <div className="flex items-center gap-2 mb-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-bodega-gold/15 rounded-full border border-bodega-gold/25">
              <MapPin className="w-3.5 h-3.5 text-bodega-gold" />
              <span className="text-xs font-semibold text-bodega-gold">{formattedDistance}</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-800/50 rounded-full">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              <span className="text-xs text-stone-300">{formattedTime}</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            {marker.phone && (
              <a
                href={`tel:${marker.phone}`}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-stone-800/60 hover:bg-stone-800 rounded-xl transition-colors border border-stone-700/50"
              >
                <Phone className="w-4 h-4 text-bodega-gold" />
                <span className="text-xs font-medium text-stone-200">Ring</span>
              </a>
            )}
            <button
              onClick={handleCopyAddress}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-stone-800/60 hover:bg-stone-800 rounded-xl transition-colors border border-stone-700/50"
            >
              <Copy className="w-4 h-4 text-bodega-gold" />
              <span className="text-xs font-medium text-stone-200">{copied ? 'Kopieret!' : 'Kopier'}</span>
            </button>
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-stone-800/60 hover:bg-stone-800 rounded-xl transition-colors border border-stone-700/50"
              >
                <Share2 className="w-4 h-4 text-bodega-gold" />
                <span className="text-xs font-medium text-stone-200">Del</span>
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-4">
          {hasContent(marker.description) && (
            <div className="p-4 bg-stone-800/30 rounded-xl border border-stone-700/30">
              <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
                Om stedet
              </h3>
              <p className="text-sm text-stone-300 leading-relaxed">
                {stripHtml(marker.description)}
              </p>
            </div>
          )}

          {hasContent(marker.hours) && (
            <div className="p-4 bg-stone-800/30 rounded-xl border border-stone-700/30">
              <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
                Åbningstider
              </h3>
              <p className="text-sm text-stone-300">
                {stripHtml(marker.hours)}
              </p>
            </div>
          )}

          {marker.website && (
            <a
              href={marker.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-stone-800/30 rounded-xl border border-stone-700/30 hover:bg-stone-800/50 hover:border-bodega-gold/20 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-bodega-gold/10 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-bodega-gold" />
                </div>
                <div>
                  <p className="text-xs text-stone-500 mb-0.5">Hjemmeside</p>
                  <p className="text-sm text-bodega-cream truncate max-w-[200px]">
                    {marker.website.replace(/^https?:\/\/(www\.)?/, '')}
                  </p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-stone-500 group-hover:text-bodega-gold transition-colors" />
            </a>
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

        {/* Footer Actions */}
        <div className="flex-shrink-0 p-4 border-t border-stone-800/80 bg-bodega-surface/80 backdrop-blur-sm">
          <div className="flex gap-3">
            {marker._id && (
              <CheckInButton barId={marker._id as Id<'bars'>} barName={marker.name} />
            )}
            <button
              onClick={onNavigate}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-bodega-gold to-amber-500 text-bodega-primary font-semibold text-sm rounded-xl hover:brightness-110 active:scale-[0.98] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-bodega-gold focus-visible:ring-offset-2 focus-visible:ring-offset-bodega-surface shadow-lg"
              style={{ boxShadow: '0 4px 14px rgba(245, 180, 65, 0.3)' }}
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
