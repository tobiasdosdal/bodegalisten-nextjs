'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, SignInButton } from '@clerk/nextjs'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { UserAvatar, ProfileStats } from '@/components/social'
import { BodegaLoading } from '@/components/bodega'
import { ArrowLeft, Settings, Pencil, ChevronRight, Users, Heart, MapPin } from 'lucide-react'
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
      <div className="flex items-center justify-center min-h-screen bg-background">
        <BodegaLoading />
      </div>
    )
  }

  // Not signed in
  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background px-6">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center mb-6 border border-bodega-gold/20">
          <span className="text-5xl">🍺</span>
        </div>
        <h1 className="text-3xl font-display font-semibold text-bodega-cream mb-2">Log ind</h1>
        <p className="text-stone-400 text-center mb-6 max-w-xs">
          Log ind for at se din profil, favoritter og aktivitet
        </p>
        <SignInButton mode="modal">
          <button className="px-6 py-3.5 text-base font-semibold text-bodega-primary bg-gradient-to-r from-bodega-gold to-amber-500 rounded-xl hover:brightness-110 transition-all shadow-lg">
            Log ind
          </button>
        </SignInButton>
        <button
          onClick={() => router.back()}
          className="mt-4 text-stone-500 hover:text-bodega-cream transition-colors"
        >
          Gå tilbage
        </button>
      </div>
    )
  }

  // Loading profile
  if (profile === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <BodegaLoading />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex-shrink-0 px-4 lg:px-8 pt-14 lg:pt-8 pb-4 lg:pb-6 lg:max-w-2xl lg:mx-auto lg:w-full">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-stone-800/50 flex items-center justify-center hover:bg-stone-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-stone-400" />
          </button>
          <h1 className="text-3xl lg:text-4xl font-display font-semibold text-bodega-cream tracking-tight">
            Profil
          </h1>
        </div>

        {/* Avatar and name */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <UserAvatar
              src={profile?.avatarUrl || user.imageUrl}
              name={profile?.displayName || user.fullName}
              size="xl"
            />
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center border-4 border-bodega-surface">
              <span className="text-sm">🍺</span>
            </div>
          </div>
          <h2 className="mt-4 text-2xl font-display font-semibold text-bodega-cream">
            {profile?.displayName || user.fullName || 'Anonym'}
          </h2>
          {profile?.bio && (
            <p className="mt-2 text-stone-400 text-center max-w-xs">
              {profile.bio}
            </p>
          )}
        </div>
      </header>

      {/* Profile content */}
      <main className="px-4 lg:px-8 pb-8 lg:max-w-2xl lg:mx-auto lg:w-full">
        {/* Stats */}
        <div className="mb-6 p-4 bg-bodega-surface rounded-2xl border border-bodega-gold/10">
          <ProfileStats clerkId={user.id} />
        </div>

        {/* Action links */}
        <div className="mb-6 bg-bodega-surface rounded-2xl border border-bodega-gold/10 overflow-hidden">
          <Link
            href="/friends"
            className="flex items-center gap-3 px-4 py-3.5 hover:bg-bodega-gold/5 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-bodega-gold/15 flex items-center justify-center border border-bodega-gold/25">
              <Users className="w-5 h-5 text-bodega-gold" />
            </div>
            <span className="flex-1 text-bodega-cream font-medium">Venner</span>
            <ChevronRight className="w-5 h-5 text-stone-600" />
          </Link>
          <div className="h-px bg-stone-800/80 ml-[72px]" />
          <Link
            href="/profile/edit"
            className="flex items-center gap-3 px-4 py-3.5 hover:bg-bodega-gold/5 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center border border-blue-500/25">
              <Pencil className="w-5 h-5 text-blue-400" />
            </div>
            <span className="flex-1 text-bodega-cream font-medium">Rediger profil</span>
            <ChevronRight className="w-5 h-5 text-stone-600" />
          </Link>
          <div className="h-px bg-stone-800/80 ml-[72px]" />
          <Link
            href="/settings"
            className="flex items-center gap-3 px-4 py-3.5 hover:bg-bodega-gold/5 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-stone-500/15 flex items-center justify-center border border-stone-500/25">
              <Settings className="w-5 h-5 text-stone-400" />
            </div>
            <span className="flex-1 text-bodega-cream font-medium">Indstillinger</span>
            <ChevronRight className="w-5 h-5 text-stone-600" />
          </Link>
        </div>

        {/* Favorite bars */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-sm font-semibold text-bodega-cream">Favorit barer</h3>
            <Heart className="w-4 h-4 text-red-400" />
          </div>
          {favorites === undefined ? (
            <div className="flex justify-center py-8">
              <BodegaLoading />
            </div>
          ) : favorites.length === 0 ? (
            <div className="flex flex-col items-center py-10 px-6 bg-bodega-surface rounded-2xl border border-bodega-gold/10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-600/10 flex items-center justify-center mb-4 border border-red-500/20">
                <Heart className="w-8 h-8 text-red-400" />
              </div>
              <p className="text-stone-400 text-center mb-4">
                Du har ingen favoritter endnu
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-bodega-gold to-amber-500 text-bodega-primary font-semibold text-sm rounded-xl hover:brightness-110 transition-all"
              >
                <MapPin className="w-4 h-4" />
                <span>Find barer</span>
              </Link>
            </div>
          ) : (
            <div className="bg-bodega-surface rounded-2xl border border-bodega-gold/10 overflow-hidden">
              {favorites.map((fav, index) => (
                <div key={fav._id}>
                  <Link
                    href={`/?bar=${fav.barId}`}
                    className="flex items-center gap-3 px-4 py-3.5 hover:bg-bodega-gold/5 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-md">
                      <span className="text-lg">🍺</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-bodega-cream truncate">
                        {fav.bar?.name}
                      </p>
                      <p className="text-sm text-stone-500 truncate">
                        {fav.bar?.city}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-stone-600" />
                  </Link>
                  {index < favorites.length - 1 && (
                    <div className="h-px bg-stone-800/80 ml-[72px]" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
