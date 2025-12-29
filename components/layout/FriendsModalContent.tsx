'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { FriendCard } from '@/components/social'
import { BodegaLoading } from '@/components/bodega'
import { usePageModal } from './PageModalProvider'
import { Users, UserPlus, UserCheck, Search } from 'lucide-react'
import Link from 'next/link'

type Tab = 'friends' | 'following' | 'followers'

export function FriendsModalContent() {
  const { user, isLoaded } = useUser()
  const { closeModal } = usePageModal()
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
      <div className="flex justify-center py-12">
        <BodegaLoading />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6">
        <div className="w-16 h-16 rounded-2xl bg-bodega-gold/15 flex items-center justify-center mb-4 border border-bodega-gold/25">
          <Users className="w-8 h-8 text-bodega-gold" />
        </div>
        <p className="text-stone-400 text-center">
          Log ind for at se dine venner
        </p>
      </div>
    )
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
    <>
      {/* Tabs */}
      <div className="sticky top-0 z-10 bg-bodega-surface/95 backdrop-blur-sm px-5 py-4 border-b border-bodega-gold/10">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-stone-500">Folk du kender</p>
          <Link
            href="/search/users"
            onClick={closeModal}
            className="w-8 h-8 rounded-lg bg-bodega-gold/15 flex items-center justify-center border border-bodega-gold/25 hover:bg-bodega-gold/25 transition-colors"
          >
            <Search className="w-4 h-4 text-bodega-gold" />
          </Link>
        </div>
        <div className="flex gap-2 p-1 bg-stone-800/50 rounded-xl border border-stone-700/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-bodega-gold to-amber-500 text-bodega-primary shadow-lg shadow-amber-500/20'
                  : 'text-stone-400 hover:text-bodega-cream hover:bg-stone-800/50'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span className={`px-1 py-0.5 text-[10px] rounded-full ${
                activeTab === tab.id
                  ? 'bg-bodega-primary/20 text-bodega-primary'
                  : 'bg-stone-700/50 text-stone-500'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <BodegaLoading />
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
          <div className="flex flex-col items-center py-10 px-4 bg-stone-800/30 rounded-xl border border-stone-700/50">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-3 border ${
              activeTab === 'friends'
                ? 'bg-bodega-gold/15 border-bodega-gold/25'
                : activeTab === 'following'
                ? 'bg-blue-500/15 border-blue-500/25'
                : 'bg-green-500/15 border-green-500/25'
            }`}>
              {activeTab === 'friends' ? (
                <Users className="w-7 h-7 text-bodega-gold" />
              ) : activeTab === 'following' ? (
                <UserPlus className="w-7 h-7 text-blue-400" />
              ) : (
                <UserCheck className="w-7 h-7 text-green-400" />
              )}
            </div>
            <p className="text-sm text-stone-400 text-center mb-3">
              {activeTab === 'friends'
                ? 'Du har ingen venner endnu'
                : activeTab === 'following'
                ? 'Du følger ingen endnu'
                : 'Ingen følger dig endnu'}
            </p>
            <Link
              href="/search/users"
              onClick={closeModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-bodega-gold to-amber-500 text-bodega-primary font-semibold text-xs rounded-lg hover:brightness-110 transition-all"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Find folk</span>
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
