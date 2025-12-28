'use client'

import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { UserAvatar } from '@/components/social'
import { X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface PhotoGalleryProps {
  barId: Id<'bars'>
  limit?: number
  showViewAll?: boolean
}

export function PhotoGallery({ barId, limit = 6, showViewAll = true }: PhotoGalleryProps) {
  const photos = useQuery(api.photos.getByBar, { barId, limit: limit + 1 })
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  if (photos === undefined) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="w-5 h-5 text-bodega-accent animate-spin" />
      </div>
    )
  }

  if (photos.length === 0) {
    return null
  }

  const hasMore = photos.length > limit
  const displayPhotos = photos.slice(0, limit)
  const selectedPhoto = selectedIndex !== null ? displayPhotos[selectedIndex] : null

  const handlePrev = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1)
    }
  }

  const handleNext = () => {
    if (selectedIndex !== null && selectedIndex < displayPhotos.length - 1) {
      setSelectedIndex(selectedIndex + 1)
    }
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-1 rounded-xl overflow-hidden">
        {displayPhotos.map((photo, index) => (
          <button
            key={photo._id}
            onClick={() => setSelectedIndex(index)}
            className="relative aspect-square bg-white/[0.04] hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-bodega-accent"
          >
            {photo.url && (
              <img
                src={photo.url}
                alt={photo.caption || 'Bar photo'}
                className="w-full h-full object-cover"
              />
            )}
          </button>
        ))}
      </div>

      {showViewAll && hasMore && (
        <Link
          href={`/bar/${barId}/photos`}
          className="block text-center text-sm text-bodega-accent hover:underline mt-2"
        >
          Se alle billeder
        </Link>
      )}

      {/* Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setSelectedIndex(null)}
        >
          {/* Close button */}
          <button
            onClick={() => setSelectedIndex(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors z-10"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Navigation */}
          {selectedIndex !== null && selectedIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handlePrev()
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors z-10"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
          )}

          {selectedIndex !== null && selectedIndex < displayPhotos.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleNext()
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors z-10"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          )}

          {/* Image */}
          <div
            className="max-w-4xl max-h-[80vh] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedPhoto.url && (
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.caption || 'Bar photo'}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            )}

            {/* Photo info */}
            <div className="mt-4 flex items-center gap-3">
              <Link href={`/users/${selectedPhoto.user.clerkId}`}>
                <UserAvatar
                  src={selectedPhoto.user.avatarUrl}
                  name={selectedPhoto.user.displayName}
                  size="sm"
                />
              </Link>
              <div className="flex-1">
                <Link
                  href={`/users/${selectedPhoto.user.clerkId}`}
                  className="text-sm font-medium text-white hover:text-bodega-accent transition-colors"
                >
                  {selectedPhoto.user.displayName}
                </Link>
                {selectedPhoto.caption && (
                  <p className="text-sm text-gray-400">{selectedPhoto.caption}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
