'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/firebase/AuthContext'
import { getGameState, getUserProfile } from '@/lib/firebase/firestore'
import type { GameState } from '@/types'

type LeaderboardUser = {
  id: string
  name: string
  xp: number
  streak: number
  isCurrentUser: boolean
}

export default function TeamPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([])
  const [userName, setUserName] = useState<string>('You')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setLoading(false)
      return
    }

    async function loadData() {
      try {
        const [state, profile] = await Promise.all([
          getGameState(user!.uid),
          getUserProfile(user!.uid)
        ])
        
        const currentState = state || { worldHealth: 50, xp: 0, level: 1, streak: 1, carbonTrend: 'stable', unlockedAssets: [], activeBoss: null }
        setGameState(currentState)
        setUserName(profile?.displayName || 'You')

        // Generate fake teammates for demo purposes
        const mockUsers: LeaderboardUser[] = [
          { id: 'u1', name: 'Alex M.', xp: 850, streak: 12, isCurrentUser: false },
          { id: 'u2', name: 'Sarah J.', xp: 620, streak: 5, isCurrentUser: false },
          { id: 'u3', name: 'David K.', xp: 340, streak: 2, isCurrentUser: false },
          { id: 'u4', name: 'Emma T.', xp: 120, streak: 1, isCurrentUser: false },
        ]

        // Add current user
        const currentUserData: LeaderboardUser = {
          id: user!.uid,
          name: profile?.displayName || 'You',
          xp: currentState.xp,
          streak: currentState.streak,
          isCurrentUser: true
        }

        const fullTeam = [...mockUsers, currentUserData].sort((a, b) => b.xp - a.xp)
        setLeaderboard(fullTeam)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [user, authLoading])

  if (authLoading || loading) {
    return (
      <div style={{ height: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(0,212,255,0.2)', borderTopColor: '#00D4FF' }} />
      </div>
    )
  }

  const handleInvite = async () => {
    const inviteText = `Join my CarbonQuest team and help defeat the Smog Titan! 🌍🐉`
    const inviteUrl = window.location.origin

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join CarbonQuest',
          text: inviteText,
          url: inviteUrl,
        })
      } catch (err) {
        // user cancelled share or error
        console.log('Share dismissed')
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${inviteText} ${inviteUrl}`)
        alert('Invite link copied to clipboard!')
      } catch (err) {
        console.error('Failed to copy', err)
      }
    }
  }

  return (
    <div style={{ padding: '24px 20px', maxWidth: 600, margin: '0 auto', fontFamily: "'Inter', sans-serif", paddingBottom: 120 }}>
      {/* Background Ambience */}
      <div style={{ position: 'fixed', top: '10%', right: '-10%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 60%)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none', zIndex: -1 }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, color: '#fff', fontFamily: "'Outfit', sans-serif" }}>Team Zero</h1>
        <button 
          onClick={handleInvite}
          style={{ 
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', 
            color: '#00D4FF', padding: '6px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer' 
          }}
        >
          + Invite
        </button>
      </div>

      {/* Team Summary Card */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        style={{ 
          background: 'linear-gradient(135deg, rgba(0,212,255,0.1), rgba(0,0,0,0.6))',
          backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)',
          borderRadius: 32, padding: 24, marginBottom: 32,
          border: '1px solid rgba(0,212,255,0.3)',
          boxShadow: '0 10px 40px rgba(0,212,255,0.1)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}
      >
        <div>
          <div style={{ color: '#00D4FF', fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Collective Impact</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
            <span style={{ fontSize: 36, fontWeight: 800, color: '#fff', fontFamily: "'Outfit', sans-serif" }}>1,240</span>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>XP This Week</span>
          </div>
        </div>
        <div style={{ fontSize: 40, filter: 'drop-shadow(0 0 10px rgba(0,212,255,0.5))' }}>🏆</div>
      </motion.div>

      {/* Leaderboard List */}
      <h2 style={{ fontSize: 20, color: '#fff', fontFamily: "'Outfit', sans-serif", marginBottom: 16 }}>Leaderboard</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {leaderboard.map((player, i) => {
          const isTop3 = i < 3
          const rankColor = i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : 'rgba(255,255,255,0.1)'
          
          return (
            <motion.div
              key={player.id}
              initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}
              style={{
                background: player.isCurrentUser ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${player.isCurrentUser ? 'rgba(0,212,255,0.3)' : 'rgba(255,255,255,0.05)'}`,
                borderRadius: 20, padding: 16, display: 'flex', alignItems: 'center', gap: 16,
                position: 'relative', overflow: 'hidden'
              }}
            >
              {player.isCurrentUser && (
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: '#00D4FF' }} />
              )}
              
              <div style={{ 
                width: 32, height: 32, borderRadius: '50%', 
                background: isTop3 ? `${rankColor}20` : 'transparent',
                border: `1px solid ${rankColor}`,
                color: isTop3 ? rankColor : 'rgba(255,255,255,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, fontFamily: "'Outfit', sans-serif"
              }}>
                {i + 1}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ color: '#fff', fontWeight: player.isCurrentUser ? 700 : 500, fontSize: 16 }}>
                  {player.name} {player.isCurrentUser && '(You)'}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 4, display: 'flex', gap: 12 }}>
                  <span>{player.xp} XP</span>
                  <span style={{ color: '#FF9F43' }}>🔥 {player.streak} day streak</span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
