'use client'

import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { PhotoGallery } from './PhotoGallery'
import { PhotoUpload } from './PhotoUpload'
import { Camera } from 'lucide-react'

interface BarPhotosSectionProps {
  barId: Id<'bars'>
}

export function BarPhotosSection({ barId }: BarPhotosSectionProps) {
  const photoCount = useQuery(api.photos.getCountByBar, { barId })

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-bodega-accent" />
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
            Billeder {photoCount !== undefined && photoCount > 0 && `(${photoCount})`}
          </h3>
        </div>
        <PhotoUpload barId={barId} />
      </div>

      <PhotoGallery barId={barId} limit={6} showViewAll={true} />

      {photoCount === 0 && (
        <div className="text-center py-6 px-4 bg-white/[0.02] rounded-xl">
          <Camera className="w-8 h-8 text-gray-600 mx-auto mb-2" />
          <p className="text-sm text-gray-500">
            Ingen billeder endnu. Vær den første til at dele!
          </p>
        </div>
      )}
    </div>
  )
}
