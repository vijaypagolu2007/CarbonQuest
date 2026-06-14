'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'

const CATEGORIES = [
  { icon: '🍽️', label: 'Food', description: 'Track meals & diet choices', color: '#00FF87' },
  { icon: '🚌', label: 'Transport', description: 'Log your commute & travel', color: '#00D4FF' },
  { icon: '⚡', label: 'Energy', description: 'Monitor home energy use', color: '#FFD700' },
]

export default function QuickStartPage() {
  const router = useRouter()

  function handleSelect(category: string) {
    sessionStorage.setItem('quickstart_category', category)
    router.push('/dashboard/log')
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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap');
        @keyframes float1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-30px,25px)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(25px,-30px)} }
        .glass-btn { transition: all 0.2s ease; }
        .glass-btn:hover { background: rgba(255,255,255,0.08) !important; border-color: rgba(255,255,255,0.2) !important; transform: scale(1.02); }
      `}</style>

      {/* Orbs */}
      <div style={{ position: 'absolute', top: '20%', left: '15%', width: 350, height: 350, background: 'radial-gradient(circle, rgba(0,255,135,0.1) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(50px)', pointerEvents: 'none', animation: 'float1 10s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', bottom: '20%', right: '15%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(0,212,255,0.09) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none', animation: 'float2 12s ease-in-out infinite' }} />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 10 }}
      >
        {/* Badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Zap size={16} color="#FFD700" />
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 500 }}>Quick Start — 10 seconds</span>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ fontSize: 60, marginBottom: 16, display: 'block', filter: 'drop-shadow(0 0 25px rgba(0,255,135,0.4))' }}
          >
            🌱
          </motion.div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 0 10px', lineHeight: 1.2, letterSpacing: '-0.5px' }}>
            What do you want to<br />
            <span style={{ background: 'linear-gradient(135deg, #00FF87 0%, #00D4FF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>track first?</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, margin: 0, padding: '0 20px', lineHeight: 1.5 }}>
            Jump right in. You can complete your full footprint quiz later to unlock your living world.
          </p>
        </div>

        {/* Categories */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
          {CATEGORIES.map((cat, i) => (
            <motion.button
              key={cat.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.1, ease: 'easeOut' }}
              onClick={() => handleSelect(cat.label.toLowerCase())}
              className="glass-btn"
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 16,
                padding: '20px 24px', background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20,
                cursor: 'pointer', textAlign: 'left',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
                {cat.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#fff', fontWeight: 600, fontSize: 16, marginBottom: 4, fontFamily: "'Outfit', sans-serif" }}>{cat.label}</div>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>{cat.description}</div>
              </div>
              <div style={{ color: cat.color, fontSize: 18, opacity: 0.7 }}>→</div>
            </motion.button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em' }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
        </div>

        {/* Full quiz link */}
        <Link href="/onboarding/quiz" style={{ textDecoration: 'none', display: 'block' }}>
          <motion.div
            whileHover={{ scale: 1.02, filter: 'brightness(1.08)' }}
            whileTap={{ scale: 0.98 }}
            style={{
              width: '100%', padding: '16px 24px',
              background: 'linear-gradient(135deg, #00FF87 0%, #00D4FF 100%)',
              borderRadius: 18, color: '#050d0a', fontSize: 15, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontFamily: "'Outfit', sans-serif", boxShadow: '0 8px 32px rgba(0,255,135,0.3)',
            }}
          >
            Take the Full Quiz (2 min) →
          </motion.div>
        </Link>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 12, marginTop: 16 }}>
          Full quiz unlocks your living world & personal insights
        </p>
      </motion.div>
    </div>
  )
}
