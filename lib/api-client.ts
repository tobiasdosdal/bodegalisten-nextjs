import { ApiResponse } from '@/types'

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

export async function apiCall<T>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  url: string,
  data?: any,
  params?: Record<string, string>
): Promise<ApiResponse<T>> {
  const fullUrl = params
    ? `${baseURL}${url}?${new URLSearchParams(params).toString()}`
    : `${baseURL}${url}`

  const res = await fetch(fullUrl, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: data ? JSON.stringify(data) : undefined,
  })

  const responseData = await res.json().catch(() => null)

  if (!res.ok) {
    const errorMessage = responseData?.error || responseData?.message || responseData || 'An error occurred'
    throw new Error(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage))
  }

  return responseData as ApiResponse<T>
}

// Convenience methods
export const apiClient = {
  get: <T = any>(url: string, params?: any) => apiCall<T>('GET', url, undefined, params),
  post: <T = any>(url: string, data?: any) => apiCall<T>('POST', url, data),
  put: <T = any>(url: string, data?: any) => apiCall<T>('PUT', url, data),
  patch: <T = any>(url: string, data?: any) => apiCall<T>('PATCH', url, data),
  delete: <T = any>(url: string) => apiCall<T>('DELETE', url),
}
