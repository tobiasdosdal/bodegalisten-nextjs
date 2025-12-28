'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { Map, List, Rss, User } from 'lucide-react'

interface Tab {
  id: string
  label: string
  icon: ReactNode
  href?: string // If set, renders as Link instead of button
}

const tabs: Tab[] = [
  { id: 'map', label: 'Kort', icon: <Map className="w-6 h-6" /> },
  { id: 'list', label: 'Barer', icon: <List className="w-6 h-6" /> },
  { id: 'feed', label: 'Aktivitet', icon: <Rss className="w-6 h-6" />, href: '/feed' },
  { id: 'profile', label: 'Profil', icon: <User className="w-6 h-6" />, href: '/profile' },
]

interface TabBarProps {
  activeTab: string
  onTabChange: (tabId: string) => void
}

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-bodega-surface/95 backdrop-blur-xl border-t border-bodega-gold/10 safe-area-bottom"
      role="tablist"
      aria-label="Hovednavigation"
    >
      <div className="flex items-center justify-around h-[64px] px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id

          // Common styles - Copenhagen Tavern warm glow
          const className = `relative flex flex-col items-center justify-center flex-1 h-full py-2 transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-bodega-gold focus-visible:ring-inset ${
            isActive
              ? 'text-bodega-gold'
              : 'text-stone-500 active:text-stone-400'
          }`

          const content = (
            <>
              {isActive && (
                <span
                  className="absolute inset-x-3 top-1.5 bottom-1.5 bg-bodega-gold/10 rounded-xl -z-10"
                  style={{ boxShadow: '0 0 20px rgba(245, 180, 65, 0.1)' }}
                  aria-hidden="true"
                />
              )}
              <span
                className={`transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}
                aria-hidden="true"
              >
                {tab.icon}
              </span>
              <span className={`text-[11px] mt-1.5 font-medium ${isActive ? 'text-bodega-gold' : ''}`}>
                {tab.label}
              </span>
            </>
          )

          // Render as Link if href is set, otherwise as button
          if (tab.href) {
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={className}
                aria-label={tab.label}
              >
                {content}
              </Link>
            )
          }

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              role="tab"
              aria-selected={isActive}
              aria-controls={`${tab.id}-panel`}
              id={`${tab.id}-tab`}
              className={className}
            >
              {content}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
