'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Marker } from '@/types'

interface MarkerFormProps {
  marker?: Marker
  onSubmit: (data: Partial<Marker>) => void | Promise<void>
  isLoading?: boolean
  onCancel?: () => void
}

export function MarkerForm({
  marker,
  onSubmit,
  isLoading = false,
  onCancel,
}: MarkerFormProps) {
  const [formData, setFormData] = useState<Partial<Marker>>(
    marker || {
      name: '',
      lat: 55.6761,
      lon: 12.5683,
      category: '',
      street: '',
      city: '',
      postal_code: '',
      phone: '',
      email: '',
      website: '',
      hours: '',
      description: '',
      image: '',
      published: false,
      active: true,
    }
  )

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement | HTMLSelectElement
    const finalValue =
      type === 'checkbox' ? (e.target as HTMLInputElement).checked : value

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || formData.lat === undefined || formData.lon === undefined) {
      alert('Name, latitude, and longitude are required')
      return
    }

    await onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name *
          </label>
          <Input
            type="text"
            name="name"
            value={formData.name || ''}
            onChange={handleChange}
            required
            placeholder="Bar name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <Input
            type="text"
            name="category"
            value={formData.category || ''}
            onChange={handleChange}
            placeholder="e.g., cocktail bar, brewery"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Latitude *
          </label>
          <Input
            type="number"
            name="lat"
            step="0.0001"
            value={formData.lat || ''}
            onChange={handleChange}
            required
            placeholder="55.6761"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Longitude *
          </label>
          <Input
            type="number"
            name="lon"
            step="0.0001"
            value={formData.lon || ''}
            onChange={handleChange}
            required
            placeholder="12.5683"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Street
          </label>
          <Input
            type="text"
            name="street"
            value={formData.street || ''}
            onChange={handleChange}
            placeholder="Street address"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <Input
            type="text"
            name="city"
            value={formData.city || ''}
            onChange={handleChange}
            placeholder="Copenhagen"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Postal Code
          </label>
          <Input
            type="text"
            name="postal_code"
            value={formData.postal_code || ''}
            onChange={handleChange}
            placeholder="1234"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <Input
            type="tel"
            name="phone"
            value={formData.phone || ''}
            onChange={handleChange}
            placeholder="+45 12 34 56 78"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <Input
            type="email"
            name="email"
            value={formData.email || ''}
            onChange={handleChange}
            placeholder="contact@bar.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Website
          </label>
          <Input
            type="url"
            name="website"
            value={formData.website || ''}
            onChange={handleChange}
            placeholder="https://example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hours
          </label>
          <Input
            type="text"
            name="hours"
            value={formData.hours || ''}
            onChange={handleChange}
            placeholder="Mon-Sun: 10:00 - 22:00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Image URL
          </label>
          <Input
            type="url"
            name="image"
            value={formData.image || ''}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          placeholder="Describe the bar..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="published"
            checked={formData.published || false}
            onChange={handleChange}
            className="rounded"
          />
          <span className="text-sm font-medium text-gray-700">Published</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="active"
            checked={formData.active !== false}
            onChange={handleChange}
            className="rounded"
          />
          <span className="text-sm font-medium text-gray-700">Active</span>
        </label>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : marker ? 'Update Marker' : 'Create Marker'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
