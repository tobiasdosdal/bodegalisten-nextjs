'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { UserAvatar, FollowButton, OnlineStatus } from '@/components/social'
import { ArrowLeft, MapPin, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function UserProfilePage({
  params,
}: {
  params: Promise<{ clerkId: string }>
}) {
  const { clerkId } = use(params)
  const router = useRouter()
  const { user: currentUser } = useUser()

  const profile = useQuery(api.profiles.getPublicProfile, { clerkId })
  const stats = useQuery(api.profiles.getProfileStats, { clerkId })
  const onlineStatus = useQuery(api.profiles.getOnlineStatus, { clerkId })

  // Get user's favorites
  const favorites = useQuery(api.favorites.getByUser, { userId: clerkId })

  if (profile === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="w-8 h-8 text-bodega-accent animate-spin" />
      </div>
    )
  }

  if (profile === null) {
    return (
      <div className="min-h-screen bg-black">
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
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <p className="text-gray-400 text-center">Bruger ikke fundet</p>
        </div>
      </div>
    )
  }

  const isOwnProfile = currentUser?.id === clerkId

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

      <div className="px-4 py-6">
        {/* Profile header */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-3">
            <UserAvatar
              src={profile.avatarUrl}
              name={profile.displayName}
              size="xl"
            />
            {onlineStatus?.status === 'active' && (
              <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-green-500 border-3 border-black" />
            )}
          </div>

          <h2 className="text-2xl font-bold text-white mb-1">
            {profile.displayName}
          </h2>

          {onlineStatus && (
            <OnlineStatus
              isOnline={onlineStatus.status === 'active'}
              lastActiveAt={onlineStatus.lastActiveAt}
              showLabel
            />
          )}

          {'bio' in profile && profile.bio && (
            <p className="text-gray-400 text-center mt-2 max-w-xs">
              {profile.bio}
            </p>
          )}

          {/* Follow button */}
          {!isOwnProfile && (
            <div className="mt-4">
              <FollowButton targetUserId={clerkId} />
            </div>
          )}

          {isOwnProfile && (
            <Link
              href="/profile/edit"
              className="mt-4 px-4 py-2 text-sm font-medium text-white border border-white/20 rounded-lg hover:bg-white/[0.06] transition-colors"
            >
              Rediger profil
            </Link>
          )}
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-8 p-4 bg-white/[0.04] rounded-2xl">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{stats.checkInCount}</p>
              <p className="text-xs text-gray-400">Check-ins</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{stats.reviewCount}</p>
              <p className="text-xs text-gray-400">Anmeldelser</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{stats.followerCount}</p>
              <p className="text-xs text-gray-400">Følgere</p>
            </div>
          </div>
        )}

        {/* Private profile notice */}
        {!profile.isPublic && !isOwnProfile && (
          <div className="text-center py-8 px-4 bg-white/[0.04] rounded-2xl">
            <p className="text-gray-400">Denne profil er privat</p>
          </div>
        )}

        {/* Favorite bars - only show for public profiles */}
        {profile.isPublic && favorites && favorites.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Favoritbarer
            </h3>
            <div className="space-y-2">
              {favorites.map((favorite) => (
                <Link
                  key={favorite._id}
                  href={`/?bar=${favorite.bar?._id}`}
                  className="flex items-center gap-3 p-3 bg-white/[0.04] rounded-xl hover:bg-white/[0.06] transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-bodega-primary flex items-center justify-center">
                    <span className="text-lg">🍺</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">
                      {favorite.bar?.name ?? 'Ukendt bar'}
                    </p>
                    {favorite.bar?.city && (
                      <p className="text-sm text-gray-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {favorite.bar.city}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
