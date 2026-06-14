'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/firebase/AuthContext'
import { 
  logActivity, 
  getActivities, 
  getUserProfile, 
  updateWorldState,
  getGameState,
  updateGameState
} from '@/lib/firebase/firestore'
import { calculateActivityImpact, calculateWorldState, calculateGameImpact } from '@/lib/carbon/calculator'
import type { ActivityCategory, ActivityLog, GameState } from '@/types'

const CATEGORIES: { id: ActivityCategory; icon: string; label: string }[] = [
  { id: 'food', icon: '🍽️', label: 'Food' },
  { id: 'transport', icon: '🚌', label: 'Transit' },
  { id: 'energy', icon: '⚡', label: 'Energy' },
  { id: 'shopping', icon: '🛍️', label: 'Shop' },
  { id: 'waste', icon: '♻️', label: 'Waste' },
]

const ACTIONS: Record<ActivityCategory, { id: string; label: string; qtyLabel: string; type: 'good' | 'bad' | 'neutral' }[]> = {
  food: [
    { id: 'vegan_meal', label: 'Vegan Meal', qtyLabel: 'meals', type: 'good' },
    { id: 'vegetarian_meal', label: 'Veggie Meal', qtyLabel: 'meals', type: 'good' },
    { id: 'chicken_meal', label: 'Chicken Meal', qtyLabel: 'meals', type: 'neutral' },
    { id: 'beef_meal', label: 'Beef Meal', qtyLabel: 'meals', type: 'bad' },
  ],
  transport: [
    { id: 'cycling_km', label: 'Cycling', qtyLabel: 'km', type: 'good' },
    { id: 'metro_km', label: 'Metro / Train', qtyLabel: 'km', type: 'good' },
    { id: 'car_petrol_km', label: 'Car (Petrol)', qtyLabel: 'km', type: 'bad' },
    { id: 'flight_domestic_km', label: 'Flight', qtyLabel: 'km', type: 'bad' },
  ],
  energy: [
    { id: 'electricity_kwh', label: 'Grid Power', qtyLabel: 'kWh', type: 'bad' },
    { id: 'ac_hour', label: 'AC Use', qtyLabel: 'hours', type: 'bad' },
  ],
  shopping: [
    { id: 'secondhand_item', label: 'Thrifted Item', qtyLabel: 'items', type: 'good' },
    { id: 'fast_fashion_item', label: 'Fast Fashion', qtyLabel: 'items', type: 'bad' },
    { id: 'electronics_item', label: 'Electronics', qtyLabel: 'items', type: 'bad' },
  ],
  waste: [
    { id: 'recycled_kg', label: 'Recycling', qtyLabel: 'kg', type: 'good' },
    { id: 'composted_kg', label: 'Composting', qtyLabel: 'kg', type: 'good' },
    { id: 'landfill_kg', label: 'Trash', qtyLabel: 'kg', type: 'bad' },
  ],
  travel: []
}

export default function LogActivityPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<ActivityCategory>('food')
  const [selectedAction, setSelectedAction] = useState<string | null>(null)
  const [quantity, setQuantity] = useState<number>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    const qs = sessionStorage.getItem('quickstart_category')
    if (qs && CATEGORIES.some(c => c.id === qs)) {
      setActiveTab(qs as ActivityCategory)
      sessionStorage.removeItem('quickstart_category')
    }
  }, [])

  async function handleLog() {
    if (!user || !selectedAction) return
    setIsSubmitting(true)
    
    try {
      const impact = calculateActivityImpact(activeTab, selectedAction, quantity)
      
      const newActivity: Omit<ActivityLog, 'id' | 'timestamp'> = {
        userId: user.uid,
        type: activeTab,
        subtype: selectedAction,
        co2eImpact: impact,
        ecoPoints: impact <= 0 ? 10 : 0,
      }

      await logActivity(user.uid, newActivity as Omit<ActivityLog, 'id'>)
      const profile = await getUserProfile(user.uid)
      const baseline = profile?.baselineFootprint?.total ?? 50
      const recentActivities = await getActivities(user.uid, 50)
      const newWorldState = calculateWorldState(recentActivities, baseline)
      await updateWorldState(user.uid, newWorldState)

      // GAMIFICATION LOGIC
      let fetchedState = await getGameState(user.uid)
      let gameState = { 
        worldHealth: fetchedState?.worldHealth ?? 50, 
        xp: fetchedState?.xp ?? 0, 
        level: fetchedState?.level ?? 1, 
        streak: fetchedState?.streak ?? 1, 
        carbonTrend: fetchedState?.carbonTrend ?? 'stable', 
        unlockedAssets: fetchedState?.unlockedAssets || [], 
        activeBoss: fetchedState?.activeBoss || null,
        bossHealth: fetchedState?.bossHealth,
        bossMaxHealth: fetchedState?.bossMaxHealth,
        activeQuests: fetchedState?.activeQuests
      }
      
      const { healthDelta, newHealth, xpDelta, bossDamage, newState } = calculateGameImpact(activeTab, selectedAction, quantity, gameState as any)
      
      // Basic level up logic (100 xp per level)
      if ((newState.xp ?? 0) >= (newState.level ?? 1) * 100) {
        newState.level = (newState.level ?? 1) + 1
      }
      newState.carbonTrend = healthDelta > 0 ? 'decreasing' : healthDelta < 0 ? 'increasing' : 'stable'
      
      await updateGameState(user.uid, newState)

      let toastMsg = `Logged! Health ${healthDelta > 0 ? '+' : ''}${healthDelta} | +${xpDelta} XP`
      if (bossDamage > 0) toastMsg += ` | -${bossDamage} Boss HP!`

      setToast({ msg: toastMsg, type: 'success' })
      setSelectedAction(null)
      setQuantity(1)
    } catch (err) {
      console.error(err)
      setToast({ msg: 'Failed to log activity', type: 'error' })
    } finally {
      setIsSubmitting(false)
      setTimeout(() => setToast(null), 4000)
    }
  }

  const currentActions = ACTIONS[activeTab]
  const selectedActionData = currentActions.find(a => a.id === selectedAction)

  return (
    <div style={{ padding: '24px 20px', paddingBottom: 120, maxWidth: 600, margin: '0 auto', fontFamily: "'Inter', sans-serif", position: 'relative', minHeight: '80vh' }}>
      {/* Liquid Glass Background Orbs */}
      <style>{`
        @keyframes liquidFloat1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-30px, 40px) scale(1.1)} }
        @keyframes liquidFloat2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(40px, -20px) scale(1.15)} }
        .liquid-glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          border-left: 1px solid rgba(255, 255, 255, 0.1);
          border-right: 1px solid rgba(255, 255, 255, 0.05);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 2px 20px rgba(255, 255, 255, 0.02);
        }
      `}</style>
      
      <div style={{ position: 'fixed', top: '10%', left: '-10%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(0,255,135,0.08) 0%, transparent 60%)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none', animation: 'liquidFloat1 15s ease-in-out infinite', zIndex: -1 }} />
      <div style={{ position: 'fixed', bottom: '20%', right: '-5%', width: 350, height: 350, background: 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 60%)', borderRadius: '50%', filter: 'blur(50px)', pointerEvents: 'none', animation: 'liquidFloat2 18s ease-in-out infinite', zIndex: -1 }} />

      <div style={{ marginBottom: 24 }}>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, marginBottom: 4 }}>
          Track Your Impact
        </div>
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 30, fontWeight: 800, color: '#fff', margin: '0 0 6px', textShadow: '0 4px 20px rgba(0,255,135,0.15)' }}>
          Log Activity
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, margin: 0 }}>
          Every action shapes your living world in real time.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', paddingBottom: 20 }}>
        {CATEGORIES.map(tab => {
          const isActive = activeTab === tab.id
          return (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.93 }}
              onClick={() => { setActiveTab(tab.id); setSelectedAction(null); setQuantity(1) }}
              className="liquid-glass-card"
              style={{
                background: isActive ? 'linear-gradient(135deg, rgba(0,255,135,0.15) 0%, rgba(0,212,255,0.05) 100%)' : 'rgba(255,255,255,0.02)',
                borderTop: `1px solid ${isActive ? 'rgba(0,255,135,0.4)' : 'rgba(255,255,255,0.1)'}`,
                borderLeft: `1px solid ${isActive ? 'rgba(0,255,135,0.2)' : 'rgba(255,255,255,0.05)'}`,
                borderRadius: 20, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 8,
                color: isActive ? '#00FF87' : '#fff', cursor: 'pointer', flexShrink: 0,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isActive ? '0 10px 30px rgba(0,255,135,0.15), inset 0 2px 20px rgba(255,255,255,0.05)' : 'none',
              }}
            >
              <span style={{ fontSize: 18, filter: isActive ? 'drop-shadow(0 0 8px rgba(0,255,135,0.5))' : 'none' }}>{tab.icon}</span>
              <span style={{ fontWeight: isActive ? 700 : 500, fontSize: 15, fontFamily: "'Outfit', sans-serif", letterSpacing: '0.02em' }}>{tab.label}</span>
            </motion.button>
          )
        })}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
        <AnimatePresence mode="popLayout">
          {currentActions.map((action, i) => {
            const isSelected = selectedAction === action.id
            const color = action.type === 'good' ? '#00FF87' : action.type === 'bad' ? '#FF4757' : '#FFD700'
            return (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 25 }}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedAction(action.id)}
                className="liquid-glass-card"
                style={{
                  background: isSelected ? `linear-gradient(135deg, ${color}20 0%, transparent 100%)` : 'rgba(255,255,255,0.02)',
                  borderTop: `1px solid ${isSelected ? color : 'rgba(255,255,255,0.15)'}`,
                  borderLeft: `1px solid ${isSelected ? `${color}80` : 'rgba(255,255,255,0.05)'}`,
                  borderRadius: 24, padding: '20px 16px', textAlign: 'left', cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isSelected ? `0 12px 40px ${color}25, inset 0 2px 20px rgba(255,255,255,0.05)` : '0 8px 32px rgba(0,0,0,0.2)',
                  position: 'relative', overflow: 'hidden'
                }}
              >
                {/* Glossy reflection on selection */}
                {isSelected && (
                  <div style={{ position: 'absolute', top: 0, left: '-100%', width: '50%', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)', transform: 'skewX(-20deg)', animation: 'shimmer 1.5s ease-out' }} />
                )}
                
                <div style={{ color: isSelected ? color : '#fff', fontWeight: 700, fontSize: 16, fontFamily: "'Outfit', sans-serif", lineHeight: 1.2 }}>{action.label}</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{action.type === 'good' ? 'Low Impact' : action.type === 'bad' ? 'High Impact' : 'Neutral'}</div>
              </motion.button>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Quantity & Submit */}
      <AnimatePresence>
        {selectedActionData && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="liquid-glass-card"
            style={{ marginTop: 40, borderRadius: 32, padding: 24, position: 'relative' }}
          >
            {/* Ambient inner glow */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80%', height: '80%', background: 'radial-gradient(circle, rgba(0,255,135,0.05) 0%, transparent 70%)', filter: 'blur(30px)', pointerEvents: 'none' }} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, position: 'relative', zIndex: 1 }}>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15, fontWeight: 500 }}>Select {selectedActionData.qtyLabel}</div>
              <div className="liquid-glass-card" style={{ display: 'flex', alignItems: 'center', gap: 16, borderRadius: 20, padding: '6px 14px', background: 'rgba(0,0,0,0.3)' }}>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ background: 'none', border: 'none', color: '#00FF87', fontSize: 24, cursor: 'pointer', padding: '0 8px' }}>-</motion.button>
                <div style={{ color: '#fff', fontSize: 22, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", width: 40, textAlign: 'center' }}>{quantity}</div>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setQuantity(quantity + 1)} style={{ background: 'none', border: 'none', color: '#00FF87', fontSize: 22, cursor: 'pointer', padding: '0 8px' }}>+</motion.button>
              </div>
            </div>

            {/* LIVE IMPACT PREVIEW */}
            <div style={{ 
              background: 'rgba(0,0,0,0.4)', borderRadius: 16, padding: 16, marginBottom: 24, 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              border: `1px solid ${selectedActionData.type === 'good' ? 'rgba(0,255,135,0.3)' : selectedActionData.type === 'bad' ? 'rgba(255,71,87,0.3)' : 'rgba(255,215,0,0.3)'}` 
            }}>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estimated Impact</div>
                <div style={{ 
                  color: selectedActionData.type === 'good' ? '#00FF87' : selectedActionData.type === 'bad' ? '#FF4757' : '#FFD700', 
                  fontSize: 24, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", marginTop: 4 
                }}>
                  {calculateActivityImpact(activeTab, selectedAction || '', quantity) <= 0 
                    ? `Low / Net-Zero` 
                    : `+${calculateActivityImpact(activeTab, selectedAction || '', quantity)} kg CO2`}
                </div>
              </div>
              <div style={{ fontSize: 32, filter: 'grayscale(0.2)' }}>
                {selectedActionData.type === 'good' ? '🌱' : selectedActionData.type === 'bad' ? '🏭' : '⚖️'}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02, filter: 'brightness(1.1)' }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLog}
              disabled={isSubmitting}
              style={{
                width: '100%', padding: '18px', borderRadius: 20, border: 'none',
                background: 'linear-gradient(135deg, rgba(0,255,135,0.9), rgba(0,212,255,0.9))',
                color: '#050d0a', fontSize: 17, fontWeight: 800, fontFamily: "'Outfit', sans-serif",
                cursor: isSubmitting ? 'wait' : 'pointer', position: 'relative', zIndex: 1,
                boxShadow: '0 12px 40px rgba(0,255,135,0.4), inset 0 2px 0 rgba(255,255,255,0.4)',
                textShadow: '0 1px 2px rgba(255,255,255,0.3)', letterSpacing: '0.02em',
              }}
            >
              {isSubmitting ? 'Processing Liquid Logic...' : 'Log & Impact World'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Liquid Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.8 }}
            className="liquid-glass-card"
            style={{
              position: 'fixed', bottom: 120, left: '50%', transform: 'translateX(-50%)',
              background: toast.type === 'success' ? 'rgba(0,255,135,0.1)' : 'rgba(255,71,87,0.1)',
              borderTop: `1px solid ${toast.type === 'success' ? '#00FF87' : '#FF4757'}`,
              color: '#fff', padding: '16px 28px', borderRadius: 30,
              display: 'flex', alignItems: 'center', gap: 12, fontWeight: 700, fontSize: 15,
              boxShadow: `0 20px 50px ${toast.type === 'success' ? 'rgba(0,255,135,0.2)' : 'rgba(255,71,87,0.2)'}`, zIndex: 100,
              fontFamily: "'Outfit', sans-serif"
            }}
          >
            <span style={{ fontSize: 20, filter: `drop-shadow(0 0 10px ${toast.type === 'success' ? '#00FF87' : '#FF4757'})` }}>{toast.type === 'success' ? '💧' : '❌'}</span>
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes shimmer {
          0% { left: -100% }
          100% { left: 200% }
        }
      `}</style>
    </div>
  )
}
