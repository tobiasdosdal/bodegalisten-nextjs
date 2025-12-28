'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { FriendCard } from '@/components/social'
import { ArrowLeft, Search, X, Users, Loader2 } from 'lucide-react'

export default function UserSearchPage() {
  const router = useRouter()
  const { user } = useUser()
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const searchResults = useQuery(
    api.profiles.search,
    debouncedQuery.length >= 2 ? { query: debouncedQuery } : 'skip'
  )

  const isSearching = debouncedQuery.length >= 2 && searchResults === undefined

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.1] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>

          {/* Search input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Søg efter brugere..."
              autoFocus
              className="w-full pl-10 pr-10 py-2.5 bg-white/[0.06] border border-white/[0.06] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-bodega-accent/50 focus:ring-1 focus:ring-bodega-accent/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white/[0.1] flex items-center justify-center hover:bg-white/[0.2]"
              >
                <X className="w-3 h-3 text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 py-4">
        {/* Empty state - no search yet */}
        {!debouncedQuery && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/[0.04] flex items-center justify-center">
              <Users className="w-8 h-8 text-gray-500" />
            </div>
            <p className="text-gray-400">
              Skriv mindst 2 tegn for at søge
            </p>
          </div>
        )}

        {/* Searching */}
        {isSearching && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-bodega-accent animate-spin" />
          </div>
        )}

        {/* Results */}
        {searchResults && searchResults.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-gray-500 mb-3">
              {searchResults.length} resultat{searchResults.length !== 1 ? 'er' : ''}
            </p>
            {searchResults.map((person) => (
              <FriendCard
                key={person.clerkId}
                clerkId={person.clerkId}
                displayName={person.displayName}
                avatarUrl={person.avatarUrl}
                bio={person.bio}
                lastActiveAt={person.lastActiveAt}
                isOnline={person.isOnline}
                currentUserId={user?.id}
                showFollowButton
              />
            ))}
          </div>
        )}

        {/* No results */}
        {searchResults && searchResults.length === 0 && debouncedQuery.length >= 2 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/[0.04] flex items-center justify-center">
              <Search className="w-8 h-8 text-gray-500" />
            </div>
            <p className="text-gray-400">
              Ingen brugere fundet for "{debouncedQuery}"
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
