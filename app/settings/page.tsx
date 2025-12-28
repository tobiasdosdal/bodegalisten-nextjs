'use client'

import { useRouter } from 'next/navigation'
import { useSettings } from '@/hooks/useSettings'
import { SettingsView } from '@/components/views'
import { ArrowLeft } from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()
  const { maxDistance, transportType, setMaxDistance, setTransportType } = useSettings()

  return (
    <div className="min-h-screen bg-black relative">
      {/* Back button - floating */}
      <button
        onClick={() => router.back()}
        className="fixed top-4 left-4 z-20 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center hover:bg-black/80 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 text-white" />
      </button>

      {/* Settings content */}
      <SettingsView
        maxDistance={maxDistance}
        transportType={transportType}
        onMaxDistanceChange={setMaxDistance}
        onTransportTypeChange={setTransportType}
      />
    </div>
  )
}
