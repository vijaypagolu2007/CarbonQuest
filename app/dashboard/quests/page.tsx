'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { useAuth } from '@/lib/firebase/AuthContext'
import { getGameState } from '@/lib/firebase/firestore'
import { MOCK_BOSSES, MOCK_QUESTS } from '@/lib/carbon/calculator'
import type { GameState } from '@/types'
import DashboardLoading from '@/app/dashboard/loading'

// ─── Category colour mapping ────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  food:      '#00FF87',
  transport: '#00D4FF',
  energy:    '#FFD700',
  shopping:  '#FF4757',
  waste:     '#a78bfa',
  travel:    '#f97316',
}

// ─── Ambient floating orb ───────────────────────────────────────────────────
function FloatingOrb({
  x, y, size, color, delay,
}: {
  x: string; y: string; size: number; color: string; delay: number
}) {
  return (
    <motion.div
      animate={{ y: [0, -24, 0], opacity: [0.12, 0.28, 0.12] }}
      transition={{ duration: 6 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
      style={{
        position: 'fixed', left: x, top: y, width: size, height: size,
        borderRadius: '50%',
        background: `radial-gradient(circle at 40% 40%, ${color}, transparent 70%)`,
        filter: `blur(${size * 0.55}px)`,
        pointerEvents: 'none', zIndex: 0,
      }}
    />
  )
}

// ─── Scanline overlay for the boss card ────────────────────────────────────
function ScanlineOverlay() {
  return (
    <div style={{
      position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none',
      backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,71,87,0.03) 3px, rgba(255,71,87,0.03) 4px)',
      zIndex: 1,
    }} />
  )
}

// ─── Completed checkmark badge ─────────────────────────────────────────────
function CompletedBadge() {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -45, opacity: 0 }}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 18 }}
      style={{
        width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
        background: 'radial-gradient(circle, rgba(0,255,135,0.25), rgba(0,255,135,0.05))',
        border: '2px solid rgba(0,255,135,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 0 18px rgba(0,255,135,0.4)',
      }}
    >
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <motion.path
          d="M4 11.5l5 5 9-9"
          stroke="#00FF87"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </svg>
    </motion.div>
  )
}

// ─── Quest icon for incomplete quests ──────────────────────────────────────
function QuestIcon({ color }: { color: string }) {
  return (
    <div style={{
      width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
      background: `radial-gradient(circle, ${color}22, ${color}08)`,
      border: `1.5px solid ${color}55`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
      boxShadow: `0 0 14px ${color}33`,
    }}>
      🎯
    </div>
  )
}

// ─── DO IT button ──────────────────────────────────────────────────────────
function DoItButton({ onClick }: { onClick: () => void }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.button
      onClick={onClick}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileTap={{ scale: 0.93 }}
      style={{
        background: hovered
          ? 'linear-gradient(135deg, #00FF87, #00D4FF)'
          : 'linear-gradient(135deg, #00FF87cc, #00D4FFaa)',
        color: '#050d0a',
        border: 'none',
        padding: '9px 18px',
        borderRadius: 999,
        fontWeight: 800,
        fontSize: 12,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        letterSpacing: '0.06em',
        textTransform: 'uppercase' as const,
        boxShadow: hovered
          ? '0 0 22px rgba(0,255,135,0.7), 0 0 44px rgba(0,212,255,0.3)'
          : '0 0 12px rgba(0,255,135,0.35)',
        transition: 'box-shadow 0.2s, background 0.2s',
        flexShrink: 0,
        whiteSpace: 'nowrap' as const,
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      DO IT
      <motion.span
        animate={{ x: hovered ? 3 : 0 }}
        transition={{ type: 'spring', stiffness: 400 }}
        style={{ display: 'flex', alignItems: 'center' }}
      >
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <path d="M2 6.5h9M7 2.5l4 4-4 4" stroke="#050d0a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.span>
    </motion.button>
  )
}

// ─── Boss health bar ────────────────────────────────────────────────────────
function BossHealthBar({ percent }: { percent: number }) {
  const isLow = percent <= 25
  const controls = useAnimation()

  useEffect(() => {
    if (isLow) {
      controls.start({
        x: [0, -3, 3, -2, 2, 0],
        transition: { duration: 0.4, repeat: Infinity, repeatDelay: 1.6 },
      })
    } else {
      controls.stop()
      controls.set({ x: 0 })
    }
  }, [isLow, controls])

  return (
    <motion.div animate={controls}>
      <div style={{
        marginBottom: 8,
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{
          color: '#fff', fontSize: 13, fontWeight: 700,
          letterSpacing: '0.04em', textTransform: 'uppercase' as const,
        }}>
          Boss HP
        </span>
        <motion.span
          animate={isLow ? { opacity: [1, 0.4, 1] } : { opacity: 1 }}
          transition={isLow ? { duration: 0.8, repeat: Infinity } : {}}
          style={{ color: '#FF4757', fontWeight: 800, fontSize: 14, fontFamily: "'Outfit', sans-serif" }}
        >
          {isLow && '⚠ '}CRITICAL
        </motion.span>
      </div>

      {/* Track */}
      <div style={{
        width: '100%', height: 14, background: 'rgba(0,0,0,0.5)',
        borderRadius: 99, overflow: 'hidden',
        border: '1px solid rgba(255,71,87,0.25)',
        boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.4)',
      }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          style={{
            height: '100%',
            background: isLow
              ? 'linear-gradient(90deg, #FF4757, #ff9f43)'
              : 'linear-gradient(90deg, #FF4757, #ff6b81)',
            borderRadius: 99,
            boxShadow: isLow
              ? '0 0 18px rgba(255,71,87,0.8), 0 0 6px rgba(255,159,67,0.5)'
              : '0 0 10px rgba(255,71,87,0.5)',
            position: 'relative',
          }}
        >
          {/* Shimmer stripe */}
          <motion.div
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'linear', repeatDelay: 1.2 }}
            style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
              borderRadius: 99,
            }}
          />
        </motion.div>
      </div>
    </motion.div>
  )
}

// ─── Main page ──────────────────────────────────────────────────────────────
export default function QuestsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [gameLoading, setGameLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setTimeout(() => setGameLoading(false), 0)
      return
    }
    getGameState(user.uid).then(state => {
      setGameState(state || {
        worldHealth: 50, xp: 0, level: 1, streak: 1, carbonTrend: 'stable', unlockedAssets: [], activeBoss: null
      })
      setGameLoading(false)
    }).catch(err => {
      console.error(err)
      setGameState({
        worldHealth: 50, xp: 0, level: 1, streak: 1, carbonTrend: 'stable', unlockedAssets: [], activeBoss: null
      })
      setGameLoading(false)
    })
  }, [user, authLoading])

  if (authLoading || gameLoading) {
    return <DashboardLoading />
  }
  if (!gameState) return null

  const activeBossDef = MOCK_BOSSES.find(b => b.id === gameState.activeBoss) || MOCK_BOSSES[0]
  const currentBossHealth = gameState.bossHealth ?? activeBossDef.maxHealth
  const bossHealthPercent = Math.max(0, (currentBossHealth / activeBossDef.maxHealth) * 100)

  const questsToRender = gameState.activeQuests || MOCK_QUESTS
  const completedCount = questsToRender.filter(q => q.completed).length
  const isBossDefeated = currentBossHealth <= 0
  const isBossLow = bossHealthPercent <= 25

  return (
    <div style={{
      position: 'relative',
      padding: '24px 20px',
      maxWidth: 600,
      margin: '0 auto',
      fontFamily: "'Inter', sans-serif",
      paddingBottom: 120,
      minHeight: '100vh',
    }}>
      {/* ── Ambient orbs ─────────────────────────────────────────────── */}
      <FloatingOrb x="5%"  y="8%"  size={260} color="#FF4757" delay={0}   />
      <FloatingOrb x="70%" y="18%" size={200} color="#00D4FF" delay={1.5} />
      <FloatingOrb x="50%" y="55%" size={180} color="#00FF87" delay={2.8} />
      <FloatingOrb x="15%" y="72%" size={150} color="#FFD700" delay={0.8} />

      {/* ── Header ───────────────────────────────────────────────────── */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{ position: 'relative', zIndex: 1, marginBottom: 28 }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{
              margin: '0 0 2px 0', fontSize: 12, fontWeight: 700,
              color: '#00FF87', letterSpacing: '0.12em', textTransform: 'uppercase',
            }}>
              Daily Board
            </p>
            <h1 style={{
              margin: 0, fontSize: 34, fontWeight: 900,
              fontFamily: "'Outfit', sans-serif", color: '#fff',
              lineHeight: 1.1,
              textShadow: '0 0 40px rgba(0,255,135,0.15)',
            }}>
              Quests &amp; Bosses
            </h1>
          </div>

          {/* Level + streak pills */}
          <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
            <motion.div
              whileHover={{ scale: 1.07 }}
              style={{
                background: 'linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,215,0,0.05))',
                border: '1px solid rgba(255,215,0,0.4)',
                borderRadius: 14, padding: '8px 14px',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                boxShadow: '0 0 18px rgba(255,215,0,0.15)',
              }}
            >
              <span style={{ fontSize: 18, lineHeight: 1 }}>⚡</span>
              <span style={{ fontSize: 18, fontWeight: 900, color: '#FFD700', fontFamily: "'Outfit', sans-serif", lineHeight: 1 }}>
                {gameState.level}
              </span>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Level
              </span>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.07 }}
              style={{
                background: 'linear-gradient(135deg, rgba(0,255,135,0.15), rgba(0,255,135,0.05))',
                border: '1px solid rgba(0,255,135,0.35)',
                borderRadius: 14, padding: '8px 14px',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                boxShadow: '0 0 18px rgba(0,255,135,0.12)',
              }}
            >
              <span style={{ fontSize: 18, lineHeight: 1 }}>🔥</span>
              <span style={{ fontSize: 18, fontWeight: 900, color: '#00FF87', fontFamily: "'Outfit', sans-serif", lineHeight: 1 }}>
                {gameState.streak}
              </span>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Streak
              </span>
            </motion.div>
          </div>
        </div>

        {/* Quest progress bar */}
        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>
              Daily Progress
            </span>
            <span style={{ fontSize: 12, color: '#00FF87', fontWeight: 700 }}>
              {completedCount} / {questsToRender.length} Missions
            </span>
          </div>
          <div style={{
            height: 5, background: 'rgba(255,255,255,0.07)',
            borderRadius: 99, overflow: 'hidden',
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(completedCount / Math.max(1, questsToRender.length)) * 100}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }}
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #00FF87, #00D4FF)',
                borderRadius: 99,
                boxShadow: '0 0 10px rgba(0,255,135,0.5)',
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* ── Boss Battle Card ─────────────────────────────────────────── */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.65, ease: 'easeOut', delay: 0.1 }}
        style={{ position: 'relative', zIndex: 1, marginBottom: 36 }}
      >
        {/* Danger aura glow ring — primary */}
        <motion.div
          animate={isBossDefeated
            ? { opacity: 0 }
            : isBossLow
              ? { opacity: [0.5, 1, 0.5], scale: [1, 1.025, 1] }
              : { opacity: [0.2, 0.45, 0.2] }
          }
          transition={{ duration: isBossLow ? 1 : 2.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', inset: -8,
            borderRadius: 40,
            background: 'transparent',
            border: `2px solid ${isBossLow ? 'rgba(255,71,87,0.9)' : 'rgba(255,71,87,0.45)'}`,
            boxShadow: isBossLow
              ? '0 0 30px rgba(255,71,87,0.6), inset 0 0 30px rgba(255,71,87,0.12)'
              : '0 0 20px rgba(255,71,87,0.3)',
            pointerEvents: 'none',
          }}
        />
        {/* Danger aura glow ring — outer */}
        <motion.div
          animate={isBossDefeated
            ? { opacity: 0 }
            : { opacity: [0.1, 0.3, 0.1], scale: [1, 1.04, 1] }
          }
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          style={{
            position: 'absolute', inset: -18,
            borderRadius: 48,
            border: '1px solid rgba(255,71,87,0.2)',
            pointerEvents: 'none',
          }}
        />

        {/* Card body */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255,71,87,0.12) 0%, rgba(10,5,20,0.75) 60%, rgba(255,71,87,0.06) 100%)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          borderRadius: 32, padding: 28,
          border: '1px solid rgba(255,71,87,0.35)',
          boxShadow: '0 20px 60px rgba(255,71,87,0.12), inset 0 1px 0 rgba(255,255,255,0.06)',
          position: 'relative', overflow: 'hidden',
        }}>
          <ScanlineOverlay />

          {/* Boss defeated overlay */}
          <AnimatePresence>
            {isBossDefeated && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                style={{
                  position: 'absolute', inset: 0, borderRadius: 'inherit', zIndex: 10,
                  background: 'linear-gradient(135deg, rgba(0,255,135,0.95), rgba(0,212,255,0.9))',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 10,
                }}
              >
                <motion.div
                  animate={{ rotate: [0, -10, 10, -5, 5, 0], scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 2 }}
                  style={{ fontSize: 52 }}
                >
                  🎉
                </motion.div>
                <h2 style={{
                  margin: 0, color: '#050d0a',
                  fontFamily: "'Outfit', sans-serif", fontSize: 28, fontWeight: 900,
                  letterSpacing: '-0.02em',
                }}>
                  BOSS DEFEATED!
                </h2>
                <p style={{ color: 'rgba(5,13,10,0.75)', fontWeight: 600, margin: 0, fontSize: 15 }}>
                  You unlocked {activeBossDef.rewardAsset.replace('_', ' ')}!
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header row */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            marginBottom: 16, position: 'relative', zIndex: 2,
          }}>
            <div>
              <div style={{
                color: '#FF4757', fontSize: 11, fontWeight: 800,
                letterSpacing: '0.12em', textTransform: 'uppercase',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF4757', display: 'inline-block' }}
                />
                Active Boss Battle
              </div>
              <h2 style={{
                margin: '6px 0 0 0', fontSize: 22,
                color: '#fff', fontFamily: "'Outfit', sans-serif", fontWeight: 800,
                lineHeight: 1.1,
              }}>
                {activeBossDef.name}
              </h2>
            </div>

            <motion.div
              animate={{ y: [0, -6, 0], rotate: [0, -5, 5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                fontSize: 44,
                filter: 'drop-shadow(0 0 16px rgba(255,71,87,0.7)) drop-shadow(0 0 4px rgba(255,71,87,1))',
              }}
            >
              👹
            </motion.div>
          </div>

          <p style={{
            color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.65,
            position: 'relative', zIndex: 2, margin: '0 0 22px 0',
          }}>
            {activeBossDef.description}
          </p>

          {/* Health bar */}
          <div style={{ position: 'relative', zIndex: 2, marginBottom: 20 }}>
            <BossHealthBar percent={bossHealthPercent} />
            <div style={{
              marginTop: 6, display: 'flex', justifyContent: 'space-between',
              fontSize: 12, color: 'rgba(255,255,255,0.35)', fontWeight: 500,
            }}>
              <span>0</span>
              <span style={{ color: 'rgba(255,71,87,0.7)', fontWeight: 700 }}>
                {currentBossHealth.toLocaleString()} / {activeBossDef.maxHealth.toLocaleString()} HP
              </span>
            </div>
          </div>

          {/* Weakness badge */}
          <div style={{ position: 'relative', zIndex: 2, marginBottom: 20 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: `${CATEGORY_COLORS[activeBossDef.weaknessCategory] ?? '#00FF87'}18`,
              border: `1px solid ${CATEGORY_COLORS[activeBossDef.weaknessCategory] ?? '#00FF87'}44`,
              borderRadius: 99, padding: '5px 14px',
            }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Weakness:
              </span>
              <span style={{
                fontSize: 13, fontWeight: 700,
                color: CATEGORY_COLORS[activeBossDef.weaknessCategory] ?? '#00FF87',
                textTransform: 'capitalize',
              }}>
                {activeBossDef.weaknessCategory}
              </span>
              <motion.span
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{ fontSize: 14 }}
              >
                ⚡
              </motion.span>
            </div>
          </div>

          {/* Reward row */}
          <motion.div
            whileHover={{ scale: 1.02, boxShadow: '0 0 24px rgba(0,212,255,0.2)' }}
            style={{
              padding: '12px 16px',
              background: 'rgba(0,0,0,0.35)',
              borderRadius: 18,
              display: 'flex', alignItems: 'center', gap: 14,
              border: '1px solid rgba(0,212,255,0.15)',
              position: 'relative', zIndex: 2,
              transition: 'box-shadow 0.2s',
              cursor: 'default',
            }}
          >
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              style={{ fontSize: 26 }}
            >
              🎁
            </motion.div>
            <div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>
                Victory Reward
              </div>
              <div style={{ fontSize: 14, color: '#00D4FF', fontWeight: 700, textTransform: 'capitalize' }}>
                Unlock {activeBossDef.rewardAsset.replace(/_/g, ' ')}
              </div>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
                  style={{ width: 5, height: 5, borderRadius: '50%', background: '#00D4FF' }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ── Daily Missions ───────────────────────────────────────────── */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.5 }}
        style={{ position: 'relative', zIndex: 1 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <h2 style={{
            margin: 0, fontSize: 20, fontWeight: 800,
            color: '#fff', fontFamily: "'Outfit', sans-serif",
          }}>
            Daily Missions
          </h2>
          {completedCount === questsToRender.length && questsToRender.length > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={{
                background: 'linear-gradient(135deg, #00FF87, #00D4FF)',
                borderRadius: 99, padding: '3px 10px',
                fontSize: 11, fontWeight: 800, color: '#050d0a',
                letterSpacing: '0.06em',
              }}
            >
              ALL DONE ✓
            </motion.div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {questsToRender.map((quest, i) => {
            const catColor = CATEGORY_COLORS[quest.targetCategory] || '#00FF87'

            return (
              <motion.div
                key={quest.id}
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.45, ease: 'easeOut' }}
                whileHover={!quest.completed ? {
                  y: -2,
                  boxShadow: `0 12px 40px ${catColor}22, 0 0 0 1px ${catColor}44`,
                } : {}}
                style={{
                  background: quest.completed
                    ? 'rgba(0,255,135,0.04)'
                    : 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  borderRadius: 22,
                  border: `1px solid ${quest.completed ? 'rgba(0,255,135,0.25)' : 'rgba(255,255,255,0.08)'}`,
                  boxShadow: quest.completed
                    ? '0 4px 20px rgba(0,255,135,0.06)'
                    : '0 4px 20px rgba(0,0,0,0.2)',
                  overflow: 'hidden',
                  display: 'flex',
                  position: 'relative',
                }}
              >
                {/* Gradient left border accent */}
                <div style={{
                  width: 4,
                  flexShrink: 0,
                  background: quest.completed
                    ? 'linear-gradient(180deg, #00FF87, #00D4FF)'
                    : `linear-gradient(180deg, ${catColor}, ${catColor}55)`,
                  borderRadius: '22px 0 0 22px',
                  boxShadow: quest.completed
                    ? '2px 0 12px rgba(0,255,135,0.4)'
                    : `2px 0 10px ${catColor}55`,
                }} />

                {/* Card content */}
                <div style={{
                  flex: 1, padding: '16px 18px',
                  display: 'flex', alignItems: 'center', gap: 16,
                  opacity: quest.completed ? 0.8 : 1,
                }}>
                  {quest.completed ? <CompletedBadge /> : <QuestIcon color={catColor} />}

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      color: quest.completed ? '#00FF87' : '#fff',
                      fontWeight: 700, fontSize: 15, lineHeight: 1.3,
                      textDecoration: quest.completed ? 'line-through' : 'none',
                      textDecorationColor: 'rgba(0,255,135,0.5)',
                    }}>
                      {quest.title}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6, flexWrap: 'wrap' }}>
                      {/* XP badge */}
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        background: 'rgba(255,215,0,0.1)',
                        border: '1px solid rgba(255,215,0,0.25)',
                        borderRadius: 99, padding: '2px 8px',
                        fontSize: 11, color: '#FFD700', fontWeight: 700,
                      }}>
                        ⚡ +{quest.rewardXp} XP
                      </span>

                      {/* Health badge */}
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        background: 'rgba(0,255,135,0.08)',
                        border: '1px solid rgba(0,255,135,0.2)',
                        borderRadius: 99, padding: '2px 8px',
                        fontSize: 11, color: '#00FF87', fontWeight: 700,
                      }}>
                        🌿 +{quest.rewardHealth} HP
                      </span>

                      {/* Category chip */}
                      <span style={{
                        display: 'inline-flex', alignItems: 'center',
                        fontSize: 10, color: catColor, fontWeight: 700,
                        textTransform: 'uppercase', letterSpacing: '0.08em',
                        opacity: 0.8,
                      }}>
                        {quest.targetCategory}
                      </span>
                    </div>
                  </div>

                  {/* Action button */}
                  {!quest.completed && (
                    <DoItButton
                      onClick={() => {
                        if (quest.targetCategory) {
                          sessionStorage.setItem('quickstart_category', quest.targetCategory)
                        }
                        router.push('/dashboard/log')
                      }}
                    />
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* All complete celebratory banner */}
        <AnimatePresence>
          {completedCount === questsToRender.length && questsToRender.length > 0 && (
            <motion.div
              initial={{ y: 30, opacity: 0, scale: 0.92 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
              style={{
                marginTop: 24,
                background: 'linear-gradient(135deg, rgba(0,255,135,0.12), rgba(0,212,255,0.08))',
                border: '1px solid rgba(0,255,135,0.3)',
                borderRadius: 24, padding: '20px 24px',
                display: 'flex', alignItems: 'center', gap: 16,
                boxShadow: '0 0 40px rgba(0,255,135,0.12)',
              }}
            >
              <motion.div
                animate={{ rotate: [0, -15, 15, -10, 10, 0], scale: [1, 1.25, 1] }}
                transition={{ duration: 1, repeat: Infinity, repeatDelay: 2.5 }}
                style={{ fontSize: 36 }}
              >
                🏆
              </motion.div>
              <div>
                <div style={{
                  fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 17,
                  color: '#00FF87', marginBottom: 4,
                }}>
                  All Missions Complete!
                </div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.4 }}>
                  Incredible eco-warrior effort today. Keep the streak alive! 🔥
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
