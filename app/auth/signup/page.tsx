'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import { signUpWithEmail, signInWithGoogle, parseAuthError } from '@/lib/firebase/auth'
import { AuthError } from 'firebase/auth'

const PASSWORD_RULES = [
  { label: 'At least 6 characters', test: (p: string) => p.length >= 6 },
  { label: 'Contains a number', test: (p: string) => /\d/.test(p) },
  { label: 'Contains a letter', test: (p: string) => /[a-zA-Z]/.test(p) },
]

export default function SignUpPage() {
  const router = useRouter()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const passedRules = PASSWORD_RULES.filter((r) => r.test(password)).length
  const strengthColor = passedRules === 3 ? '#00FF87' : passedRules === 2 ? '#FFD700' : '#FF4757'

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      await signUpWithEmail(email, password, displayName)
      router.replace('/onboarding/quiz')
    } catch (err) {
      setError(parseAuthError(err as AuthError))
    } finally {
      setIsLoading(false)
    }
  }

  async function handleGoogleSignUp() {
    setError('')
    setIsGoogleLoading(true)
    try {
      await signInWithGoogle()
      router.replace('/onboarding/quiz')
    } catch (err) {
      setError(parseAuthError(err as AuthError))
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const inputStyle = (field: string) => ({
    width: '100%', boxSizing: 'border-box' as const,
    background: focusedField === field ? 'rgba(0,255,135,0.05)' : 'rgba(255,255,255,0.05)',
    border: `1px solid ${focusedField === field ? 'rgba(0,255,135,0.4)' : 'rgba(255,255,255,0.1)'}`,
    borderRadius: 14, padding: '14px 16px 14px 44px',
    color: '#fff', fontSize: 14,
    fontFamily: "'Inter', sans-serif",
    boxShadow: focusedField === field ? '0 0 0 4px rgba(0,255,135,0.08)' : 'none',
    outline: 'none', transition: 'all 0.2s ease',
  })

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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap');
        @keyframes float1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-25px,20px)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(20px,-25px)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        input::placeholder { color: rgba(255,255,255,0.2); }
        input { transition: all 0.2s ease; outline: none !important; }
      `}</style>

      {/* Orbs */}
      <div style={{ position: 'absolute', top: '5%', right: '10%', width: 380, height: 380, background: 'radial-gradient(circle, rgba(0,255,135,0.1) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(50px)', pointerEvents: 'none', animation: 'float1 9s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', bottom: '5%', left: '5%', width: 320, height: 320, background: 'radial-gradient(circle, rgba(0,212,255,0.09) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none', animation: 'float2 11s ease-in-out infinite' }} />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 10 }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ fontSize: 60, marginBottom: 12, display: 'block', filter: 'drop-shadow(0 0 25px rgba(0,255,135,0.5))' }}
          >
            🌱
          </motion.div>
          <h1 style={{
            fontFamily: "'Outfit', sans-serif", fontSize: 30, fontWeight: 800,
            background: 'linear-gradient(135deg, #00FF87 0%, #00D4FF 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text', margin: '0 0 6px', letterSpacing: '-0.5px',
          }}>CarbonQuest</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, margin: 0 }}>
            Start your journey to a greener world.
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 28, padding: '34px 30px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", color: '#fff', fontSize: 22, fontWeight: 700, margin: '0 0 22px', letterSpacing: '-0.3px' }}>
            Create Account
          </h2>

          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              style={{ background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.3)', borderRadius: 14, padding: '12px 16px', color: '#FF4757', fontSize: 13, marginBottom: 18 }}>
              ⚠️ {error}
            </motion.div>
          )}

          {/* Google */}
          <motion.button
            whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.1)' }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogleSignUp}
            disabled={isGoogleLoading || isLoading}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 16, padding: '14px 20px', color: '#fff', fontSize: 14, fontWeight: 600,
              cursor: isGoogleLoading || isLoading ? 'not-allowed' : 'pointer',
              opacity: isGoogleLoading || isLoading ? 0.6 : 1, marginBottom: 18,
              transition: 'all 0.2s ease', fontFamily: "'Inter', sans-serif",
            }}
          >
            {isGoogleLoading
              ? <div style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#00FF87', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              : <svg width="20" height="20" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
            }
            Continue with Google
          </motion.button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>or with email</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
          </div>

          <form onSubmit={handleSignUp}>
            {/* Name */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Name</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>👤</span>
                <input id="signup-name" type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                  onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)}
                  placeholder="Your name" required style={inputStyle('name')} />
              </div>
            </div>

            {/* Email */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Email</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>✉️</span>
                <input id="signup-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
                  placeholder="you@example.com" required style={inputStyle('email')} />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 22 }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔒</span>
                <input id="signup-password" type={showPassword ? 'text' : 'password'} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)}
                  placeholder="Min. 6 characters" required style={{ ...inputStyle('password'), paddingRight: 48 }} />
                <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 4, display: 'flex', alignItems: 'center' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Strength meter */}
              {password.length > 0 && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ marginTop: 12 }}>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                    {[0, 1, 2].map((i) => (
                      <div key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: i < passedRules ? strengthColor : 'rgba(255,255,255,0.08)', transition: 'background 0.3s ease' }} />
                    ))}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {PASSWORD_RULES.map((rule) => (
                      <div key={rule.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 16, height: 16, borderRadius: '50%', background: rule.test(password) ? '#00FF87' : 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', flexShrink: 0 }}>
                          {rule.test(password) && <span style={{ fontSize: 10, color: '#050d0a', fontWeight: 700 }}>✓</span>}
                        </div>
                        <span style={{ fontSize: 12, color: rule.test(password) ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)', transition: 'color 0.2s' }}>{rule.label}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.02, filter: 'brightness(1.08)' }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={isLoading || isGoogleLoading || passedRules < 2}
              style={{
                width: '100%', padding: '15px 24px',
                background: isLoading || isGoogleLoading || passedRules < 2
                  ? 'rgba(0,255,135,0.3)'
                  : 'linear-gradient(135deg, #00FF87 0%, #00D4FF 100%)',
                border: 'none', borderRadius: 16,
                color: '#050d0a', fontSize: 15, fontWeight: 700,
                cursor: isLoading || isGoogleLoading || passedRules < 2 ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontFamily: "'Outfit', sans-serif",
                boxShadow: passedRules >= 2 ? '0 8px 32px rgba(0,255,135,0.3)' : 'none',
                letterSpacing: '0.02em',
              }}
            >
              {isLoading
                ? <div style={{ width: 20, height: 20, border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#050d0a', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                : 'Create Account & Start Quest →'}
            </motion.button>
          </form>

          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13, margin: '18px 0 0' }}>
            Already have an account?{' '}
            <Link href="/auth/signin" style={{ color: '#00FF87', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.15)', fontSize: 11, marginTop: 20 }}>
          🌿 Powered by Gemini AI · Firebase Auth
        </p>
      </motion.div>
    </div>
  )
}
