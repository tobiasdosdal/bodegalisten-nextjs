'use client'

interface FeedTabsProps {
  activeTab: 'personal' | 'discover'
  onTabChange: (tab: 'personal' | 'discover') => void
}

export function FeedTabs({ activeTab, onTabChange }: FeedTabsProps) {
  return (
    <div className="flex gap-1 p-1 bg-white/[0.04] rounded-xl">
      <button
        onClick={() => onTabChange('personal')}
        className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-colors ${
          activeTab === 'personal'
            ? 'bg-bodega-accent text-white'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        Følger
      </button>
      <button
        onClick={() => onTabChange('discover')}
        className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-colors ${
          activeTab === 'discover'
            ? 'bg-bodega-accent text-white'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        Udforsk
      </button>
    </div>
  )
}
