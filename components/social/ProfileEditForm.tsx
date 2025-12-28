'use client'

import { useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { useUser } from '@clerk/nextjs'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { UserAvatar } from './UserAvatar'
import { Loader2, Check } from 'lucide-react'

interface ProfileEditFormProps {
  onSuccess?: () => void
}

export function ProfileEditForm({ onSuccess }: ProfileEditFormProps) {
  const { user } = useUser()
  const profile = useQuery(
    api.profiles.getByClerkId,
    user?.id ? { clerkId: user.id } : 'skip'
  )
  const bars = useQuery(api.bars.list)
  const createOrUpdate = useMutation(api.profiles.createOrUpdate)

  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [favoriteBarId, setFavoriteBarId] = useState<string>('')
  const [isPublic, setIsPublic] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [initialized, setInitialized] = useState(false)

  // Initialize form with profile data when it loads
  if (profile && !initialized) {
    setDisplayName(profile.displayName || '')
    setBio(profile.bio || '')
    setFavoriteBarId(profile.favoriteBarId || '')
    setIsPublic(profile.isPublic)
    setInitialized(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user?.id) return

    if (!displayName.trim()) {
      setError('Navn er påkrævet')
      return
    }

    setIsSubmitting(true)
    setError('')
    setSuccess(false)

    try {
      await createOrUpdate({
        clerkId: user.id,
        displayName: displayName.trim(),
        bio: bio.trim() || undefined,
        favoriteBarId: favoriteBarId ? (favoriteBarId as Id<'bars'>) : undefined,
        isPublic,
        avatarUrl: user.imageUrl,
      })
      setSuccess(true)
      onSuccess?.()
    } catch (err) {
      setError('Kunne ikke gemme profil. Prøv igen.')
      console.error('Failed to update profile:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (profile === undefined) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 text-bodega-accent animate-spin" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar preview */}
      <div className="flex flex-col items-center">
        <UserAvatar
          src={user?.imageUrl}
          name={displayName || user?.fullName}
          size="xl"
        />
        <p className="mt-2 text-xs text-gray-400">
          Profilbillede styres via din Clerk-konto
        </p>
      </div>

      {/* Display name */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Visningsnavn *
        </label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Dit navn"
          maxLength={50}
          className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-bodega-accent/50"
        />
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Bio
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Fortæl lidt om dig selv..."
          rows={3}
          maxLength={200}
          className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-bodega-accent/50 resize-none"
        />
        <p className="mt-1 text-xs text-gray-500">{bio.length}/200</p>
      </div>

      {/* Favorite bar */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Favorit bar
        </label>
        <select
          value={favoriteBarId}
          onChange={(e) => setFavoriteBarId(e.target.value)}
          className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-bodega-accent/50 appearance-none"
        >
          <option value="">Vælg en favorit bar</option>
          {bars?.map((bar) => (
            <option key={bar._id} value={bar._id}>
              {bar.name} {bar.city && `- ${bar.city}`}
            </option>
          ))}
        </select>
      </div>

      {/* Privacy */}
      <div className="flex items-center justify-between p-4 bg-white/[0.04] rounded-xl">
        <div>
          <p className="font-medium text-white">Offentlig profil</p>
          <p className="text-sm text-gray-400">
            Andre kan se din aktivitet og favoritter
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsPublic(!isPublic)}
          className={`relative w-12 h-7 rounded-full transition-colors ${
            isPublic ? 'bg-bodega-accent' : 'bg-white/[0.1]'
          }`}
        >
          <span
            className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${
              isPublic ? 'left-6' : 'left-1'
            }`}
          />
        </button>
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      {/* Success message */}
      {success && (
        <div className="flex items-center gap-2 text-sm text-green-400">
          <Check className="w-4 h-4" />
          Profil gemt!
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 py-3 text-lg font-medium text-white bg-bodega-accent rounded-xl hover:bg-bodega-accent/90 transition-colors disabled:opacity-50"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Gemmer...
          </>
        ) : (
          'Gem profil'
        )}
      </button>
    </form>
  )
}
