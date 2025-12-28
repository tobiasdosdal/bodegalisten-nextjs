'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { ActivityFeed, FeedTabs } from '@/components/feed'
import { ArrowLeft, User } from 'lucide-react'
import Link from 'next/link'

export default function FeedPage() {
  const router = useRouter()
  const { isSignedIn } = useUser()
  const [activeTab, setActiveTab] = useState<'personal' | 'discover'>(
    isSignedIn ? 'personal' : 'discover'
  )

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
          <h1 className="text-lg font-semibold text-white">Aktivitet</h1>
          <Link
            href="/profile"
            className="w-10 h-10 rounded-full bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.1] transition-colors"
          >
            <User className="w-5 h-5 text-white" />
          </Link>
        </div>

        {/* Tabs */}
        <div className="px-4 pb-3">
          <FeedTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </header>

      {/* Feed content */}
      <div className="px-4 py-4">
        <ActivityFeed type={activeTab} />
      </div>
    </div>
  )
}
