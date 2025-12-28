'use client'

import { ReactNode, useState } from 'react'
import { ConvexReactClient } from 'convex/react'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { ClerkProvider, useAuth } from '@clerk/nextjs'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { I18nProvider } from '@/lib/i18n'
import { InstallPrompt, UpdatePrompt, OfflineIndicator, FullscreenToggle } from '@/components/pwa/PWAPrompts'

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <ClerkProvider>
      <QueryClientProvider client={queryClient}>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <I18nProvider>
            <OfflineIndicator />
            {children}
            <InstallPrompt />
            <UpdatePrompt />
            <FullscreenToggle />
          </I18nProvider>
        </ConvexProviderWithClerk>
      </QueryClientProvider>
    </ClerkProvider>
  )
}
