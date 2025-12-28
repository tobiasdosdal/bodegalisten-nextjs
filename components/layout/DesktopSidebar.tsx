'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { Map, List, Rss, User } from 'lucide-react'

interface Tab {
  id: string
  label: string
  icon: ReactNode
  href?: string
}

const tabs: Tab[] = [
  { id: 'map', label: 'Kort', icon: <Map className="w-6 h-6" /> },
  { id: 'list', label: 'Oversigt', icon: <List className="w-6 h-6" /> },
  { id: 'feed', label: 'Aktivitet', icon: <Rss className="w-6 h-6" />, href: '/feed' },
  { id: 'profile', label: 'Profil', icon: <User className="w-6 h-6" />, href: '/profile' },
]

interface DesktopSidebarProps {
  activeTab: string
  onTabChange: (tabId: string) => void
}

export function DesktopSidebar({ activeTab, onTabChange }: DesktopSidebarProps) {
  return (
    <aside
      className="hidden lg:flex fixed left-0 top-0 bottom-0 w-20 flex-col bg-bodega-surface border-r border-white/[0.06] z-50"
      role="navigation"
      aria-label="Hovednavigation"
    >
      {/* Logo */}
      <div className="flex items-center justify-center h-20 border-b border-white/[0.06]">
        <span className="text-3xl" aria-label="Bodegalisten">🍺</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col items-center py-4 gap-2" role="tablist">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id

          const className = `
            relative flex items-center justify-center w-14 h-14 rounded-xl
            transition-all duration-200 focus:outline-none
            focus-visible:ring-2 focus-visible:ring-bodega-accent
            ${isActive
              ? 'text-bodega-accent bg-bodega-accent/10'
              : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.04]'
            }
          `

          const content = (
            <>
              {isActive && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-bodega-accent rounded-r-full"
                  aria-hidden="true"
                />
              )}
              <span aria-hidden="true">{tab.icon}</span>
              <span className="sr-only">{tab.label}</span>
            </>
          )

          if (tab.href) {
            return (
              <Link
                key={tab.id}
                href={tab.href}
                title={tab.label}
                className={className}
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
              id={`${tab.id}-tab-desktop`}
              title={tab.label}
              className={className}
            >
              {content}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
