import { SignUp } from '@clerk/nextjs'
import { Suspense } from 'react'

export const metadata = {
  title: 'Sign Up - Bodegalisten',
  description: 'Create a Bodegalisten account',
}

function SignUpLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <p>Loading...</p>
      </div>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<SignUpLoading />}>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <SignUp signInUrl="/sign-in" afterSignUpUrl="/admin" />
      </div>
    </Suspense>
  )
}
