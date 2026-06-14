'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { signInWithEmail, signInWithGoogle, parseAuthError } from '@/lib/firebase/auth'
import { AuthError } from 'firebase/auth'

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [focusedField, setFocusedField] = useState<string | null>(null)

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      await signInWithEmail(email, password)
      router.replace('/dashboard/world')
    } catch (err) {
      setError(parseAuthError(err as AuthError))
    } finally {
      setIsLoading(false)
    }
  }

  async function handleGoogleSignIn() {
    setError('')
    setIsGoogleLoading(true)
    try {
      await signInWithGoogle()
      router.replace('/dashboard/world')
    } catch (err) {
      setError(parseAuthError(err as AuthError))
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#050d0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 20px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Inter', sans-serif",
    }}>
      {/* Animated background orbs */}
      <div style={{
        position: 'absolute', top: '10%', left: '15%',
        width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(0,255,135,0.12) 0%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none',
        animation: 'float1 8s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', right: '10%',
        width: 350, height: 350,
        background: 'radial-gradient(circle, rgba(0,212,255,0.1) 0%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none',
        animation: 'float2 10s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', top: '50%', right: '20%',
        width: 200, height: 200,
        background: 'radial-gradient(circle, rgba(255,215,0,0.06) 0%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(30px)', pointerEvents: 'none',
      }} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap');
        @keyframes float1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(30px,-20px) scale(1.05)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-20px,30px) scale(1.08)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .input-field { transition: all 0.2s ease; }
        .input-field:focus { outline: none; }
        .btn-hover { transition: all 0.2s ease; cursor: pointer; }
        .btn-hover:hover { transform: translateY(-1px); filter: brightness(1.05); }
        .btn-hover:active { transform: translateY(0) scale(0.98); }
        .google-btn:hover { background: rgba(255,255,255,0.12) !important; }
      `}</style>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 10 }}
      >
        {/* Logo section */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ fontSize: 64, marginBottom: 12, display: 'block', filter: 'drop-shadow(0 0 30px rgba(0,255,135,0.4))' }}
          >
            🌍
          </motion.div>
          <h1 style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: 32, fontWeight: 800,
            background: 'linear-gradient(135deg, #00FF87 0%, #00D4FF 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text', margin: '0 0 6px',
            letterSpacing: '-0.5px',
          }}>CarbonQuest</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, margin: 0 }}>
            Welcome back. Your world awaits. 🌱
          </p>
        </div>

        {/* Glass card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: 28,
          padding: '36px 32px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}>
          {/* Title */}
          <h2 style={{
            fontFamily: "'Outfit', sans-serif",
            color: '#fff', fontSize: 22, fontWeight: 700,
            margin: '0 0 24px', letterSpacing: '-0.3px',
          }}>Sign In</h2>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              style={{
                background: 'rgba(255,71,87,0.1)',
                border: '1px solid rgba(255,71,87,0.3)',
                borderRadius: 14, padding: '12px 16px',
                color: '#FF4757', fontSize: 13,
                marginBottom: 20,
              }}
            >
              ⚠️ {error}
            </motion.div>
          )}

          {/* Google button */}
          <motion.button
            whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.1)' }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isLoading}
            className="google-btn"
            style={{
              width: '100%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 12,
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 16, padding: '14px 20px',
              color: '#fff', fontSize: 14, fontWeight: 600,
              cursor: isGoogleLoading || isLoading ? 'not-allowed' : 'pointer',
              opacity: isGoogleLoading || isLoading ? 0.6 : 1,
              marginBottom: 20, transition: 'all 0.2s ease',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {isGoogleLoading ? (
              <div style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#00FF87', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            ) : (
              /* Google G logo SVG */
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            Continue with Google
          </motion.button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>or continue with email</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleEmailSignIn}>
            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>✉️</span>
                <input
                  id="signin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="you@example.com"
                  required
                  className="input-field"
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: focusedField === 'email' ? 'rgba(0,255,135,0.05)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${focusedField === 'email' ? 'rgba(0,255,135,0.4)' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 14, padding: '14px 16px 14px 44px',
                    color: '#fff', fontSize: 14,
                    fontFamily: "'Inter', sans-serif",
                    boxShadow: focusedField === 'email' ? '0 0 0 4px rgba(0,255,135,0.08)' : 'none',
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Password
                </label>
                <Link href="/auth/forgot-password" style={{ color: '#00FF87', fontSize: 12, textDecoration: 'none', opacity: 0.8 }}>
                  Forgot?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔒</span>
                <input
                  id="signin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••••"
                  required
                  className="input-field"
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: focusedField === 'password' ? 'rgba(0,255,135,0.05)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${focusedField === 'password' ? 'rgba(0,255,135,0.4)' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 14, padding: '14px 48px 14px 44px',
                    color: '#fff', fontSize: 14,
                    fontFamily: "'Inter', sans-serif",
                    boxShadow: focusedField === 'password' ? '0 0 0 4px rgba(0,255,135,0.08)' : 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'rgba(255,255,255,0.3)', padding: 4,
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.02, filter: 'brightness(1.08)' }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={isLoading || isGoogleLoading}
              style={{
                width: '100%', padding: '15px 24px',
                background: isLoading || isGoogleLoading
                  ? 'rgba(0,255,135,0.4)'
                  : 'linear-gradient(135deg, #00FF87 0%, #00D4FF 100%)',
                border: 'none', borderRadius: 16,
                color: '#050d0a', fontSize: 15, fontWeight: 700,
                cursor: isLoading || isGoogleLoading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontFamily: "'Outfit', sans-serif",
                boxShadow: '0 8px 32px rgba(0,255,135,0.3)',
                letterSpacing: '0.02em',
              }}
            >
              {isLoading ? (
                <div style={{ width: 20, height: 20, border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#050d0a', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              ) : (
                <>Sign In →</>
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13, margin: '20px 0 0' }}>
            No account?{' '}
            <Link href="/auth/signup" style={{ color: '#00FF87', textDecoration: 'none', fontWeight: 600 }}>
              Create one
            </Link>
          </p>
        </div>

        {/* Bottom tagline */}
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.15)', fontSize: 11, marginTop: 20 }}>
          🌿 Powered by Gemini AI · Firebase Auth
        </p>
      </motion.div>
    </div>
  )
}
