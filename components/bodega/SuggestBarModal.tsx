'use client'

import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useUser } from '@clerk/nextjs'
import { X, MapPin, Loader2 } from 'lucide-react'
import dynamic from 'next/dynamic'

const LocationPicker = dynamic(
  () => import('@/components/admin/LocationPicker').then((mod) => mod.LocationPicker),
  { ssr: false, loading: () => <div className="h-[300px] bg-bodega-surface rounded-xl animate-pulse" /> }
)

interface SuggestBarModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SuggestBarModal({ isOpen, onClose }: SuggestBarModalProps) {
  const { user } = useUser()
  const submit = useMutation(api.barReports.submit)

  const [name, setName] = useState('')
  const [lat, setLat] = useState(55.6761)
  const [lon, setLon] = useState(12.5683)
  const [address, setAddress] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  if (!isOpen) return null

  const handleLocationChange = (newLat: number, newLon: number) => {
    setLat(newLat)
    setLon(newLon)
  }

  const handleAddressFound = (addr: { street?: string; city?: string; postalCode?: string }) => {
    const parts = [addr.street, addr.postalCode, addr.city].filter(Boolean)
    setAddress(parts.join(', '))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (!name.trim()) {
      setError('Indtast venligst et navn')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await submit({
        reportType: 'new_bar',
        userId: user.id,
        userName: user.firstName || user.username || undefined,
        suggestedName: name.trim(),
        suggestedLat: lat,
        suggestedLon: lon,
        suggestedAddress: address || undefined,
      })
      setSuccess(true)
      setTimeout(() => {
        onClose()
        setSuccess(false)
        setName('')
        setAddress('')
      }, 2000)
    } catch {
      setError('Kunne ikke sende forslag. Prøv igen.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
      setName('')
      setAddress('')
      setError('')
      setSuccess(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative w-full max-w-lg bg-bodega-surface rounded-2xl shadow-xl border border-white/[0.06] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
          <h2 className="text-lg font-semibold text-white">Foreslå ny bar</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 rounded-lg hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {success ? (
          <div className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
              <MapPin className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Tak for dit forslag!</h3>
            <p className="text-gray-400">Vi kigger på det hurtigst muligt.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div>
              <label htmlFor="barName" className="block text-sm font-medium text-gray-300 mb-1.5">
                Navn på bar *
              </label>
              <input
                id="barName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="F.eks. Café Guldhornene"
                className="w-full px-4 py-2.5 bg-white/[0.06] border border-white/[0.1] rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-bodega-accent focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Placering * (klik på kortet)
              </label>
              <LocationPicker
                lat={lat}
                lon={lon}
                onLocationChange={handleLocationChange}
                onAddressFound={handleAddressFound}
              />
            </div>

            {address && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <MapPin className="w-4 h-4" />
                {address}
              </div>
            )}

            {error && <p className="text-sm text-red-400">{error}</p>}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 bg-white/[0.06] text-white rounded-xl hover:bg-white/[0.1] transition-colors disabled:opacity-50"
              >
                Annuller
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !name.trim()}
                className="flex-1 px-4 py-2.5 bg-bodega-accent text-white rounded-xl hover:bg-bodega-accent/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sender...
                  </>
                ) : (
                  'Send forslag'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
