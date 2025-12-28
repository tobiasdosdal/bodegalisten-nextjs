'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { UserAvatar } from '@/components/social'
import { PhotoUpload } from '@/components/photos'
import { ArrowLeft, X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ barId: string }>
}

export default function BarPhotosPage({ params }: PageProps) {
  const { barId } = use(params)
  const router = useRouter()
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const photos = useQuery(api.photos.getByBar, {
    barId: barId as Id<'bars'>,
    limit: 100,
  })

  // Get bar name
  const bars = useQuery(api.bars.list)
  const bar = bars?.find((b) => b._id === barId)

  const selectedPhoto = selectedIndex !== null ? photos?.[selectedIndex] : null

  const handlePrev = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1)
    }
  }

  const handleNext = () => {
    if (selectedIndex !== null && photos && selectedIndex < photos.length - 1) {
      setSelectedIndex(selectedIndex + 1)
    }
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.1] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="text-center">
            <h1 className="text-lg font-semibold text-white">Billeder</h1>
            {bar && (
              <p className="text-xs text-gray-400">{bar.name}</p>
            )}
          </div>
          <PhotoUpload barId={barId as Id<'bars'>} />
        </div>
      </header>

      {/* Content */}
      <div className="p-4">
        {photos === undefined ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-bodega-accent animate-spin" />
          </div>
        ) : photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-white/[0.06] flex items-center justify-center mb-4">
              <span className="text-3xl">📷</span>
            </div>
            <h2 className="text-lg font-medium text-white mb-2">
              Ingen billeder endnu
            </h2>
            <p className="text-gray-400 mb-4">
              Vær den første til at dele et billede fra {bar?.name || 'denne bar'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1">
            {photos.map((photo, index) => (
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
        )}
      </div>

      {/* Lightbox */}
      {selectedPhoto && photos && (
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

          {/* Counter */}
          <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/10 text-sm text-white">
            {(selectedIndex ?? 0) + 1} / {photos.length}
          </div>

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

          {selectedIndex !== null && selectedIndex < photos.length - 1 && (
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
    </div>
  )
}
