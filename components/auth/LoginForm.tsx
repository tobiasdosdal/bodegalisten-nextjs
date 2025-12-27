'use client'

import { SignIn } from '@clerk/nextjs'

export function LoginForm() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <SignIn signUpUrl="/sign-up" afterSignInUrl="/admin" />
    </div>
  )
}
