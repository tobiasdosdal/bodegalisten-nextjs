'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { ActivityFeed, FeedTabs } from '@/components/feed'
import { ArrowLeft } from 'lucide-react'

export default function FeedPage() {
  const router = useRouter()
  const { isSignedIn } = useUser()
  const [activeTab, setActiveTab] = useState<'personal' | 'discover'>(
    isSignedIn ? 'personal' : 'discover'
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex-shrink-0 px-4 lg:px-8 pt-14 lg:pt-8 pb-4 lg:pb-6 lg:max-w-2xl lg:mx-auto lg:w-full">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-stone-800/50 flex items-center justify-center hover:bg-stone-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-stone-400" />
          </button>
          <div>
            <h1 className="text-3xl lg:text-4xl font-display font-semibold text-bodega-cream tracking-tight">
              Aktivitet
            </h1>
            <p className="text-sm text-stone-500 mt-0.5">
              Se hvad der sker i byen
            </p>
          </div>
        </div>

        {/* Tabs */}
        <FeedTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </header>

      {/* Feed content */}
      <main className="px-4 lg:px-8 pb-4 lg:max-w-2xl lg:mx-auto lg:w-full">
        <ActivityFeed type={activeTab} />
      </main>
    </div>
  )
}
