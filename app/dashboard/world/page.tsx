'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/firebase/AuthContext'
import { getWorldState, getGameState, spawnWeeklyBoss, getUserProfile, logActivity } from '@/lib/firebase/firestore'
import type { WorldState, GameState, UserProfile } from '@/types'
import dynamic from 'next/dynamic'
import { BossUI } from '@/components/dashboard/BossUI'
import { FootprintWidgets } from '@/components/dashboard/FootprintWidgets'
import DashboardLoading from '@/app/dashboard/loading'

const WorldScene = dynamic(
  () => import('@/components/world/WorldScene').then((mod) => mod.WorldScene),
  { ssr: false, loading: () => <div style={{ height: 360, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading 3D World...</div> }
)

const DEFAULT_WORLD: WorldState = {
  treeStage: 1,
  skyPollution: 0.5,
  riverClarity: 0.5,
  smokeLevel: 0,
  gardenGrowth: 0.5,
}

const DEFAULT_GAME: GameState = {
  worldHealth: 50,
  xp: 0,
  level: 1,
  streak: 1,
  carbonTrend: 'stable',
  unlockedAssets: [],
  activeBoss: null
}

export default function WorldPage() {
  const { user } = useAuth()
  const [worldState, setWorldState] = useState<WorldState | null>(null)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    if (!user) return
    try {
      const [wState, gState, uProfile] = await Promise.all([
        getWorldState(user.uid),
        getGameState(user.uid),
        getUserProfile(user.uid)
      ])
      setWorldState(wState || DEFAULT_WORLD)
      setGameState(gState || DEFAULT_GAME)
      setProfile(uProfile)
    } catch (err) {
      console.error('Failed to load world state:', err)
      setWorldState(DEFAULT_WORLD)
      setGameState(DEFAULT_GAME)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  if (loading || !worldState || !gameState) {
    return <DashboardLoading />
  }

  const xpForNextLevel = gameState.level * 100
  const xpProgress = Math.min(100, (gameState.xp % xpForNextLevel) / xpForNextLevel * 100)
  const healthColor = gameState.worldHealth > 70 ? '#00FF87' : gameState.worldHealth > 40 ? '#FFD700' : '#FF4757'

  return (
    <div style={{ padding: '0 0 24px', maxWidth: 600, margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>

      {/* ── HERO HEADER ── */}
      <div style={{
        padding: '32px 20px 24px',
        background: 'linear-gradient(180deg, rgba(0,255,135,0.04) 0%, transparent 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        marginBottom: 20,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Ambient glow */}
        <div style={{ position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)', width: 300, height: 200, background: 'radial-gradient(circle, rgba(0,255,135,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingRight: 60 }}>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, marginBottom: 4 }}>
              Your EcoWorld
            </div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: '#fff', fontFamily: "'Outfit', sans-serif", lineHeight: 1.1 }}>
              Level {gameState.level} <span style={{ color: '#00FF87' }}>Pioneer</span>
            </h1>
            {/* XP Bar */}
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${xpProgress}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                  style={{ height: '100%', background: 'linear-gradient(90deg, #00FF87, #00D4FF)', borderRadius: 2 }}
                />
              </div>
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, whiteSpace: 'nowrap', fontFamily: "'JetBrains Mono', monospace" }}>
                {gameState.xp} / {xpForNextLevel} XP
              </span>
            </div>
          </div>

          {/* World Health Ring */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: `conic-gradient(${healthColor} ${gameState.worldHealth}%, rgba(255,255,255,0.05) 0)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 20px ${healthColor}40`,
              position: 'relative'
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: '#0a0f0d',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column'
              }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: healthColor, fontFamily: "'Outfit', sans-serif", lineHeight: 1 }}>
                  {gameState.worldHealth}
                </div>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>HP</div>
              </div>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>World</div>
          </div>
        </div>

        {/* Streak Badge */}
        {gameState.streak > 0 && (
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 14,
              background: 'rgba(255,165,0,0.1)', border: '1px solid rgba(255,165,0,0.3)',
              borderRadius: 20, padding: '5px 12px'
            }}
          >
            <span style={{ fontSize: 14 }}>🔥</span>
            <span style={{ color: '#FFD700', fontSize: 13, fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>
              {gameState.streak} Day Streak
            </span>
          </motion.div>
        )}
      </div>

      <div style={{ padding: '0 20px' }}>
        {/* Boss UI */}
        <div style={{ marginBottom: 16 }}>
          {gameState.activeBoss && gameState.bossHealth !== undefined && gameState.bossMaxHealth !== undefined && (
            <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ marginBottom: 16 }}>
              <BossUI
                bossName={gameState.activeBoss}
                health={gameState.bossHealth}
                maxHealth={gameState.bossMaxHealth}
              />
            </motion.div>
          )}
        </div>

        {/* 3D World Scene */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            width: '100%', maxWidth: 500, margin: '0 auto', position: 'relative',
            borderRadius: 32, overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)'
          }}
        >
          <WorldScene
            carbonReductionScore={gameState.worldHealth}
            activeBoss={gameState.activeBoss}
            bossHealth={gameState.bossHealth}
            bossMaxHealth={gameState.bossMaxHealth}
          />

          {/* Eco Companion floating overlay */}
          {!gameState.activeBoss && (
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{ position: 'absolute', top: 16, right: 16, fontSize: 30, filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))', zIndex: 50 }}
            >
              {gameState.carbonTrend === 'decreasing' ? '🌿😃' : gameState.carbonTrend === 'increasing' ? '🌫️😟' : '🌤️😐'}
            </motion.div>
          )}
        </motion.div>

        {/* Stats Row */}
        <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { icon: '🌳', label: 'Canopy Level', value: `${worldState.treeStage} / 5`, color: '#00FF87' },
            { icon: '💧', label: 'Water Purity', value: `${Math.round(worldState.riverClarity * 100)}%`, color: '#00D4FF' },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
                backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)',
                borderRadius: 20, padding: '18px 16px',
                border: `1px solid rgba(255,255,255,0.08)`,
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              }}
            >
              <div style={{ fontSize: 22, marginBottom: 8, filter: `drop-shadow(0 0 8px ${stat.color}80)` }}>{stat.icon}</div>
              <div style={{ color: '#fff', fontSize: 14, fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>{stat.label}</div>
              <div style={{ color: stat.color, fontSize: 18, fontWeight: 800, fontFamily: "'Outfit', sans-serif", marginTop: 2 }}>{stat.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Footprint & Recommendations */}
        <FootprintWidgets
          profile={profile}
          onLogAction={async (activity) => {
            if (!user) return
            await logActivity(user.uid, { ...activity, userId: user.uid })
            await loadData()
          }}
        />

        {/* Debug Summon Boss Button */}
        {!gameState.activeBoss && (
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={async () => {
              if (user) {
                await spawnWeeklyBoss(user.uid)
                await loadData()
              }
            }}
            style={{
              marginTop: 24,
              width: '100%',
              padding: 16,
              background: 'rgba(255, 71, 87, 0.08)',
              border: '1px solid rgba(255, 71, 87, 0.3)',
              borderRadius: 20,
              color: 'rgba(255,255,255,0.6)',
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              letterSpacing: '0.05em',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
            }}
          >
            <span>🐉</span>
            <span>Summon Weekly Boss</span>
            <span style={{ fontSize: 11, opacity: 0.5 }}>(Debug)</span>
          </motion.button>
        )}
      </div>
    </div>
  )
}
