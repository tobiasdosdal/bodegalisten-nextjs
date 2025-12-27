import { SignIn } from '@clerk/nextjs'
import { Suspense } from 'react'

export const metadata = {
  title: 'Sign In - Bodegalisten',
  description: 'Sign in to Bodegalisten admin',
}

function SignInLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <p>Loading...</p>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={<SignInLoading />}>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <SignIn signUpUrl="/sign-up" afterSignInUrl="/admin" />
      </div>
    </Suspense>
  )
}
