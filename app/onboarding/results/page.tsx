'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { TrendingDown, TrendingUp, Minus } from 'lucide-react'
import { getRelatableComparison, getFootprintCategory } from '@/lib/carbon/calculator'

const TIER_CONFIG = {
  low: {
    label: 'Green Pioneer',
    color: '#00FF87',
    icon: '🌿',
    gradient: 'linear-gradient(135deg, #00FF87 0%, #00D4FF 100%)',
    bg: 'rgba(0,255,135,0.08)',
    border: 'rgba(0,255,135,0.3)',
    description: 'Your footprint is well below average. You\'re already making a difference!',
    worldEmoji: '🌳',
    worldDesc: 'Your world starts lush and green.',
  },
  moderate: {
    label: 'Aware Citizen',
    color: '#FFD700',
    icon: '🌤️',
    gradient: 'linear-gradient(135deg, #FFD700 0%, #00FF87 100%)',
    bg: 'rgba(255,215,0,0.08)',
    border: 'rgba(255,215,0,0.3)',
    description: 'Your footprint is around average. A few changes can move you into the green zone.',
    worldEmoji: '🌿',
    worldDesc: 'Your world has potential — help it grow.',
  },
  high: {
    label: 'High Impact',
    color: '#FF4757',
    icon: '⚡',
    gradient: 'linear-gradient(135deg, #FF4757 0%, #FFD700 100%)',
    bg: 'rgba(255,71,87,0.08)',
    border: 'rgba(255,71,87,0.3)',
    description: 'Your footprint is above average, but every action you take here counts.',
    worldEmoji: '🌱',
    worldDesc: 'Your world needs your help to recover.',
  },
}

const NATIONAL_AVERAGE = 50

function ResultsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const totalParam = searchParams?.get('total')
  const total = totalParam ? parseFloat(totalParam) : 50
  const category = getFootprintCategory(total)
  const tier = TIER_CONFIG[category]

  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const duration = 2000
    const start = Date.now()
    const tick = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(eased * total)
      if (progress < 1) requestAnimationFrame(tick)
    }
    const timeout = setTimeout(() => requestAnimationFrame(tick), 300)
    return () => clearTimeout(timeout)
  }, [total])

  const vsAverage = ((total - NATIONAL_AVERAGE) / NATIONAL_AVERAGE) * 100
  const comparison1 = getRelatableComparison(total)
  const comparison2 = getRelatableComparison(total * 4)

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#050d0a', display: 'flex', flexDirection: 'column',
      alignItems: 'center', padding: '40px 20px', position: 'relative', overflow: 'hidden',
      fontFamily: "'Inter', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@600&display=swap');
        @keyframes float1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(20px,-20px)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-20px,20px)} }
        .glass-panel { background: rgba(255,255,255,0.04); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; }
      `}</style>

      {/* Orbs based on tier color */}
      <div style={{ position: 'absolute', top: 0, left: '10%', width: 500, height: 500, background: `radial-gradient(circle, ${tier.color}15 0%, transparent 60%)`, borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none', animation: 'float1 12s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', bottom: 0, right: '10%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 60%)', borderRadius: '50%', filter: 'blur(50px)', pointerEvents: 'none', animation: 'float2 14s ease-in-out infinite' }} />

      <div style={{ width: '100%', maxWidth: 460, position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* Hero Number */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} style={{ textAlign: 'center', marginBottom: 8 }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 16px' }}>Your Weekly Footprint</p>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 12 }}>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 80, fontWeight: 800, background: tier.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1, filter: `drop-shadow(0 0 30px ${tier.color}40)` }}>
              {displayValue.toFixed(1)}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 24, fontWeight: 500 }}>kg CO₂e</span>
          </div>
        </motion.div>

        {/* Tier Badge */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6, type: 'spring' }} style={{ background: tier.bg, border: `1px solid ${tier.border}`, borderRadius: 20, padding: '20px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>{tier.icon}</div>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 700, color: tier.color, marginBottom: 6 }}>{tier.label}</div>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, margin: 0, lineHeight: 1.5 }}>{tier.description}</p>
        </motion.div>

        {/* Comparisons */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="glass-panel" style={{ padding: 24 }}>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 16px' }}>What this means</p>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🚗</div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>{comparison1}</div>
          </div>
          
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 0 16px' }} />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>📱</div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>{comparison2} per month</div>
          </div>
        </motion.div>

        {/* Vs Average */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }} className="glass-panel" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: vsAverage < 0 ? 'rgba(0,255,135,0.1)' : vsAverage > 20 ? 'rgba(255,71,87,0.1)' : 'rgba(255,215,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {vsAverage < 0 ? <TrendingDown size={24} color="#00FF87" /> : vsAverage > 5 ? <TrendingUp size={24} color="#FF4757" /> : <Minus size={24} color="#FFD700" />}
          </div>
          <div>
            <div style={{ color: '#fff', fontSize: 16, fontWeight: 600, fontFamily: "'Outfit', sans-serif", marginBottom: 2 }}>
              {Math.abs(vsAverage).toFixed(0)}% {vsAverage < 0 ? 'below' : 'above'} average
            </div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>vs national avg of {NATIONAL_AVERAGE} kg/wk</div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3 }} style={{ marginTop: 16 }}>
          <motion.button 
            onClick={() => router.push('/dashboard/world')}
            whileHover={{ scale: 1.02, filter: 'brightness(1.08)' }} 
            whileTap={{ scale: 0.98 }} 
            style={{ width: '100%', padding: '18px 24px', background: 'linear-gradient(135deg, #00FF87 0%, #00D4FF 100%)', borderRadius: 20, border: 'none', cursor: 'pointer', color: '#050d0a', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: "'Outfit', sans-serif", boxShadow: '0 8px 32px rgba(0,255,135,0.3)', letterSpacing: '0.02em' }}
          >
            Enter My World →
          </motion.button>
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13, marginTop: 16 }}>
            Your world updates every time you log an action
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', backgroundColor: '#050d0a' }} />}>
      <ResultsContent />
    </Suspense>
  )
}
