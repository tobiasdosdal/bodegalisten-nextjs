'use client'

import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useUser } from '@clerk/nextjs'
import { Id } from '@/convex/_generated/dataModel'
import { X, Ban, Loader2 } from 'lucide-react'

interface ReportClosedModalProps {
  isOpen: boolean
  onClose: () => void
  barId: Id<'bars'>
  barName: string
}

export function ReportClosedModal({ isOpen, onClose, barId, barName }: ReportClosedModalProps) {
  const { user } = useUser()
  const submit = useMutation(api.barReports.submit)

  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSubmitting(true)
    setError('')

    try {
      await submit({
        reportType: 'closed',
        barId,
        userId: user.id,
        userName: user.firstName || user.username || undefined,
        description: description.trim() || undefined,
      })
      setSuccess(true)
      setTimeout(() => {
        onClose()
        setSuccess(false)
        setDescription('')
      }, 2000)
    } catch {
      setError('Kunne ikke sende rapport. Prøv igen.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
      setDescription('')
      setError('')
      setSuccess(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative w-full max-w-md bg-bodega-surface rounded-2xl shadow-xl border border-white/[0.06]">
        <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
          <h2 className="text-lg font-semibold text-white">Rapporter lukket bar</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 rounded-lg hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {success ? (
          <div className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
              <Ban className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Tak for din rapport!</h3>
            <p className="text-gray-400">Vi kigger på det hurtigst muligt.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="text-white">
                Du rapporterer at <span className="font-medium">&quot;{barName}&quot;</span> er lukket.
              </p>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1.5">
                Beskrivelse (valgfrit)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="F.eks. 'Der er nu en frisør i stedet' eller 'Var forbi i går og der var lukket'"
                rows={3}
                className="w-full px-4 py-2.5 bg-white/[0.06] border border-white/[0.1] rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-bodega-accent focus:border-transparent resize-none"
              />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 bg-white/[0.06] text-white rounded-xl hover:bg-white/[0.1] transition-colors disabled:opacity-50"
              >
                Annuller
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sender...
                  </>
                ) : (
                  'Send rapport'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
