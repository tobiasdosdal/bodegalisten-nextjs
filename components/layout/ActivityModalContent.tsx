'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { ActivityFeed, FeedTabs } from '@/components/feed'

export function ActivityModalContent() {
  const { isSignedIn } = useUser()
  const [activeTab, setActiveTab] = useState<'personal' | 'discover'>(
    isSignedIn ? 'personal' : 'discover'
  )

  return (
    <>
      <div className="sticky top-0 bg-bodega-surface px-4 py-3 border-b border-white/[0.06]">
        <FeedTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
      <div className="px-4 py-4">
        <ActivityFeed type={activeTab} />
      </div>
    </>
  )
}
