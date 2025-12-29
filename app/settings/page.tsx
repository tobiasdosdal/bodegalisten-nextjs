'use client'

import { useRouter } from 'next/navigation'
import { useSettings } from '@/hooks/useSettings'
import { SettingsView } from '@/components/views'
import { ArrowLeft } from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()
  const { maxDistance, transportType, setMaxDistance, setTransportType } = useSettings()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex-shrink-0 px-4 lg:px-8 pt-14 lg:pt-8 pb-4 lg:pb-6 lg:max-w-2xl lg:mx-auto lg:w-full">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-stone-800/50 flex items-center justify-center hover:bg-stone-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-stone-400" />
          </button>
          <h1 className="text-3xl lg:text-4xl font-display font-semibold text-bodega-cream tracking-tight">
            Indstillinger
          </h1>
        </div>
        <p className="text-sm text-stone-500 ml-[52px]">
          Tilpas din oplevelse
        </p>
      </header>

      {/* Settings content */}
      <SettingsView
        maxDistance={maxDistance}
        transportType={transportType}
        onMaxDistanceChange={setMaxDistance}
        onTransportTypeChange={setTransportType}
        showHeader={false}
      />
    </div>
  )
}
