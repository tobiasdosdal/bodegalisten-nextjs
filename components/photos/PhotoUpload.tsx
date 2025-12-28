'use client'

import { useState, useRef } from 'react'
import { useMutation } from 'convex/react'
import { useUser, SignInButton } from '@clerk/nextjs'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { Camera, X, Loader2, Upload } from 'lucide-react'

interface PhotoUploadProps {
  barId: Id<'bars'>
  onSuccess?: () => void
}

export function PhotoUpload({ barId, onSuccess }: PhotoUploadProps) {
  const { isSignedIn, user } = useUser()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [caption, setCaption] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')

  const generateUploadUrl = useMutation(api.photos.generateUploadUrl)
  const savePhoto = useMutation(api.photos.upload)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Vælg venligst et billede')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Billedet må max være 10MB')
      return
    }

    setSelectedFile(file)
    setPreview(URL.createObjectURL(file))
    setError('')
    setShowModal(true)
  }

  const handleUpload = async () => {
    if (!selectedFile || !user?.id) return

    setIsUploading(true)
    setError('')

    try {
      // Step 1: Get upload URL from Convex
      const uploadUrl = await generateUploadUrl()

      // Step 2: Upload file directly to Convex storage
      const result = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': selectedFile.type },
        body: selectedFile,
      })

      if (!result.ok) {
        throw new Error('Upload failed')
      }

      const { storageId } = await result.json()

      // Step 3: Save photo record in database
      await savePhoto({
        userId: user.id,
        barId,
        storageId,
        caption: caption.trim() || undefined,
      })

      // Success - close modal
      setShowModal(false)
      setSelectedFile(null)
      setPreview(null)
      setCaption('')
      onSuccess?.()
    } catch (err) {
      console.error('Failed to upload photo:', err)
      setError('Kunne ikke uploade billede. Prøv igen.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleClose = () => {
    setShowModal(false)
    setSelectedFile(null)
    setPreview(null)
    setCaption('')
    setError('')
  }

  // Not signed in
  if (!isSignedIn) {
    return (
      <SignInButton mode="modal">
        <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-400 bg-white/[0.04] rounded-lg hover:bg-white/[0.06] transition-colors">
          <Camera className="w-4 h-4" />
          Del billede
        </button>
      </SignInButton>
    )
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-400 bg-white/[0.04] rounded-lg hover:bg-white/[0.06] transition-colors"
      >
        <Camera className="w-4 h-4" />
        Del billede
      </button>

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-bodega-surface rounded-2xl shadow-xl animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
              <h3 className="text-lg font-semibold text-white">Del billede</h3>
              <button
                onClick={handleClose}
                disabled={isUploading}
                className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.1] transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Preview */}
              {preview && (
                <div className="relative aspect-square rounded-xl overflow-hidden bg-white/[0.04]">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Caption */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Billedtekst (valgfri)
                </label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Beskriv dit billede..."
                  maxLength={200}
                  disabled={isUploading}
                  className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-bodega-accent/50 disabled:opacity-50"
                />
              </div>

              {/* Error */}
              {error && (
                <p className="text-sm text-red-400">{error}</p>
              )}

              {/* Upload button */}
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="w-full flex items-center justify-center gap-2 py-3 text-lg font-medium text-white bg-bodega-accent rounded-xl hover:bg-bodega-accent/90 transition-colors disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Uploader...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Upload billede
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
