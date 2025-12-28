'use client'

import { useEffect } from 'react'
import { useUser, SignInButton } from '@clerk/nextjs'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { UserAvatar, ProfileStats } from '@/components/social'
import { useBarModal } from '@/components/views/BarModalProvider'
import { usePageModal } from './PageModalProvider'
import { Settings, Pencil, ChevronRight, Users, Loader2 } from 'lucide-react'
import Link from 'next/link'

export function ProfileModalContent() {
  const { isSignedIn, isLoaded, user } = useUser()
  const { openBar } = useBarModal()
  const { closeModal } = usePageModal()

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
        <Loader2 className="w-8 h-8 text-bodega-accent animate-spin" />
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6">
        <div className="w-20 h-20 rounded-full bg-bodega-accent/20 flex items-center justify-center mb-5">
          <span className="text-4xl">🍺</span>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Log ind</h2>
        <p className="text-gray-400 text-center text-sm mb-5">
          Log ind for at se din profil, favoritter og aktivitet
        </p>
        <SignInButton mode="modal">
          <button className="px-5 py-2.5 font-medium text-white bg-bodega-accent rounded-xl hover:bg-bodega-accent/90 transition-colors">
            Log ind
          </button>
        </SignInButton>
      </div>
    )
  }

  if (profile === undefined) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-bodega-accent animate-spin" />
      </div>
    )
  }

  const handleBarClick = (barId: string) => {
    closeModal()
    openBar(barId)
  }

  return (
    <div className="px-4 py-5">
      <div className="flex flex-col items-center mb-6">
        <UserAvatar
          src={profile?.avatarUrl || user.imageUrl}
          name={profile?.displayName || user.fullName}
          size="lg"
        />
        <h2 className="mt-3 text-xl font-bold text-white">
          {profile?.displayName || user.fullName || 'Anonym'}
        </h2>
        {profile?.bio && (
          <p className="mt-1.5 text-sm text-gray-400 text-center max-w-xs">
            {profile.bio}
          </p>
        )}
      </div>

      <div className="mb-5 p-3 bg-white/[0.04] rounded-xl">
        <ProfileStats clerkId={user.id} />
      </div>

      <div className="mb-5 bg-white/[0.04] rounded-xl overflow-hidden">
        <Link
          href="/friends"
          onClick={closeModal}
          className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/[0.04] transition-colors"
        >
          <div className="w-7 h-7 rounded-lg bg-bodega-accent/20 flex items-center justify-center">
            <Users className="w-3.5 h-3.5 text-bodega-accent" />
          </div>
          <span className="flex-1 text-sm text-white">Venner</span>
          <ChevronRight className="w-4 h-4 text-gray-500" />
        </Link>
        <div className="h-px bg-white/[0.06] ml-12" />
        <Link
          href="/profile/edit"
          onClick={closeModal}
          className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/[0.04] transition-colors"
        >
          <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <Pencil className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <span className="flex-1 text-sm text-white">Rediger profil</span>
          <ChevronRight className="w-4 h-4 text-gray-500" />
        </Link>
        <div className="h-px bg-white/[0.06] ml-12" />
        <Link
          href="/settings"
          onClick={closeModal}
          className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/[0.04] transition-colors"
        >
          <div className="w-7 h-7 rounded-lg bg-gray-500/20 flex items-center justify-center">
            <Settings className="w-3.5 h-3.5 text-gray-400" />
          </div>
          <span className="flex-1 text-sm text-white">Indstillinger</span>
          <ChevronRight className="w-4 h-4 text-gray-500" />
        </Link>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Favorit barer
        </h3>
        {favorites === undefined ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-5 h-5 text-bodega-accent animate-spin" />
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-6 px-4 bg-white/[0.04] rounded-xl">
            <p className="text-sm text-gray-400">
              Du har ingen favoritter endnu
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {favorites.map((fav) => (
              <button
                key={fav._id}
                onClick={() => handleBarClick(fav.barId)}
                className="w-full flex items-center gap-3 p-2.5 bg-white/[0.04] rounded-xl hover:bg-white/[0.06] transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-lg bg-bodega-accent/20 flex items-center justify-center">
                  <span className="text-base">🍺</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {fav.bar?.name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {fav.bar?.city}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
