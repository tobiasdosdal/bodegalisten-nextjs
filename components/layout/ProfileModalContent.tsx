'use client'

import { useEffect } from 'react'
import { useUser, SignInButton } from '@clerk/nextjs'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { UserAvatar, ProfileStats } from '@/components/social'
import { BodegaLoading } from '@/components/bodega'
import { useBarModal } from '@/components/views/BarModalProvider'
import { usePageModal } from './PageModalProvider'
import { Settings, Pencil, ChevronRight, Users, Heart, MapPin } from 'lucide-react'
import Link from 'next/link'

export function ProfileModalContent() {
  const { isSignedIn, isLoaded, user } = useUser()
  const { openBar } = useBarModal()
  const { closeModal, openModal } = usePageModal()

  const profile = useQuery(
    api.profiles.getByClerkId,
    user?.id ? { clerkId: user.id } : 'skip'
  )

  const favorites = useQuery(
    api.favorites.getByUser,
    user?.id ? { userId: user.id } : 'skip'
  )

  const createOrUpdateProfile = useMutation(api.profiles.createOrUpdate)

  useEffect(() => {
    if (isSignedIn && user && profile === null) {
      createOrUpdateProfile({
        clerkId: user.id,
        displayName: user.fullName || user.firstName || 'Anonym',
        avatarUrl: user.imageUrl,
        isPublic: true,
      })
    }
  }, [isSignedIn, user, profile, createOrUpdateProfile])

  if (!isLoaded) {
    return (
      <div className="flex justify-center py-12">
        <BodegaLoading />
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center mb-5 border border-bodega-gold/20">
          <span className="text-4xl">🍺</span>
        </div>
        <h2 className="text-xl font-display font-semibold text-bodega-cream mb-2">Log ind</h2>
        <p className="text-stone-400 text-center text-sm mb-5">
          Log ind for at se din profil, favoritter og aktivitet
        </p>
        <SignInButton mode="modal">
          <button className="px-5 py-2.5 font-semibold text-bodega-primary bg-gradient-to-r from-bodega-gold to-amber-500 rounded-xl hover:brightness-110 transition-all">
            Log ind
          </button>
        </SignInButton>
      </div>
    )
  }

  if (profile === undefined) {
    return (
      <div className="flex justify-center py-12">
        <BodegaLoading />
      </div>
    )
  }

  const handleBarClick = (barId: string) => {
    closeModal()
    openBar(barId)
  }

  return (
    <div className="px-5 py-5">
      <div className="flex flex-col items-center mb-6">
        <div className="relative">
          <UserAvatar
            src={profile?.avatarUrl || user.imageUrl}
            name={profile?.displayName || user.fullName}
            size="lg"
          />
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center border-3 border-bodega-surface">
            <span className="text-xs">🍺</span>
          </div>
        </div>
        <h2 className="mt-3 text-xl font-display font-semibold text-bodega-cream">
          {profile?.displayName || user.fullName || 'Anonym'}
        </h2>
        {profile?.bio && (
          <p className="mt-1.5 text-sm text-stone-400 text-center max-w-xs">
            {profile.bio}
          </p>
        )}
      </div>

      <div className="mb-5 p-3 bg-bodega-surface rounded-xl border border-bodega-gold/10">
        <ProfileStats clerkId={user.id} />
      </div>

      <div className="mb-5 bg-bodega-surface rounded-xl border border-bodega-gold/10 overflow-hidden">
        <button
          onClick={() => openModal('friends')}
          className="w-full flex items-center gap-3 px-3 py-3 hover:bg-bodega-gold/5 transition-colors text-left"
        >
          <div className="w-9 h-9 rounded-lg bg-bodega-gold/15 flex items-center justify-center border border-bodega-gold/25">
            <Users className="w-4 h-4 text-bodega-gold" />
          </div>
          <span className="flex-1 text-sm font-medium text-bodega-cream">Venner</span>
          <ChevronRight className="w-4 h-4 text-stone-600" />
        </button>
        <div className="h-px bg-stone-800/80 ml-[60px]" />
        <Link
          href="/profile/edit"
          onClick={closeModal}
          className="flex items-center gap-3 px-3 py-3 hover:bg-bodega-gold/5 transition-colors"
        >
          <div className="w-9 h-9 rounded-lg bg-blue-500/15 flex items-center justify-center border border-blue-500/25">
            <Pencil className="w-4 h-4 text-blue-400" />
          </div>
          <span className="flex-1 text-sm font-medium text-bodega-cream">Rediger profil</span>
          <ChevronRight className="w-4 h-4 text-stone-600" />
        </Link>
        <div className="h-px bg-stone-800/80 ml-[60px]" />
        <Link
          href="/settings"
          onClick={closeModal}
          className="flex items-center gap-3 px-3 py-3 hover:bg-bodega-gold/5 transition-colors"
        >
          <div className="w-9 h-9 rounded-lg bg-stone-500/15 flex items-center justify-center border border-stone-500/25">
            <Settings className="w-4 h-4 text-stone-400" />
          </div>
          <span className="flex-1 text-sm font-medium text-bodega-cream">Indstillinger</span>
          <ChevronRight className="w-4 h-4 text-stone-600" />
        </Link>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-xs font-semibold text-bodega-cream uppercase tracking-wide">
            Favorit barer
          </h3>
          <Heart className="w-3.5 h-3.5 text-red-400" />
        </div>
        {favorites === undefined ? (
          <div className="flex justify-center py-6">
            <BodegaLoading />
          </div>
        ) : favorites.length === 0 ? (
          <div className="flex flex-col items-center py-8 px-4 bg-bodega-surface rounded-xl border border-bodega-gold/10">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/10 flex items-center justify-center mb-3 border border-red-500/20">
              <Heart className="w-6 h-6 text-red-400" />
            </div>
            <p className="text-sm text-stone-400 text-center mb-3">
              Du har ingen favoritter endnu
            </p>
            <button
              onClick={closeModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-bodega-gold to-amber-500 text-bodega-primary font-semibold text-xs rounded-lg hover:brightness-110 transition-all"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Find barer</span>
            </button>
          </div>
        ) : (
          <div className="bg-bodega-surface rounded-xl border border-bodega-gold/10 overflow-hidden">
            {favorites.map((fav, index) => (
              <div key={fav._id}>
                <button
                  onClick={() => handleBarClick(fav.barId)}
                  className="w-full flex items-center gap-3 px-3 py-3 hover:bg-bodega-gold/5 transition-colors text-left"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-sm">
                    <span className="text-base">🍺</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-bodega-cream truncate">
                      {fav.bar?.name}
                    </p>
                    <p className="text-xs text-stone-500 truncate">
                      {fav.bar?.city}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-600" />
                </button>
                {index < favorites.length - 1 && (
                  <div className="h-px bg-stone-800/80 ml-[60px]" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
