'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/firebase/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  /** Where to redirect unauthenticated users (default: /auth/signin) */
  redirectTo?: string
}

/**
 * Wraps a page — redirects to sign-in if user is not authenticated.
 * Shows a full-screen loader while Firebase resolves the auth state.
 */
export function ProtectedRoute({ children, redirectTo = '/auth/signin' }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(redirectTo)
    }
  }, [user, isLoading, router, redirectTo])

  if (isLoading) {
    return <AuthLoadingScreen />
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}

function AuthLoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#050d0a]">
      {/* Animated eco-green ring */}
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute inset-0 rounded-full border-2 border-white/10" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#00FF87] animate-spin" />
        <div className="absolute inset-2 rounded-full bg-[#00FF87]/10 flex items-center justify-center">
          <span className="text-xl">🌱</span>
        </div>
      </div>
      <p className="text-white/50 text-sm font-inter">Loading CarbonQuest…</p>
    </div>
  )
}
