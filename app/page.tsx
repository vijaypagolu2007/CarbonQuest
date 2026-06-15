'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Zap, Globe2, Users } from 'lucide-react'
import { useAuth } from '@/lib/firebase/AuthContext'

const STATS = [
  { icon: '🌍', value: '13', label: 'Features' },
  { icon: '⚡', value: '10s', label: 'Quick start' },
  { icon: '🤖', value: 'AI', label: 'Powered coach' },
]

const FEATURE_PILLS = [
  { icon: '🌱', text: 'Living World' },
  { icon: '🤖', text: 'AI Coach' },
  { icon: '🏆', text: 'Team Battles' },
  { icon: '💡', text: 'Smart Nudges' },
  { icon: '📊', text: 'Insights' },
  { icon: '🔥', text: 'Streak Rewards' },
]

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  // Redirect authenticated users who have completed onboarding
  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/dashboard/world')
    }
  }, [user, isLoading, router])

  // Show nothing while checking auth
  if (isLoading) return null

  return (
    <main className="min-h-screen bg-[#050d0a] flex flex-col relative overflow-hidden" role="main">
      {/* Ambient background orbs - decorative only */}
      <div aria-hidden="true" className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#00FF87]/6 rounded-full blur-[120px] pointer-events-none" />
      <div aria-hidden="true" className="absolute bottom-1/3 left-0 w-80 h-80 bg-[#00D4FF]/5 rounded-full blur-3xl pointer-events-none" />
      <div aria-hidden="true" className="absolute bottom-0 right-0 w-96 h-96 bg-[#00FF87]/4 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col min-h-screen px-5 max-w-lg mx-auto w-full safe-top safe-bottom">

        {/* Top nav */}
        <nav className="flex items-center justify-between pt-6 pb-2" aria-label="Main navigation">
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden="true">🌍</span>
            <span className="font-outfit font-bold text-white">CarbonQuest</span>
          </div>
          <Link
            href="/auth/signin"
            className="text-white/50 text-sm hover:text-white transition-colors"
            aria-label="Sign in to your account"
          >
            Sign in
          </Link>
        </nav>

        {/* Hero */}
        <div className="flex-1 flex flex-col justify-center py-12">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-8"
          >
            <div className="glass-card px-4 py-2 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#00FF87] animate-pulse" />
              <span className="text-white/60 text-xs">Carbon Awareness Platform</span>
            </div>
          </motion.div>

          {/* Floating world emoji */}
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="text-center mb-6"
          >
            <span className="text-8xl drop-shadow-2xl">🌍</span>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center mb-4"
          >
            <h1 className="text-4xl font-outfit font-extrabold text-white leading-tight mb-3">
              Make Carbon{' '}
              <span className="text-gradient-eco">Visible.</span>
              <br />
              Make Change{' '}
              <span className="text-gradient-eco">Real.</span>
            </h1>
            <p className="text-white/50 text-base leading-relaxed max-w-sm mx-auto">
              Track your footprint, grow a living virtual world, and compete with friends to save the planet.
            </p>
          </motion.div>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap gap-2 justify-center mb-10"
          >
            {FEATURE_PILLS.map((pill, i) => (
              <motion.div
                key={pill.text}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.06 }}
                className="glass-card px-3 py-1.5 flex items-center gap-1.5 text-xs text-white/60"
              >
                <span>{pill.icon}</span>
                <span>{pill.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass p-4 mb-6 flex justify-around"
          >
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-xl mb-0.5">{stat.icon}</div>
                <div className="text-lg font-outfit font-bold text-gradient-eco">{stat.value}</div>
                <div className="text-white/30 text-xs">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-3"
          >
            {/* Primary CTA */}
            <Link href="/auth/signup" aria-label="Create a free account and start your carbon quest">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full gradient-eco text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 text-base"
              >
                Start My Quest
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </motion.div>
            </Link>

            {/* Quick Start */}
            <Link href="/onboarding/quickstart" aria-label="Quick start - begin tracking in 10 seconds without creating an account">
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full glass py-3.5 rounded-2xl flex items-center justify-center gap-2 text-white/70 text-sm hover:text-white transition-colors"
              >
                <Zap className="w-4 h-4 text-[#FFD700]" aria-hidden="true" />
                Quick Start — 10 seconds
              </motion.div>
            </Link>
          </motion.div>

          {/* Sign in link */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center text-white/30 text-xs mt-6"
          >
            Already have an account?{' '}
            <Link href="/auth/signin" className="text-[#00FF87] hover:underline">
              Sign in
            </Link>
          </motion.p>
        </div>

        {/* Bottom brand strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="pb-6 flex items-center justify-center gap-4 text-white/15 text-xs"
        >
          <span className="flex items-center gap-1">
            <Globe2 className="w-3 h-3" /> Powered by Gemini AI
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" /> Firebase Realtime
          </span>
        </motion.div>
      </div>
    </main>
  )
}
