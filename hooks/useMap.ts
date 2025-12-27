import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { Map, Marker } from '@/types'

export function useMap(code: string) {
  return useQuery({
    queryKey: ['map', code],
    queryFn: async () => {
      const response = await apiClient.get<Map>(`/maps/${code}`)
      return response.data
    },
    enabled: !!code,
  })
}

export function useMaps() {
  return useQuery({
    queryKey: ['maps'],
    queryFn: async () => {
      const response = await apiClient.get<Map[]>('/maps')
      return response.data
    },
  })
}

export function useMapMarkers(code: string) {
  return useQuery({
    queryKey: ['markers', code],
    queryFn: async () => {
      const response = await apiClient.get<Marker[]>(`/maps/${code}/markers`)
      return response.data
    },
    enabled: !!code,
  })
}

export function useCreateMap() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<Map>) => {
      const response = await apiClient.post<Map>('/maps', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maps'] })
    },
  })
}

export function useUpdateMap(code: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<Map>) => {
      const response = await apiClient.put<Map>(`/maps/${code}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maps'] })
      queryClient.invalidateQueries({ queryKey: ['map', code] })
    },
  })
}

export function useDeleteMap(code: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      await apiClient.delete(`/maps/${code}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maps'] })
    },
  })
}

export function useCreateMarker(code: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<Marker>) => {
      const response = await apiClient.post<Marker>(`/maps/${code}/markers`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['markers', code] })
    },
  })
}

export function useUpdateMarker(code: string, markerId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<Marker>) => {
      const response = await apiClient.put<Marker>(
        `/maps/${code}/markers/${markerId}`,
        data
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['markers', code] })
    },
  })
}

export function useDeleteMarker(code: string, markerId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      await apiClient.delete(`/maps/${code}/markers/${markerId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['markers', code] })
    },
  })
}
