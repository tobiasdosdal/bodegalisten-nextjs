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
      <div className="sticky top-0 z-10 bg-bodega-surface/95 backdrop-blur-sm px-5 py-4 border-b border-bodega-gold/10">
        <FeedTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
      <div className="px-5 py-4">
        <ActivityFeed type={activeTab} />
      </div>
    </>
  )
}
