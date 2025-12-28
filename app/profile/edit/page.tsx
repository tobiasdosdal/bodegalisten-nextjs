'use client'

import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { ProfileEditForm } from '@/components/social'
import { ArrowLeft, Loader2 } from 'lucide-react'

export default function ProfileEditPage() {
  const router = useRouter()
  const { isSignedIn, isLoaded } = useUser()

  // Show loading while checking auth
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="w-8 h-8 text-bodega-accent animate-spin" />
      </div>
    )
  }

  // Redirect if not signed in
  if (!isSignedIn) {
    router.push('/profile')
    return null
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.1] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-lg font-semibold text-white">Rediger profil</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Form */}
      <div className="px-4 py-6">
        <ProfileEditForm onSuccess={() => router.push('/profile')} />
      </div>
    </div>
  )
}
