'use client'

import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'

/**
 * Sets/clears the `cq_authed` cookie that middleware uses for
 * server-side route protection. Must be rendered inside AuthProvider.
 */
export function AuthCookieSync() {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Secure, SameSite cookie — no sensitive data, just a presence flag
        document.cookie = 'cq_authed=1; path=/; SameSite=Strict; max-age=2592000'
      } else {
        document.cookie = 'cq_authed=; path=/; SameSite=Strict; max-age=0'
      }
    })
    return unsubscribe
  }, [])

  return null
}
