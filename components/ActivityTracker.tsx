'use client'

import { useLastActive } from '@/hooks/useLastActive'

// This component tracks user activity and updates lastActiveAt
// It should be placed inside the providers tree
export function ActivityTracker() {
  useLastActive()
  return null
}
