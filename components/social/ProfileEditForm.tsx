'use client'

import { useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { useUser } from '@clerk/nextjs'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { UserAvatar } from './UserAvatar'
import { BodegaLoading } from '@/components/bodega'
import { Check, User, FileText, Heart, Eye, ChevronDown, AlertCircle } from 'lucide-react'

interface ProfileEditFormProps {
  onSuccess?: () => void
  compact?: boolean
}

export function ProfileEditForm({ onSuccess, compact = false }: ProfileEditFormProps) {
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
      setTimeout(() => {
        onSuccess?.()
      }, 500)
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
        <BodegaLoading />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Avatar preview */}
      <div className="flex flex-col items-center py-4">
        <div className="relative">
          <UserAvatar
            src={user?.imageUrl}
            name={displayName || user?.fullName}
            size={compact ? 'lg' : 'xl'}
          />
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center border-3 border-bodega-surface">
            <span className="text-xs">🍺</span>
          </div>
        </div>
        <p className="mt-3 text-xs text-stone-500 text-center">
          Profilbillede styres via din Clerk-konto
        </p>
      </div>

      {/* Display name */}
      <div className="bg-bodega-surface rounded-xl border border-bodega-gold/10 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center border border-blue-500/25">
            <User className="w-4 h-4 text-blue-400" />
          </div>
          <label className="text-sm font-medium text-bodega-cream">
            Visningsnavn <span className="text-bodega-gold">*</span>
          </label>
        </div>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Dit navn"
          maxLength={50}
          className="w-full px-4 py-3 bg-stone-800/50 border border-stone-700/50 rounded-xl text-bodega-cream placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-bodega-gold/50 focus:border-bodega-gold/50 transition-all"
        />
      </div>

      {/* Bio */}
      <div className="bg-bodega-surface rounded-xl border border-bodega-gold/10 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center border border-purple-500/25">
            <FileText className="w-4 h-4 text-purple-400" />
          </div>
          <label className="text-sm font-medium text-bodega-cream">
            Bio
          </label>
        </div>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Fortæl lidt om dig selv..."
          rows={3}
          maxLength={200}
          className="w-full px-4 py-3 bg-stone-800/50 border border-stone-700/50 rounded-xl text-bodega-cream placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-bodega-gold/50 focus:border-bodega-gold/50 transition-all resize-none"
        />
        <div className="flex justify-end mt-2">
          <span className={`text-xs ${bio.length > 180 ? 'text-amber-400' : 'text-stone-500'}`}>
            {bio.length}/200
          </span>
        </div>
      </div>

      {/* Favorite bar */}
      <div className="bg-bodega-surface rounded-xl border border-bodega-gold/10 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center border border-red-500/25">
            <Heart className="w-4 h-4 text-red-400" />
          </div>
          <label className="text-sm font-medium text-bodega-cream">
            Favorit bar
          </label>
        </div>
        <div className="relative">
          <select
            value={favoriteBarId}
            onChange={(e) => setFavoriteBarId(e.target.value)}
            className="w-full px-4 py-3 bg-stone-800/50 border border-stone-700/50 rounded-xl text-bodega-cream focus:outline-none focus:ring-2 focus:ring-bodega-gold/50 focus:border-bodega-gold/50 transition-all appearance-none cursor-pointer"
          >
            <option value="">Vælg en favorit bar</option>
            {bars?.map((bar) => (
              <option key={bar._id} value={bar._id}>
                {bar.name} {bar.city && `- ${bar.city}`}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500 pointer-events-none" />
        </div>
      </div>

      {/* Privacy */}
      <div className="bg-bodega-surface rounded-xl border border-bodega-gold/10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-500/15 flex items-center justify-center border border-green-500/25">
              <Eye className="w-4 h-4 text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-bodega-cream">Offentlig profil</p>
              <p className="text-xs text-stone-500">
                Andre kan se din aktivitet
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsPublic(!isPublic)}
            className={`relative w-12 h-7 rounded-full transition-all ${
              isPublic
                ? 'bg-gradient-to-r from-bodega-gold to-amber-500'
                : 'bg-stone-700'
            }`}
          >
            <span
              className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                isPublic ? 'left-6' : 'left-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="flex items-center gap-2 px-4 py-3 bg-green-500/10 border border-green-500/20 rounded-xl">
          <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
          <p className="text-sm text-green-400">Profil gemt!</p>
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 py-3.5 text-base font-semibold text-bodega-primary bg-gradient-to-r from-bodega-gold to-amber-500 rounded-xl hover:brightness-110 transition-all disabled:opacity-50 shadow-lg shadow-amber-500/20"
      >
        {isSubmitting ? (
          <>
            <BodegaLoading />
            <span>Gemmer...</span>
          </>
        ) : (
          'Gem profil'
        )}
      </button>
    </form>
  )
}
