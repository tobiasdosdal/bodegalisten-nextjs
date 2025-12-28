'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, SignInButton } from '@clerk/nextjs'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { UserAvatar, ProfileStats } from '@/components/social'
import { ArrowLeft, Settings, Pencil, ChevronRight, Users, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  const router = useRouter()
  const { isSignedIn, isLoaded, user } = useUser()

  const profile = useQuery(
    api.profiles.getByClerkId,
    user?.id ? { clerkId: user.id } : 'skip'
  )

  const favorites = useQuery(
    api.favorites.getByUser,
    user?.id ? { userId: user.id } : 'skip'
  )

  const createOrUpdateProfile = useMutation(api.profiles.createOrUpdate)

  // Auto-create profile if it doesn't exist
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

  // Show loading while checking auth
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="w-8 h-8 text-bodega-accent animate-spin" />
      </div>
    )
  }

  // Not signed in
  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black px-6">
        <div className="w-24 h-24 rounded-full bg-bodega-accent/20 flex items-center justify-center mb-6">
          <span className="text-5xl">🍺</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Log ind</h1>
        <p className="text-gray-400 text-center mb-6">
          Log ind for at se din profil, favoritter og aktivitet
        </p>
        <SignInButton mode="modal">
          <button className="px-6 py-3 text-lg font-medium text-white bg-bodega-accent rounded-xl hover:bg-bodega-accent/90 transition-colors">
            Log ind
          </button>
        </SignInButton>
        <button
          onClick={() => router.back()}
          className="mt-4 text-gray-400 hover:text-white transition-colors"
        >
          Gå tilbage
        </button>
      </div>
    )
  }

  // Loading profile
  if (profile === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="w-8 h-8 text-bodega-accent animate-spin" />
      </div>
    )
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
          <h1 className="text-lg font-semibold text-white">Profil</h1>
          <div className="w-10" />
        </div>
      </header>

      {/* Profile content */}
      <div className="px-4 py-6">
        {/* Avatar and name */}
        <div className="flex flex-col items-center mb-8">
          <UserAvatar
            src={profile?.avatarUrl || user.imageUrl}
            name={profile?.displayName || user.fullName}
            size="xl"
          />
          <h2 className="mt-4 text-2xl font-bold text-white">
            {profile?.displayName || user.fullName || 'Anonym'}
          </h2>
          {profile?.bio && (
            <p className="mt-2 text-gray-400 text-center max-w-xs">
              {profile.bio}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="mb-8 p-4 bg-white/[0.04] rounded-2xl">
          <ProfileStats clerkId={user.id} />
        </div>

        {/* Action links */}
        <div className="mb-8 bg-white/[0.04] rounded-2xl overflow-hidden">
          <Link
            href="/friends"
            className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.04] transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-bodega-accent/20 flex items-center justify-center">
              <Users className="w-4 h-4 text-bodega-accent" />
            </div>
            <span className="flex-1 text-white">Venner</span>
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </Link>
          <div className="h-px bg-white/[0.06] ml-14" />
          <Link
            href="/profile/edit"
            className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.04] transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Pencil className="w-4 h-4 text-blue-400" />
            </div>
            <span className="flex-1 text-white">Rediger profil</span>
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </Link>
          <div className="h-px bg-white/[0.06] ml-14" />
          <Link
            href="/settings"
            className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.04] transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-gray-500/20 flex items-center justify-center">
              <Settings className="w-4 h-4 text-gray-400" />
            </div>
            <span className="flex-1 text-white">Indstillinger</span>
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </Link>
        </div>

        {/* Favorite bars */}
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
            Favorit barer
          </h3>
          {favorites === undefined ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 text-bodega-accent animate-spin" />
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-8 px-4 bg-white/[0.04] rounded-2xl">
              <p className="text-gray-400">
                Du har ingen favoritter endnu
              </p>
              <Link
                href="/"
                className="inline-block mt-3 text-bodega-accent hover:underline"
              >
                Find barer at gemme
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {favorites.map((fav) => (
                <Link
                  key={fav._id}
                  href={`/?bar=${fav.barId}`}
                  className="flex items-center gap-3 p-3 bg-white/[0.04] rounded-xl hover:bg-white/[0.06] transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-bodega-accent/20 flex items-center justify-center">
                    <span className="text-lg">🍺</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">
                      {fav.bar?.name}
                    </p>
                    <p className="text-sm text-gray-400 truncate">
                      {fav.bar?.city}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
