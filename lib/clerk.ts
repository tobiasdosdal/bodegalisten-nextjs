import { auth, currentUser } from '@clerk/nextjs/server'

export async function getAuth() {
  return auth()
}

export async function getCurrentUser() {
  return currentUser()
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const { userId } = await auth()
  return !!userId
}

/**
 * Get current user ID
 */
export async function getCurrentUserId(): Promise<string | null> {
  const { userId } = await auth()
  return userId || null
}

/**
 * Check if user is admin (you can extend this with Clerk custom attributes)
 */
export async function isAdmin(): Promise<boolean> {
  const user = await currentUser()
  // Check if user has admin metadata set in Clerk
  return user?.publicMetadata?.role === 'admin' || false
}
