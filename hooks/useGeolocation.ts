'use client'

import { useState, useEffect, useCallback } from 'react'

interface GeolocationState {
  latitude: number | null
  longitude: number | null
  error: string | null
  loading: boolean
}

const DEFAULT_COPENHAGEN: [number, number] = [55.6761, 12.5683]

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: DEFAULT_COPENHAGEN[0],
    longitude: DEFAULT_COPENHAGEN[1],
    error: null,
    loading: true,
  })

  const updatePosition = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation not supported',
        loading: false,
      }))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
          loading: false,
        })
      },
      (error) => {
        setState(prev => ({
          ...prev,
          error: error.message,
          loading: false,
        }))
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    )
  }, [])

  useEffect(() => {
    updatePosition()
  }, [updatePosition])

  return {
    ...state,
    refresh: updatePosition,
    coordinates: state.latitude && state.longitude 
      ? [state.latitude, state.longitude] as [number, number]
      : DEFAULT_COPENHAGEN,
  }
}
