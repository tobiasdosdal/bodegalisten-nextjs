'use client'

import { useState } from 'react'
import { useUser, SignInButton } from '@clerk/nextjs'
import { Plus } from 'lucide-react'
import { SuggestBarModal } from './SuggestBarModal'

export function SuggestBarFAB() {
  const { isSignedIn } = useUser()
  const [isModalOpen, setIsModalOpen] = useState(false)

  if (!isSignedIn) {
    return (
      <SignInButton mode="modal">
        <button
          className="fixed bottom-24 right-4 z-40 flex items-center gap-2 px-4 py-3 bg-bodega-accent text-white rounded-full shadow-lg hover:bg-bodega-accent/90 transition-all hover:scale-105 active:scale-95"
          title="Log ind for at foreslå ny bar"
        >
          <Plus className="w-5 h-5" />
          <span className="text-sm font-medium">Ny bar</span>
        </button>
      </SignInButton>
    )
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-24 right-4 z-40 flex items-center gap-2 px-4 py-3 bg-bodega-accent text-white rounded-full shadow-lg hover:bg-bodega-accent/90 transition-all hover:scale-105 active:scale-95"
        title="Foreslå ny bar"
      >
        <Plus className="w-5 h-5" />
        <span className="text-sm font-medium">Ny bar</span>
      </button>

      <SuggestBarModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
