'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import type { UserProfile, ActivityLog } from '@/types'

interface FootprintWidgetsProps {
  profile: UserProfile | null
  onLogAction: (activity: Omit<ActivityLog, 'id' | 'userId'>) => Promise<void>
}

const CATEGORY_CONFIG = {
  transport: { icon: '🚗', color: '#00D4FF', label: 'Transport' },
  food: { icon: '🥗', color: '#00FF87', label: 'Food' },
  energy: { icon: '⚡', color: '#FFD700', label: 'Energy' },
}

const RECOMMENDATION_CONFIGS = {
  meat_heavy: { id: 'r1', title: 'Eat a Plant-Based Lunch', description: 'Swap one meat meal for veggies today', points: 15, co2: 2.5, type: 'food' as const, icon: '🥗' },
  omnivore: { id: 'r1', title: 'Try a Vegan Meal Today', description: 'Reduces food emissions by up to 50%', points: 12, co2: 1.8, type: 'food' as const, icon: '🥦' },
  default_food: { id: 'r1', title: 'Buy Local Produce', description: 'Cut food transport emissions', points: 10, co2: 1.2, type: 'food' as const, icon: '🛒' },
  car: { id: 'r2', title: 'Take Public Transit', description: 'Saves up to 4 kg CO2 vs driving', points: 20, co2: 4.0, type: 'transport' as const, icon: '🚇' },
  default_transport: { id: 'r2', title: 'Walk for a Short Errand', description: 'Zero-emission and healthy!', points: 15, co2: 1.5, type: 'transport' as const, icon: '🚶' },
}

export function FootprintWidgets({ profile, onLogAction }: FootprintWidgetsProps) {
  const router = useRouter()
  const [loggedTasks, setLoggedTasks] = useState<string[]>([])
  const [logging, setLogging] = useState<string | null>(null)

  if (!profile || !profile.baselineFootprint) return null

  const footprint = profile.baselineFootprint
  const total = Math.round(footprint.total)
  const maxCategory = Math.max(footprint.byCategory.transport, footprint.byCategory.food, footprint.byCategory.energy)

  const categories = [
    { key: 'transport', value: footprint.byCategory.transport },
    { key: 'food', value: footprint.byCategory.food },
    { key: 'energy', value: footprint.byCategory.energy },
  ] as const

  // Build personalized recommendations
  const foodRec = profile.quizAnswers?.diet === 'meat_heavy' ? RECOMMENDATION_CONFIGS.meat_heavy
    : profile.quizAnswers?.diet === 'omnivore' ? RECOMMENDATION_CONFIGS.omnivore
    : RECOMMENDATION_CONFIGS.default_food

  const transportRec = profile.quizAnswers?.commute === 'car' ? RECOMMENDATION_CONFIGS.car
    : RECOMMENDATION_CONFIGS.default_transport

  const recommendations = [
    foodRec,
    transportRec,
    { id: 'r3', title: 'Unplug Idle Electronics', description: 'Vampire power adds up over time', points: 5, co2: 0.5, type: 'energy' as const, icon: '🔌' },
  ]

  const footprintRating = total < 50 ? { label: 'Low Impact', color: '#00FF87' }
    : total < 100 ? { label: 'Moderate', color: '#FFD700' }
    : { label: 'High Impact', color: '#FF4757' }

  const handleComplete = async (rec: typeof recommendations[0]) => {
    if (loggedTasks.includes(rec.id) || logging) return
    if (rec.type) {
      sessionStorage.setItem('quickstart_category', rec.type)
    }
    router.push('/dashboard/log')
  }

  return (
    <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── FOOTPRINT ANALYSIS ── */}
      <motion.div
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
        style={{
          background: 'linear-gradient(135deg, rgba(0,212,255,0.05), rgba(0,255,135,0.03))',
          backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)',
          borderRadius: 28, padding: '24px 20px',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
          position: 'relative', overflow: 'hidden'
        }}
      >
        {/* Background accent */}
        <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, background: 'radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, marginBottom: 4 }}>
              Carbon Footprint
            </div>
            <h2 style={{ margin: 0, color: '#fff', fontSize: 20, fontFamily: "'Outfit', sans-serif", fontWeight: 800 }}>
              Emissions Analysis
            </h2>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#00FF87', fontWeight: 800, fontSize: 26, fontFamily: "'Outfit', sans-serif", lineHeight: 1 }}>
              {total}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>kg CO₂/week</div>
            <div style={{
              marginTop: 6, display: 'inline-block',
              background: `${footprintRating.color}18`, border: `1px solid ${footprintRating.color}40`,
              borderRadius: 20, padding: '2px 10px',
              color: footprintRating.color, fontSize: 11, fontWeight: 700
            }}>
              {footprintRating.label}
            </div>
          </div>
        </div>

        {/* Category bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {categories.map(({ key, value }, i) => {
            const config = CATEGORY_CONFIG[key]
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 12,
                    background: `${config.color}15`, border: `1px solid ${config.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0
                  }}>
                    {config.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 600 }}>{config.label}</span>
                      <span style={{ color: config.color, fontSize: 13, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{Math.round(value)} kg</span>
                    </div>
                    <div style={{ width: '100%', height: 6, background: 'rgba(0,0,0,0.4)', borderRadius: 3, overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(value / maxCategory) * 100}%` }}
                        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.7 + i * 0.1 }}
                        style={{ height: '100%', background: `linear-gradient(90deg, ${config.color}80, ${config.color})`, borderRadius: 3, boxShadow: `0 0 8px ${config.color}40` }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* UN/EPA badge */}
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12 }}>🌐</span>
          <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11 }}>Calculated using UN & EPA emission standards</span>
        </div>
      </motion.div>

      {/* ── PERSONALIZED RECOMMENDATIONS ── */}
      <motion.div
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }}
        style={{
          background: 'linear-gradient(135deg, rgba(0,255,135,0.04), rgba(255,255,255,0.01))',
          backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)',
          borderRadius: 28, padding: '24px 20px',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
        }}
      >
        <div style={{ marginBottom: 18 }}>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, marginBottom: 4 }}>
            Personalized for You
          </div>
          <h2 style={{ margin: 0, color: '#fff', fontSize: 20, fontFamily: "'Outfit', sans-serif", fontWeight: 800 }}>
            Today's Actions
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <AnimatePresence>
            {recommendations.map((rec, i) => {
              const isCompleted = loggedTasks.includes(rec.id)
              const isLogging = logging === rec.id
              return (
                <motion.div
                  key={rec.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: isCompleted ? 0.55 : 1, y: 0 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  style={{
                    background: isCompleted ? 'rgba(0,255,135,0.04)' : 'rgba(0,0,0,0.25)',
                    border: `1px solid ${isCompleted ? 'rgba(0,255,135,0.2)' : 'rgba(255,255,255,0.06)'}`,
                    borderRadius: 20, padding: '14px 16px',
                    display: 'flex', alignItems: 'center', gap: 14
                  }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                    background: isCompleted ? 'rgba(0,255,135,0.15)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${isCompleted ? 'rgba(0,255,135,0.3)' : 'rgba(255,255,255,0.08)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20
                  }}>
                    {isCompleted ? '✅' : rec.icon}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: isCompleted ? 'line-through' : 'none', opacity: isCompleted ? 0.6 : 1 }}>
                      {rec.title}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 2 }}>
                      {rec.description}
                    </div>
                    <div style={{ color: '#00FF87', fontSize: 12, marginTop: 4, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
                      -{rec.co2} kg CO₂ · +{rec.points} XP
                    </div>
                  </div>

                  <motion.button
                    whileHover={!isCompleted && !isLogging ? { scale: 1.05 } : {}}
                    whileTap={!isCompleted && !isLogging ? { scale: 0.95 } : {}}
                    onClick={() => handleComplete(rec)}
                    disabled={isCompleted || !!isLogging}
                    style={{
                      background: isCompleted ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, rgba(0,255,135,0.8), rgba(0,212,255,0.6))',
                      border: 'none',
                      color: isCompleted ? 'rgba(255,255,255,0.3)' : '#050d0a',
                      padding: '8px 14px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: isCompleted ? 'default' : 'pointer',
                      fontFamily: "'Outfit', sans-serif",
                      minWidth: 60,
                      boxShadow: isCompleted ? 'none' : '0 4px 12px rgba(0,255,135,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4
                    }}
                  >
                    {isLogging ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                        style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#050d0a' }} />
                    ) : isCompleted ? 'Done ✓' : 'Do It →'}
                  </motion.button>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </motion.div>

    </div>
  )
}
