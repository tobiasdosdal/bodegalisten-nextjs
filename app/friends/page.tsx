'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { FriendCard } from '@/components/social'
import { ArrowLeft, Users, UserPlus, UserCheck, Search, Loader2 } from 'lucide-react'
import Link from 'next/link'

type Tab = 'friends' | 'following' | 'followers'

export default function FriendsPage() {
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const [activeTab, setActiveTab] = useState<Tab>('friends')

  const friends = useQuery(
    api.follows.getFriends,
    user?.id ? { userId: user.id } : 'skip'
  )

  const following = useQuery(
    api.follows.getFollowingWithProfiles,
    user?.id ? { userId: user.id } : 'skip'
  )

  const followers = useQuery(
    api.follows.getFollowersWithProfiles,
    user?.id ? { userId: user.id } : 'skip'
  )

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="w-8 h-8 text-bodega-accent animate-spin" />
      </div>
    )
  }

  if (!user) {
    router.push('/profile')
    return null
  }

  const tabs = [
    {
      id: 'friends' as Tab,
      label: 'Venner',
      icon: Users,
      count: friends?.length ?? 0,
    },
    {
      id: 'following' as Tab,
      label: 'Følger',
      icon: UserPlus,
      count: following?.length ?? 0,
    },
    {
      id: 'followers' as Tab,
      label: 'Følgere',
      icon: UserCheck,
      count: followers?.length ?? 0,
    },
  ]

  const currentData = activeTab === 'friends' ? friends : activeTab === 'following' ? following : followers
  const isLoading = currentData === undefined

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
          <h1 className="text-lg font-semibold text-white">Venner</h1>
          <Link
            href="/search/users"
            className="w-10 h-10 rounded-full bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.1] transition-colors"
          >
            <Search className="w-5 h-5 text-white" />
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/[0.06]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors relative ${
                activeTab === tab.id
                  ? 'text-bodega-accent'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                activeTab === tab.id
                  ? 'bg-bodega-accent/20 text-bodega-accent'
                  : 'bg-white/[0.06] text-gray-400'
              }`}>
                {tab.count}
              </span>
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-bodega-accent" />
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <div className="px-4 py-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-bodega-accent animate-spin" />
          </div>
        ) : currentData && currentData.length > 0 ? (
          <div className="space-y-2">
            {activeTab === 'friends' && friends?.map((friend) => (
              <FriendCard
                key={friend.clerkId}
                clerkId={friend.clerkId}
                displayName={friend.displayName}
                avatarUrl={friend.avatarUrl}
                bio={friend.bio}
                lastActiveAt={friend.lastActiveAt}
                isOnline={friend.isOnline}
                isMutual
                activeCheckIn={friend.activeCheckIn}
                currentUserId={user.id}
              />
            ))}

            {activeTab === 'following' && following?.map((person) => (
              <FriendCard
                key={person.clerkId}
                clerkId={person.clerkId}
                displayName={person.displayName}
                avatarUrl={person.avatarUrl}
                bio={person.bio}
                lastActiveAt={person.lastActiveAt}
                isOnline={person.isOnline}
                isMutual={person.isMutual}
                currentUserId={user.id}
                showFollowButton
              />
            ))}

            {activeTab === 'followers' && followers?.map((person) => (
              <FriendCard
                key={person.clerkId}
                clerkId={person.clerkId}
                displayName={person.displayName}
                avatarUrl={person.avatarUrl}
                bio={person.bio}
                lastActiveAt={person.lastActiveAt}
                isOnline={person.isOnline}
                isMutual={person.isMutual}
                currentUserId={user.id}
                showFollowButton
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/[0.04] flex items-center justify-center">
              {activeTab === 'friends' ? (
                <Users className="w-8 h-8 text-gray-500" />
              ) : activeTab === 'following' ? (
                <UserPlus className="w-8 h-8 text-gray-500" />
              ) : (
                <UserCheck className="w-8 h-8 text-gray-500" />
              )}
            </div>
            <p className="text-gray-400">
              {activeTab === 'friends'
                ? 'Du har ingen venner endnu. Venner er folk der følger hinanden.'
                : activeTab === 'following'
                ? 'Du følger ingen endnu.'
                : 'Ingen følger dig endnu.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
