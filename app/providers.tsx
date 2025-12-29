'use client'

import { ReactNode, useState } from 'react'
import { ConvexReactClient } from 'convex/react'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { ClerkProvider, useAuth } from '@clerk/nextjs'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { I18nProvider } from '@/lib/i18n'
import { InstallPrompt, UpdatePrompt, OfflineIndicator, FullscreenToggle, IOSInstallPrompt } from '@/components/pwa/PWAPrompts'
import { ActivityTracker } from '@/components/ActivityTracker'
import { BarModalProvider } from '@/components/views/BarModalProvider'
import { PageModalProvider } from '@/components/layout/PageModalProvider'
import { ActivityModalContent } from '@/components/layout/ActivityModalContent'
import { NotificationsModalContent } from '@/components/layout/NotificationsModalContent'
import { ListModalContent } from '@/components/layout/ListModalContent'
import { ProfileModalContent } from '@/components/layout/ProfileModalContent'
import { FriendsModalContent } from '@/components/layout/FriendsModalContent'

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <ClerkProvider>
      <QueryClientProvider client={queryClient}>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <I18nProvider>
            <BarModalProvider>
              <PageModalProvider
                activityContent={<ActivityModalContent />}
                notificationsContent={<NotificationsModalContent />}
                listContent={<ListModalContent />}
                profileContent={<ProfileModalContent />}
                friendsContent={<FriendsModalContent />}
              >
                <ActivityTracker />
                <OfflineIndicator />
                {children}
                <InstallPrompt />
                <IOSInstallPrompt />
                <UpdatePrompt />
                <FullscreenToggle />
              </PageModalProvider>
            </BarModalProvider>
          </I18nProvider>
        </ConvexProviderWithClerk>
      </QueryClientProvider>
    </ClerkProvider>
  )
}
