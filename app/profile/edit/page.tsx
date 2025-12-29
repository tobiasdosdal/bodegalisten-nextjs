'use client'

import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { ProfileEditForm } from '@/components/social'
import { BodegaLoading } from '@/components/bodega'
import { ArrowLeft } from 'lucide-react'

export default function ProfileEditPage() {
  const router = useRouter()
  const { isSignedIn, isLoaded } = useUser()

  // Show loading while checking auth
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <BodegaLoading />
      </div>
    )
  }

  // Redirect if not signed in
  if (!isSignedIn) {
    router.push('/profile')
    return null
  }

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
          <div>
            <h1 className="text-3xl lg:text-4xl font-display font-semibold text-bodega-cream tracking-tight">
              Rediger profil
            </h1>
            <p className="text-sm text-stone-500 mt-0.5">
              Opdater dine oplysninger
            </p>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="px-4 lg:px-8 pb-8 lg:max-w-2xl lg:mx-auto lg:w-full">
        <ProfileEditForm onSuccess={() => router.push('/profile')} />
      </main>
    </div>
  )
}
