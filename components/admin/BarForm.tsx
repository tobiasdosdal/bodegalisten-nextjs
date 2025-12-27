'use client'

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { X, MapPin } from 'lucide-react'

const LocationPicker = dynamic(
  () => import('./LocationPicker').then((mod) => mod.LocationPicker),
  { ssr: false, loading: () => <div className="h-[300px] bg-white/[0.04] rounded-xl animate-pulse" /> }
)

interface Bar {
  _id: Id<'bars'>
  name: string
  street?: string
  city?: string
  postalCode?: string
  lat: number
  lon: number
  phone?: string
  website?: string
  hours?: string
  description?: string
  category?: string
  active?: boolean
}

interface BarFormProps {
  bar?: Bar
  onSuccess: () => void
  onCancel: () => void
}

export function BarForm({ bar, onSuccess, onCancel }: BarFormProps) {
  const createBar = useMutation(api.bars.create)
  const updateBar = useMutation(api.bars.update)

  const [isLoading, setIsLoading] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [formData, setFormData] = useState({
    name: bar?.name || '',
    lat: bar?.lat || 55.6761,
    lon: bar?.lon || 12.5683,
    category: bar?.category || '',
    street: bar?.street || '',
    city: bar?.city || '',
    postalCode: bar?.postalCode || '',
    phone: bar?.phone || '',
    website: bar?.website || '',
    hours: bar?.hours || '',
    description: bar?.description || '',
    active: bar?.active !== false,
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement
    const finalValue =
      type === 'checkbox' ? (e.target as HTMLInputElement).checked : value

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }))
  }

  const handleLocationChange = useCallback((lat: number, lon: number) => {
    setFormData(prev => ({ ...prev, lat, lon }))
  }, [])

  const handleAddressFound = useCallback((addr: { street?: string; city?: string; postalCode?: string }) => {
    setFormData(prev => ({
      ...prev,
      street: addr.street || prev.street,
      city: addr.city || prev.city,
      postalCode: addr.postalCode || prev.postalCode,
    }))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || formData.lat === undefined || formData.lon === undefined) {
      alert('Navn, breddegrad og længdegrad er påkrævet')
      return
    }

    setIsLoading(true)
    try {
      if (bar) {
        await updateBar({
          id: bar._id,
          name: formData.name,
          lat: Number(formData.lat),
          lon: Number(formData.lon),
          category: formData.category || undefined,
          street: formData.street || undefined,
          city: formData.city || undefined,
          postalCode: formData.postalCode || undefined,
          phone: formData.phone || undefined,
          website: formData.website || undefined,
          hours: formData.hours || undefined,
          description: formData.description || undefined,
          active: formData.active,
        })
      } else {
        await createBar({
          name: formData.name,
          lat: Number(formData.lat),
          lon: Number(formData.lon),
          category: formData.category || undefined,
          street: formData.street || undefined,
          city: formData.city || undefined,
          postalCode: formData.postalCode || undefined,
          phone: formData.phone || undefined,
          website: formData.website || undefined,
          hours: formData.hours || undefined,
          description: formData.description || undefined,
        })
      }
      onSuccess()
    } catch (error) {
      console.error('Error saving bar:', error)
      alert('Kunne ikke gemme bar')
    } finally {
      setIsLoading(false)
    }
  }

  const inputClassName = "w-full px-4 py-2.5 bg-white/[0.06] border border-white/[0.1] rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-bodega-accent focus:border-transparent"
  const labelClassName = "block text-sm font-medium text-gray-400 mb-1.5"

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-bodega-surface rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/[0.06]">
        <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
          <h2 className="text-xl font-bold text-white font-bodega-rounded">
            {bar ? 'Rediger Bar' : 'Tilføj Ny Bar'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 rounded-lg hover:bg-white/[0.1] transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClassName}>Navn *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Bar navn"
                className={inputClassName}
              />
            </div>

            <div>
              <label className={labelClassName}>Kategori</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="f.eks. cocktailbar, bryghus"
                className={inputClassName}
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className={labelClassName}>Placering *</label>
                <button
                  type="button"
                  onClick={() => setShowMap(!showMap)}
                  className="flex items-center gap-1.5 text-sm text-bodega-accent hover:text-bodega-accent/80 transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  {showMap ? 'Skjul kort' : 'Vælg på kort'}
                </button>
              </div>
              
              {showMap && (
                <LocationPicker
                  lat={formData.lat}
                  lon={formData.lon}
                  onLocationChange={handleLocationChange}
                  onAddressFound={handleAddressFound}
                />
              )}
              {!showMap && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="number"
                      name="lat"
                      step="0.0001"
                      value={formData.lat}
                      onChange={handleChange}
                      required
                      placeholder="Breddegrad (55.6761)"
                      className={inputClassName}
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      name="lon"
                      step="0.0001"
                      value={formData.lon}
                      onChange={handleChange}
                      required
                      placeholder="Længdegrad (12.5683)"
                      className={inputClassName}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className={labelClassName}>Gade</label>
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleChange}
                placeholder="Gadenavn 123"
                className={inputClassName}
              />
            </div>

            <div>
              <label className={labelClassName}>By</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="København"
                className={inputClassName}
              />
            </div>

            <div>
              <label className={labelClassName}>Postnummer</label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                placeholder="1234"
                className={inputClassName}
              />
            </div>

            <div>
              <label className={labelClassName}>Telefon</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+45 12 34 56 78"
                className={inputClassName}
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelClassName}>Hjemmeside</label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://example.com"
                className={inputClassName}
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelClassName}>Åbningstider</label>
              <input
                type="text"
                name="hours"
                value={formData.hours}
                onChange={handleChange}
                placeholder="Man-Søn: 10:00 - 22:00"
                className={inputClassName}
              />
            </div>
          </div>

          <div>
            <label className={labelClassName}>Beskrivelse</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Beskriv baren..."
              rows={4}
              className={inputClassName}
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="active"
                checked={formData.active}
                onChange={handleChange}
                className="w-4 h-4 rounded border-white/[0.2] bg-white/[0.06] text-bodega-accent focus:ring-bodega-accent focus:ring-offset-0"
              />
              <span className="text-sm font-medium text-gray-300">Aktiv</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t border-white/[0.06]">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 bg-bodega-accent text-white font-semibold rounded-xl hover:bg-bodega-accent/90 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Gemmer...' : bar ? 'Opdater Bar' : 'Opret Bar'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 bg-white/[0.06] text-white font-medium rounded-xl hover:bg-white/[0.1] transition-colors"
            >
              Annuller
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
