'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/firebase/AuthContext'
import { getGameState, getActivities } from '@/lib/firebase/firestore'

type Message = { role: 'user' | 'model'; content: string; id: string }

export default function CoachPage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', content: 'Hi there! 🌱 I am your Eco Guardian. I am here to help you defeat those Carbon Monsters and grow your Living World! How are you doing today?' }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [context, setContext] = useState<unknown>(null)
  
  const endOfMessagesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) return
    async function loadContext() {
      const state = await getGameState(user!.uid)
      const acts = await getActivities(user!.uid, 10)
      setContext({ gameState: state, recentActivities: acts })
    }
    loadContext()
  }, [user])

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(e?: React.FormEvent) {
    if (e) e.preventDefault()
    if (!input.trim() || !user || isLoading) return

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          context
        })
      })

      if (!response.ok) throw new Error('API Error')
      
      const data = await response.json()
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', content: data.text }])
    } catch (err) {
      console.error(err)
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', content: 'Oops! The connection to the Spirit Realm was lost. Please try again! 🍂' }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '24px 20px', maxWidth: 600, margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 32, fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>AI Eco Coach</h1>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 24 }}>Powered by Gemini</p>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 100, msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isUser = msg.role === 'user'
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                style={{
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  background: isUser 
                    ? 'linear-gradient(135deg, rgba(0,255,135,0.2) 0%, rgba(0,212,255,0.1) 100%)' 
                    : 'rgba(255,255,255,0.05)',
                  border: isUser 
                    ? '1px solid rgba(0,255,135,0.3)' 
                    : '1px solid rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  borderRadius: isUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                  padding: '16px 20px',
                  color: '#fff',
                  boxShadow: isUser ? '0 8px 32px rgba(0,255,135,0.1)' : '0 8px 32px rgba(0,0,0,0.2)',
                  lineHeight: 1.5,
                  fontSize: 15
                }}
              >
                {/* Simplified markdown rendering */}
                {msg.content.split('\n').map((line, i) => (
                  <span key={i}>{line}<br /></span>
                ))}
              </motion.div>
            )
          })}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.05)', borderRadius: '20px 20px 20px 4px', padding: '16px 20px', color: '#fff' }}
          >
            <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5 }}>Communing with nature...</motion.span>
          </motion.div>
        )}
        <div ref={endOfMessagesRef} />
      </div>

      <div style={{ position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 600, padding: '0 20px', zIndex: 10 }}>
        <form onSubmit={sendMessage} style={{ display: 'flex', gap: 12, background: 'rgba(5, 13, 10, 0.8)', backdropFilter: 'blur(20px)', padding: '16px', borderRadius: 32, border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 -10px 40px rgba(0,0,0,0.5)' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask your Eco Guardian..."
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 16, fontFamily: "'Inter', sans-serif" }}
            disabled={isLoading || !user}
          />
          <button 
            type="submit" 
            aria-label="Send message"
            disabled={isLoading || !input.trim() || !user}
            style={{ background: '#00FF87', border: 'none', width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: isLoading || !input.trim() ? 0.5 : 1 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#050d0a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </form>
      </div>
    </div>
  )
}
