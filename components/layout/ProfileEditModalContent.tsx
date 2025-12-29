'use client'

import { useUser } from '@clerk/nextjs'
import { ProfileEditForm } from '@/components/social'
import { BodegaLoading } from '@/components/bodega'
import { usePageModal } from './PageModalProvider'

export function ProfileEditModalContent() {
  const { isLoaded, isSignedIn } = useUser()
  const { openModal } = usePageModal()

  if (!isLoaded) {
    return (
      <div className="flex justify-center py-12">
        <BodegaLoading />
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6">
        <p className="text-stone-400 text-center">
          Log ind for at redigere din profil
        </p>
      </div>
    )
  }

  return (
    <div className="px-5 py-4">
      <p className="text-sm text-stone-500 mb-4">Opdater dine oplysninger</p>
      <ProfileEditForm
        onSuccess={() => openModal('profile')}
        compact
      />
    </div>
  )
}
