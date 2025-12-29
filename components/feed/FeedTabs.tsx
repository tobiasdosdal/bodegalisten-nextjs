'use client'

import { Users, Compass } from 'lucide-react'

interface FeedTabsProps {
  activeTab: 'personal' | 'discover'
  onTabChange: (tab: 'personal' | 'discover') => void
}

export function FeedTabs({ activeTab, onTabChange }: FeedTabsProps) {
  return (
    <div className="flex gap-2 p-1.5 bg-stone-800/50 rounded-xl border border-stone-700/50">
      <button
        onClick={() => onTabChange('personal')}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium rounded-lg transition-all ${
          activeTab === 'personal'
            ? 'bg-gradient-to-r from-bodega-gold to-amber-500 text-bodega-primary shadow-lg'
            : 'text-stone-400 hover:text-bodega-cream hover:bg-stone-800/50'
        }`}
      >
        <Users className="w-4 h-4" />
        <span>Følger</span>
      </button>
      <button
        onClick={() => onTabChange('discover')}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium rounded-lg transition-all ${
          activeTab === 'discover'
            ? 'bg-gradient-to-r from-bodega-gold to-amber-500 text-bodega-primary shadow-lg'
            : 'text-stone-400 hover:text-bodega-cream hover:bg-stone-800/50'
        }`}
      >
        <Compass className="w-4 h-4" />
        <span>Udforsk</span>
      </button>
    </div>
  )
}
