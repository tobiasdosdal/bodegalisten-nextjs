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
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setSettings(JSON.parse(stored))
      } catch (e) {
        console.warn('Failed to parse settings:', e)
        localStorage.removeItem(STORAGE_KEY)
      }
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
