'use client'

import { TabBar } from './TabBar'
import { DesktopSidebar } from './DesktopSidebar'

interface ResponsiveNavigationProps {
  activeTab: string
  onTabChange: (tabId: string) => void
}

export function ResponsiveNavigation({ activeTab, onTabChange }: ResponsiveNavigationProps) {
  return (
    <>
      {/* Mobile: Bottom tab bar */}
      <div className="lg:hidden">
        <TabBar activeTab={activeTab} onTabChange={onTabChange} />
      </div>

      {/* Desktop: Left sidebar */}
      <DesktopSidebar activeTab={activeTab} onTabChange={onTabChange} />
    </>
  )
}
