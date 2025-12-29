'use client'

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'

type ModalType = 'activity' | 'notifications' | 'list' | 'profile' | 'friends' | 'profileEdit' | null

interface PageModalContextType {
  openModal: (type: ModalType) => void
  closeModal: () => void
  activeModal: ModalType
  isDesktop: boolean
}

const PageModalContext = createContext<PageModalContextType | null>(null)

export function usePageModal() {
  const context = useContext(PageModalContext)
  if (!context) {
    throw new Error('usePageModal must be used within PageModalProvider')
  }
  return context
}

interface PageModalProviderProps {
  children: ReactNode
  activityContent?: ReactNode
  notificationsContent?: ReactNode
  listContent?: ReactNode
  profileContent?: ReactNode
  friendsContent?: ReactNode
  profileEditContent?: ReactNode
}

export function PageModalProvider({
  children,
  activityContent,
  notificationsContent,
  listContent,
  profileContent,
  friendsContent,
  profileEditContent,
}: PageModalProviderProps) {
  const [activeModal, setActiveModal] = useState<ModalType>(null)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024)
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeModal) {
        setActiveModal(null)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [activeModal])

  const openModal = useCallback((type: ModalType) => {
    setActiveModal(type)
  }, [])

  const closeModal = useCallback(() => {
    setActiveModal(null)
  }, [])

  const getModalContent = () => {
    switch (activeModal) {
      case 'activity':
        return activityContent
      case 'notifications':
        return notificationsContent
      case 'list':
        return listContent
      case 'profile':
        return profileContent
      case 'friends':
        return friendsContent
      case 'profileEdit':
        return profileEditContent
      default:
        return null
    }
  }

  const getModalTitle = () => {
    switch (activeModal) {
      case 'activity':
        return 'Aktivitet'
      case 'notifications':
        return 'Notifikationer'
      case 'list':
        return 'Barer'
      case 'profile':
        return 'Profil'
      case 'friends':
        return 'Venner'
      case 'profileEdit':
        return 'Rediger profil'
      default:
        return ''
    }
  }

  return (
    <PageModalContext.Provider value={{ openModal, closeModal, activeModal, isDesktop }}>
      {children}
      
      {isDesktop && activeModal && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
            aria-hidden="true"
          />
          
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="page-modal-title"
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg max-h-[85vh] bg-bodega-surface rounded-2xl border border-white/[0.08] shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <h2 id="page-modal-title" className="text-lg font-semibold text-white">
                {getModalTitle()}
              </h2>
              <button
                onClick={closeModal}
                aria-label="Luk"
                className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.1] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-bodega-accent"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {getModalContent()}
            </div>
          </div>
        </>
      )}
    </PageModalContext.Provider>
  )
}
