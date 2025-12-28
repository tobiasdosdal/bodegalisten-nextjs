'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { UserAvatar, ProfileStats } from '@/components/social'
import { FollowButton } from '@/components/social/FollowButton'
import { ArrowLeft, Lock, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ userId: string }>
}

export default function PublicProfilePage({ params }: PageProps) {
  const { userId } = use(params)
  const router = useRouter()
  const { user: currentUser } = useUser()

  const profile = useQuery(api.profiles.getPublicProfile, { clerkId: userId })
  const favorites = useQuery(
    api.favorites.getByUser,
    profile?.isPublic ? { userId } : 'skip'
  )

  // Loading
  if (profile === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="w-8 h-8 text-bodega-accent animate-spin" />
      </div>
    )
  }

  // Profile not found
  if (profile === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black px-6">
        <div className="w-24 h-24 rounded-full bg-white/[0.06] flex items-center justify-center mb-6">
          <span className="text-5xl">🤷</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Profil ikke fundet</h1>
        <p className="text-gray-400 text-center mb-6">
          Denne bruger findes ikke eller har slettet sin profil
        </p>
        <button
          onClick={() => router.back()}
          className="px-6 py-3 text-lg font-medium text-white bg-bodega-accent rounded-xl hover:bg-bodega-accent/90 transition-colors"
        >
          Gå tilbage
        </button>
      </div>
    )
  }

  // Check if viewing own profile
  const isOwnProfile = currentUser?.id === userId

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
        <div className="flex flex-col items-center mb-6">
          <UserAvatar
            src={profile.avatarUrl}
            name={profile.displayName}
            size="xl"
          />
          <h2 className="mt-4 text-2xl font-bold text-white">
            {profile.displayName}
          </h2>
          {profile.isPublic && 'bio' in profile && profile.bio && (
            <p className="mt-2 text-gray-400 text-center max-w-xs">
              {profile.bio}
            </p>
          )}
        </div>

        {/* Follow button (if not own profile) */}
        {!isOwnProfile && currentUser && (
          <div className="flex justify-center mb-6">
            <FollowButton targetUserId={userId} />
          </div>
        )}

        {/* Own profile link */}
        {isOwnProfile && (
          <div className="flex justify-center mb-6">
            <Link
              href="/profile"
              className="px-4 py-2 text-sm font-medium text-bodega-accent border border-bodega-accent rounded-lg hover:bg-bodega-accent/10 transition-colors"
            >
              Gå til din profil
            </Link>
          </div>
        )}

        {/* Private profile notice */}
        {!profile.isPublic && !isOwnProfile && (
          <div className="flex flex-col items-center py-12 px-4 bg-white/[0.04] rounded-2xl">
            <Lock className="w-12 h-12 text-gray-500 mb-4" />
            <p className="text-lg font-medium text-white mb-2">Privat profil</p>
            <p className="text-gray-400 text-center">
              Denne bruger har valgt at holde sin aktivitet privat
            </p>
          </div>
        )}

        {/* Public profile content */}
        {profile.isPublic && (
          <>
            {/* Stats */}
            <div className="mb-8 p-4 bg-white/[0.04] rounded-2xl">
              <ProfileStats clerkId={userId} />
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
                    Ingen favoritter endnu
                  </p>
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
          </>
        )}
      </div>
    </div>
  )
}
