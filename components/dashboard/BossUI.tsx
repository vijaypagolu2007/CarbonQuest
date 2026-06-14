'use client'

import { motion } from 'framer-motion'

interface BossUIProps {
  bossName: string
  health: number
  maxHealth: number
}

export function BossUI({ bossName, health, maxHealth }: BossUIProps) {
  const healthPercent = Math.max(0, (health / maxHealth) * 100)
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{
        width: '100%',
        margin: '0 auto',
        background: 'rgba(26, 26, 46, 0.7)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 71, 87, 0.3)',
        padding: '12px 16px',
        boxShadow: '0 8px 32px rgba(255, 71, 87, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px'
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
        alignItems: 'baseline'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span style={{ fontSize: 18 }}>🐉</span>
          <h3 style={{ 
            margin: 0, 
            color: '#fff', 
            fontSize: 14, 
            fontWeight: 700, 
            fontFamily: "'Outfit', sans-serif",
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            textShadow: '0 0 10px rgba(255, 71, 87, 0.5)'
          }}>
            {bossName}
          </h3>
        </div>
        <span style={{
          color: 'rgba(255,255,255,0.6)',
          fontSize: 12,
          fontWeight: 600,
          fontVariantNumeric: 'tabular-nums'
        }}>
          {health} / {maxHealth}
        </span>
      </div>

      {/* Health Bar Track */}
      <div style={{
        width: '100%',
        height: 8,
        background: 'rgba(0,0,0,0.5)',
        borderRadius: 4,
        overflow: 'hidden',
        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)'
      }}>
        {/* Health Bar Fill */}
        <motion.div 
          initial={{ width: '100%' }}
          animate={{ width: `${healthPercent}%` }}
          transition={{ type: 'spring', bounce: 0, duration: 0.8 }}
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, #ff4757, #ff6b81)',
            boxShadow: '0 0 10px rgba(255, 71, 87, 0.8)',
            borderRadius: 4
          }}
        />
      </div>
      
      {/* Small floating text underneath */}
      <p style={{
        margin: 0,
        fontSize: 10,
        color: 'rgba(255,255,255,0.5)',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      }}>
        Log Actions to Deal Damage!
      </p>
    </motion.div>
  )
}
