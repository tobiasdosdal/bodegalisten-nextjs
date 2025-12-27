'use client'

import { useState, useEffect, useCallback } from 'react'

interface Settings {
  maxDistance: number
  transportType: 'car' | 'walk' | 'bike'
}

const DEFAULT_SETTINGS: Settings = {
  maxDistance: 5,
  transportType: 'walk',
}

const STORAGE_KEY = 'bodegalisten-settings'

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setSettings(JSON.parse(stored))
      }
    } catch {
      // Ignore errors
    }
    setLoaded(true)
  }, [])

  const updateSettings = useCallback((updates: Partial<Settings>) => {
    setSettings(prev => {
      const next = { ...prev, ...updates }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        // Ignore errors
      }
      return next
    })
  }, [])

  return {
    ...settings,
    loaded,
    updateSettings,
    setMaxDistance: (value: number) => updateSettings({ maxDistance: value }),
    setTransportType: (value: 'car' | 'walk' | 'bike') => updateSettings({ transportType: value }),
  }
}
