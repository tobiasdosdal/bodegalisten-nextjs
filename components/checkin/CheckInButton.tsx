'use client'

import { useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { useUser, SignInButton } from '@clerk/nextjs'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { MapPin, Loader2, X, Check } from 'lucide-react'

interface CheckInButtonProps {
  barId: Id<'bars'>
  barName: string
}

export function CheckInButton({ barId, barName }: CheckInButtonProps) {
  const { isSignedIn, user } = useUser()
  const [showModal, setShowModal] = useState(false)
  const [message, setMessage] = useState('')
  const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>('public')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const activeCheckIn = useQuery(
    api.checkIns.getActiveByUser,
    user?.id ? { userId: user.id } : 'skip'
  )

  const createCheckIn = useMutation(api.checkIns.create)
  const removeCheckIn = useMutation(api.checkIns.remove)

  // Check if already checked in at this bar
  const isCheckedInHere = activeCheckIn?.barId === barId

  const handleCheckIn = async () => {
    if (!user?.id) return

    setIsSubmitting(true)
    try {
      await createCheckIn({
        userId: user.id,
        barId,
        message: message.trim() || undefined,
        visibility,
      })
      setSuccess(true)
      setTimeout(() => {
        setShowModal(false)
        setSuccess(false)
        setMessage('')
      }, 1500)
    } catch (err) {
      console.error('Failed to check in:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCheckOut = async () => {
    if (!activeCheckIn?._id) return

    setIsSubmitting(true)
    try {
      await removeCheckIn({ checkInId: activeCheckIn._id })
    } catch (err) {
      console.error('Failed to check out:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Not signed in
  if (!isSignedIn) {
    return (
      <SignInButton mode="modal">
        <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors">
          <MapPin className="w-4 h-4" />
          Tjek ind
        </button>
      </SignInButton>
    )
  }

  // Already checked in here
  if (isCheckedInHere) {
    return (
      <button
        onClick={handleCheckOut}
        disabled={isSubmitting}
        className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-green-400 border border-green-400/30 rounded-xl hover:bg-green-400/10 transition-colors disabled:opacity-50"
      >
        {isSubmitting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Check className="w-4 h-4" />
        )}
        Du er her
      </button>
    )
  }

  // Checked in elsewhere
  if (activeCheckIn) {
    return (
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors"
      >
        <MapPin className="w-4 h-4" />
        Skift hertil
      </button>
    )
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors"
      >
        <MapPin className="w-4 h-4" />
        Tjek ind
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-bodega-surface rounded-2xl shadow-xl animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
              <h3 className="text-lg font-semibold text-white">Tjek ind</h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.1] transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {success ? (
                <div className="flex flex-col items-center py-8">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                    <Check className="w-8 h-8 text-green-500" />
                  </div>
                  <p className="text-lg font-medium text-white">Du er tjekket ind!</p>
                  <p className="text-sm text-gray-400">{barName}</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 p-3 bg-white/[0.04] rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{barName}</p>
                      <p className="text-xs text-gray-400">Du tjekker ind her</p>
                    </div>
                  </div>

                  {/* Optional message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Status (valgfri)
                    </label>
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Hvad laver du?"
                      maxLength={100}
                      className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                    />
                  </div>

                  {/* Visibility */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Hvem kan se det?
                    </label>
                    <div className="flex gap-2">
                      {[
                        { value: 'public', label: 'Alle' },
                        { value: 'friends', label: 'Følgere' },
                        { value: 'private', label: 'Kun mig' },
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setVisibility(option.value as typeof visibility)}
                          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                            visibility === option.value
                              ? 'bg-green-600 text-white'
                              : 'bg-white/[0.04] text-gray-400 hover:text-white'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    onClick={handleCheckIn}
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 py-3 text-lg font-medium text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Tjekker ind...
                      </>
                    ) : (
                      <>
                        <MapPin className="w-5 h-5" />
                        Tjek ind
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
