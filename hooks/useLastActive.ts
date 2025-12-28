'use client'

import { useEffect, useRef } from 'react'
import { useUser } from '@clerk/nextjs'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'

// Update last active every 2 minutes while user is interacting
const UPDATE_INTERVAL = 2 * 60 * 1000
// Update location every 5 minutes
const LOCATION_UPDATE_INTERVAL = 5 * 60 * 1000

export function useLastActive() {
  const { user } = useUser()
  const updateLastActive = useMutation(api.profiles.updateLastActive)
  const updateLocation = useMutation(api.notifications.updateLocation)
  const lastUpdateRef = useRef<number>(0)
  const lastLocationUpdateRef = useRef<number>(0)

  useEffect(() => {
    if (!user?.id) return

    const updateActivity = () => {
      const now = Date.now()
      // Only update if more than UPDATE_INTERVAL has passed
      if (now - lastUpdateRef.current > UPDATE_INTERVAL) {
        lastUpdateRef.current = now
        updateLastActive({ clerkId: user.id })
      }
    }

    const updateUserLocation = () => {
      const now = Date.now()
      if (now - lastLocationUpdateRef.current < LOCATION_UPDATE_INTERVAL) return

      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            lastLocationUpdateRef.current = Date.now()
            updateLocation({
              userId: user.id,
              lat: position.coords.latitude,
              lon: position.coords.longitude,
            })
          },
          () => {
            // Silently ignore location errors
          },
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
        )
      }
    }

    // Update immediately on mount
    updateActivity()
    updateUserLocation()

    // Update on user interaction
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll']
    events.forEach((event) => {
      window.addEventListener(event, updateActivity, { passive: true })
    })

    // Also update periodically while tab is visible
    const interval = setInterval(() => {
      if (!document.hidden) {
        updateActivity()
        updateUserLocation()
      }
    }, UPDATE_INTERVAL)

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, updateActivity)
      })
      clearInterval(interval)
    }
  }, [user?.id, updateLastActive, updateLocation])
}
