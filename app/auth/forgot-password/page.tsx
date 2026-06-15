'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react'
import { resetPassword, parseAuthError } from '@/lib/firebase/auth'
import { AuthError } from 'firebase/auth'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      await resetPassword(email)
      setSent(true)
    } catch (err) {
      setError(parseAuthError(err as AuthError))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#050d0a] px-4 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-[#00FF87]/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Link
          href="/auth/signin"
          className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sign In
        </Link>

        <div className="glass p-8 space-y-6">
          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4 py-4"
            >
              <div className="w-16 h-16 rounded-full bg-[#00FF87]/10 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-[#00FF87]" />
              </div>
              <h2 className="text-xl font-outfit font-semibold text-white">Check Your Email</h2>
              <p className="text-white/50 text-sm">
                We sent a password reset link to{' '}
                <span className="text-white/80 font-medium">{email}</span>
              </p>
              <Link
                href="/auth/signin"
                className="block w-full gradient-eco text-black font-semibold py-3 rounded-xl text-center mt-4"
              >
                Back to Sign In
              </Link>
            </motion.div>
          ) : (
            <>
              <div>
                <h2 className="text-xl font-outfit font-semibold text-white">Forgot Password?</h2>
                <p className="text-white/40 text-sm mt-1">
                  Enter your email and we&apos;ll send you a reset link.
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#FF4757]/10 border border-[#FF4757]/30 rounded-xl px-4 py-3 text-[#FF4757] text-sm"
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label className="block text-white/60 text-sm mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      id="forgot-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#00FF87]/50 transition-all"
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full gradient-eco text-black font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Send Reset Link
                </motion.button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </main>
  )
}
