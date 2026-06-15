'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/firebase/AuthContext'
import { getGameState, getUserProfile } from '@/lib/firebase/firestore'
import type { GameState } from '@/types'

import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'
import { useRouter } from 'next/navigation'
import DashboardLoading from '@/app/dashboard/loading'

// ─── Constants ───────────────────────────────────────────────────────────────

const ASSET_EMOJIS: Record<string, string> = {
  flower_garden: '🌸',
  wind_turbine: '🌬️',
  solar_panel: '☀️',
  pine_tree: '🌲',
  clean_river: '🌊',
}

const ASSET_LABELS: Record<string, string> = {
  flower_garden: 'Flower Garden',
  wind_turbine: 'Wind Turbine',
  solar_panel: 'Solar Panel',
  pine_tree: 'Pine Tree',
  clean_river: 'Clean River',
}

const XP_PER_LEVEL = 500

/** Map a level number to a human-readable rank title */
function getRank(level: number): string {
  if (level < 5) return 'Seedling'
  if (level < 10) return 'Sapling'
  if (level < 20) return 'Guardian'
  return 'Champion'
}

const RANK_COLORS: Record<string, string> = {
  Seedling: '#00FF87',
  Sapling: '#00D4FF',
  Guardian: '#FFD700',
  Champion: '#FF4757',
}

const RANK_ICONS: Record<string, string> = {
  Seedling: '🌱',
  Sapling: '🌿',
  Guardian: '🛡️',
  Champion: '🏆',
}

// ─── Sub-components ──────────────────────────────────────────────────────────

/** Floating ambient glow orb – purely decorative */
function GlowOrb({
  size, color, top, left, delay,
}: {
  size: number; color: string; top: string; left: string; delay: number
}) {
  return (
    <motion.div
      animate={{ y: [0, -24, 0], opacity: [0.18, 0.32, 0.18] }}
      transition={{ duration: 7 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
      style={{
        position: 'absolute', top, left,
        width: size, height: size,
        borderRadius: '50%',
        background: color,
        filter: `blur(${size * 0.55}px)`,
        pointerEvents: 'none', zIndex: 0,
      }}
    />
  )
}

/** Single stat mini-card */
function StatCard({
  label, value, icon, accentColor, delay,
}: {
  label: string; value: string | number; icon: string; accentColor: string; delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease: 'easeOut' }}
      whileHover={{ scale: 1.045, y: -4 }}
      style={{
        flex: '1 1 140px',
        background: 'rgba(255,255,255,0.045)',
        border: `1px solid ${accentColor}33`,
        borderRadius: 18,
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        padding: '20px 18px 18px',
        display: 'flex', flexDirection: 'column', gap: 6,
        boxShadow: `0 0 22px ${accentColor}22, 0 4px 24px rgba(0,0,0,0.35)`,
        cursor: 'default', position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Top neon accent line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
        borderRadius: '18px 18px 0 0',
      }} />
      <span style={{ fontSize: 26 }}>{icon}</span>
      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 26, fontWeight: 700, color: accentColor, lineHeight: 1 }}>{value}</span>
      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
    </motion.div>
  )
}

/** Animated XP progress bar */
function XpBar({ xp, level }: { xp: number; level: number }) {
  const progress = ((xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100

  return (
    <div style={{ width: '100%' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', marginBottom: 6,
        fontFamily: "'Inter', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.5)',
      }}>
        <span>Level {level}</span>
        <span>{xp % XP_PER_LEVEL} / {XP_PER_LEVEL} XP to Level {level + 1}</span>
      </div>
      <div style={{ height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden', position: 'relative' }}>
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1.4, delay: 0.6, ease: 'easeOut' }}
          style={{ height: '100%', borderRadius: 99, background: 'linear-gradient(90deg, #00FF87, #00D4FF)', boxShadow: '0 0 12px #00FF8788', position: 'relative' }}
        >
          {/* Shimmer sweep */}
          <motion.div
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 1.8 }}
            style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.45) 50%, transparent 100%)' }}
          />
        </motion.div>
      </div>
    </div>
  )
}

/** Glowing trophy / badge card */
function TrophyCard({ assetKey, index }: { assetKey: string; index: number }) {
  const emoji = ASSET_EMOJIS[assetKey] ?? '🏆'
  const label = ASSET_LABELS[assetKey] ?? assetKey.replace(/_/g, ' ')

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.75 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.15 * index + 0.4, ease: 'backOut' }}
      whileHover={{ scale: 1.08, rotate: 1 }}
      style={{
        position: 'relative', width: 120,
        background: 'rgba(255,215,0,0.07)',
        border: '1px solid rgba(255,215,0,0.22)',
        borderRadius: 20, padding: '22px 16px 16px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        boxShadow: '0 0 24px rgba(255,215,0,0.14), 0 6px 32px rgba(0,0,0,0.4)',
        cursor: 'default', overflow: 'hidden',
      }}
    >
      {/* Shimmer on hover */}
      <motion.div
        initial={{ x: '-120%', opacity: 0 }}
        whileHover={{ x: '220%', opacity: 1 }}
        transition={{ duration: 0.65, ease: 'easeInOut' }}
        style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.18) 50%, transparent 80%)', pointerEvents: 'none' }}
      />
      <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,215,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, boxShadow: '0 0 20px rgba(255,215,0,0.35)' }}>
        {emoji}
      </div>
      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.65)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.06em', lineHeight: 1.3 }}>
        {label}
      </span>
      {/* Bottom gold accent */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #FFD700, transparent)' }} />
    </motion.div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [userName, setUserName] = useState<string>('Eco Warrior')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) { setTimeout(() => setLoading(false), 0); return }
    async function loadData() {
      try {
        const [state, profile] = await Promise.all([getGameState(user!.uid), getUserProfile(user!.uid)])
        setGameState(state || { worldHealth: 50, xp: 0, level: 1, streak: 1, carbonTrend: 'stable', unlockedAssets: [], activeBoss: null })
        setUserName(profile?.displayName || 'Eco Warrior')
      } catch (err) { console.error(err) } finally { setLoading(false) }
    }
    loadData()
  }, [user, authLoading])

  const handleSignOut = async () => {
    try { await signOut(auth); router.push('/') } catch (err) { console.error('Failed to sign out', err) }
  }

  if (authLoading || loading) {
    return <DashboardLoading />
  }

  const assets = gameState?.unlockedAssets || []
  // Add some mock unlocked assets if the user hasn't beaten any bosses yet so the demo looks good
  const displayAssets = assets.length > 0 ? assets : ['pine_tree', 'clean_river']

  const xp = gameState?.xp ?? 0
  const level = gameState?.level ?? 1
  const worldHealth = gameState?.worldHealth ?? 50
  const streak = gameState?.streak ?? 1
  const rank = getRank(level)
  const rankColor = RANK_COLORS[rank]
  const avatarInitial = userName.charAt(0).toUpperCase()

  const statCards = [
    { label: 'Total XP',     value: xp.toLocaleString(), icon: '⚡', color: '#00FF87' },
    { label: 'Level',        value: level,               icon: '🎯', color: '#00D4FF' },
    { label: 'World Health', value: `${worldHealth}%`,   icon: '🌍', color: '#FFD700' },
    { label: 'Streak',       value: `${streak}d`,        icon: '🔥', color: '#FF4757' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #060d06 0%, #0a120e 50%, #070a10 100%)', fontFamily: "'Inter', sans-serif", position: 'relative', overflowX: 'hidden' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;900&family=Inter:wght@400;500;600&display=swap');`}</style>

      {/* Ambient glow orbs */}
      <GlowOrb size={320} color="#FFD70055" top="8%"  left="-8%"  delay={0}   />
      <GlowOrb size={240} color="#00FF8733" top="55%" left="78%"  delay={1.5} />
      <GlowOrb size={180} color="#00D4FF33" top="30%" left="60%"  delay={3}   />
      <GlowOrb size={140} color="#FF475733" top="80%" left="15%"  delay={2}   />

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 16px 100px', position: 'relative', zIndex: 1 }}>

        {/* ── Hero Banner ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          style={{
            width: '100%', borderRadius: '0 0 32px 32px',
            background: 'linear-gradient(135deg, rgba(0,255,135,0.12) 0%, rgba(0,212,255,0.08) 50%, rgba(255,215,0,0.06) 100%)',
            border: '1px solid rgba(0,255,135,0.12)', borderTop: 'none',
            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            padding: '52px 32px 36px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18,
            position: 'relative', overflow: 'hidden',
            boxShadow: '0 8px 48px rgba(0,255,135,0.1), 0 2px 0 rgba(0,255,135,0.15) inset',
          }}
        >
          {/* Subtle grid overlay for depth */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'linear-gradient(rgba(0,255,135,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,135,0.03) 1px, transparent 1px)',
            backgroundSize: '32px 32px', pointerEvents: 'none',
          }} />

          {/* Glowing avatar circle */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 160, damping: 14, delay: 0.2 }}
            style={{
              width: 96, height: 96, borderRadius: '50%',
              background: 'linear-gradient(135deg, #00FF87 0%, #00D4FF 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 42, fontWeight: 900, fontFamily: "'Outfit', sans-serif", color: '#060d06',
              boxShadow: '0 0 0 4px rgba(0,255,135,0.25), 0 0 40px rgba(0,255,135,0.45), 0 0 80px rgba(0,255,135,0.2)',
              position: 'relative', zIndex: 1,
            }}
          >
            {avatarInitial}
          </motion.div>

          {/* Name + rank badge */}
          <div style={{ textAlign: 'center', zIndex: 1 }}>
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              style={{ fontFamily: "'Outfit', sans-serif", fontSize: 28, fontWeight: 700, color: '#ffffff', margin: 0, lineHeight: 1.1 }}
            >
              {userName}
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.55 }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8, padding: '4px 14px', borderRadius: 99, background: `${rankColor}18`, border: `1px solid ${rankColor}44` }}
            >
              <span style={{ fontSize: 13 }}>{RANK_ICONS[rank]}</span>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 600, color: rankColor, letterSpacing: '0.05em' }}>{rank}</span>
            </motion.div>
          </div>

          {/* XP progress bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
            style={{ width: '100%', maxWidth: 420, zIndex: 1 }}
          >
            <XpBar xp={xp} level={level} />
          </motion.div>
        </motion.div>

        {/* ── Stats Grid ──────────────────────────────────────────────────── */}
        <div style={{ marginTop: 28, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {statCards.map((card, i) => (
            <StatCard key={card.label} label={card.label} value={card.value} icon={card.icon} accentColor={card.color} delay={0.1 * i + 0.3} />
          ))}
        </div>

        {/* ── Trophy Room ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          style={{ marginTop: 36 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ width: 3, height: 22, borderRadius: 99, background: 'linear-gradient(180deg, #FFD700, #FF4757)' }} />
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 700, color: '#ffffff', margin: 0 }}>Trophy Room</h2>
            <span style={{ marginLeft: 'auto', fontFamily: "'Inter', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
              {displayAssets.length} unlocked
            </span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            {displayAssets.map((key, i) => (
              <TrophyCard key={key} assetKey={key} index={i} />
            ))}
          </div>

          {assets.length === 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.3)', marginTop: 14, fontStyle: 'italic' }}
            >
              Complete eco-missions to unlock real trophies!
            </motion.p>
          )}
        </motion.div>

        {/* ── Sign-out button ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 52 }}
        >
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: '0 0 20px rgba(255,71,87,0.45)' }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSignOut}
            style={{
              background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.35)',
              borderRadius: 12, padding: '10px 24px',
              fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 600, color: '#FF4757',
              cursor: 'pointer', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            <span>→</span> Sign Out
          </motion.button>
        </motion.div>

      </div>
    </div>
  )
}
