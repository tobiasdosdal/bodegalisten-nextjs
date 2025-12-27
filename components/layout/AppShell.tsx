'use client'

import { useState, ReactNode } from 'react'
import { TabBar } from './TabBar'

interface AppShellProps {
  mapView: ReactNode
  listView: ReactNode
  discoverView: ReactNode
  settingsView: ReactNode
}

export function AppShell({ mapView, listView, discoverView, settingsView }: AppShellProps) {
  const [activeTab, setActiveTab] = useState('map')

  const renderContent = () => {
    switch (activeTab) {
      case 'map':
        return mapView
      case 'list':
        return listView
      case 'discover':
        return discoverView
      case 'settings':
        return settingsView
      default:
        return mapView
    }
  }

  return (
    <div className="flex flex-col h-screen bg-black">
      <main className="flex-1 overflow-hidden pb-[52px]">
        {renderContent()}
      </main>
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
