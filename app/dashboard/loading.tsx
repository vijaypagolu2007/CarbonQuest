import React from 'react'

export default function DashboardLoading() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#050d0a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', sans-serif",
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=Inter:wght@400;500&display=swap');

        @keyframes orb1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(30px,-40px) scale(1.1)} }
        @keyframes orb2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-40px,25px) scale(1.15)} }
        @keyframes orb3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(20px,30px)} }

        @keyframes spin-ring {
          to { transform: rotate(360deg); }
        }
        @keyframes spin-ring-reverse {
          to { transform: rotate(-360deg); }
        }
        @keyframes pulse-core {
          0%,100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.15); opacity: 1; }
        }
        @keyframes float-leaf {
          0%,100% { transform: translateY(0) rotate(0deg); opacity: 0.7; }
          50% { transform: translateY(-12px) rotate(20deg); opacity: 1; }
        }
        @keyframes shimmer-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
        @keyframes dot-bounce {
          0%,80%,100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-8px); opacity: 1; }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes skeleton-shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
      `}</style>

      {/* Ambient background orbs */}
      <div style={{ position: 'fixed', top: '5%', left: '5%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(0,255,135,0.07) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none', animation: 'orb1 12s ease-in-out infinite' }} />
      <div style={{ position: 'fixed', bottom: '5%', right: '5%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(50px)', pointerEvents: 'none', animation: 'orb2 15s ease-in-out infinite' }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(255,215,0,0.04) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none', animation: 'orb3 10s ease-in-out infinite' }} />

      {/* ── Loader Core ── */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32, animation: 'fade-up 0.6s ease-out both' }}>

        {/* Concentric spinning rings + pulsing globe */}
        <div style={{ position: 'relative', width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

          {/* Outer ring */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: '2px solid transparent',
            borderTopColor: '#00FF87',
            borderRightColor: 'rgba(0,255,135,0.2)',
            animation: 'spin-ring 2s linear infinite',
          }} />

          {/* Middle ring */}
          <div style={{
            position: 'absolute', inset: 14, borderRadius: '50%',
            border: '2px solid transparent',
            borderBottomColor: '#00D4FF',
            borderLeftColor: 'rgba(0,212,255,0.2)',
            animation: 'spin-ring-reverse 1.4s linear infinite',
          }} />

          {/* Inner ring */}
          <div style={{
            position: 'absolute', inset: 28, borderRadius: '50%',
            border: '1.5px solid transparent',
            borderTopColor: '#FFD700',
            borderRightColor: 'rgba(255,215,0,0.15)',
            animation: 'spin-ring 1s linear infinite',
          }} />

          {/* Core globe */}
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, rgba(0,255,135,0.25), rgba(0,0,0,0.6))',
            border: '1px solid rgba(0,255,135,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26,
            animation: 'pulse-core 2s ease-in-out infinite',
            boxShadow: '0 0 30px rgba(0,255,135,0.15), inset 0 0 20px rgba(0,255,135,0.05)',
          }}>
            🌍
          </div>

          {/* Floating leaf particles */}
          {[
            { top: '-8px', left: '50%', delay: '0s' },
            { top: '50%', right: '-10px', delay: '0.4s' },
            { bottom: '-8px', left: '30%', delay: '0.8s' },
          ].map((s, i) => (
            <div key={i} style={{
              position: 'absolute',
              ...s,
              fontSize: 12,
              animation: `float-leaf 2.4s ease-in-out ${s.delay} infinite`,
            }}>🌿</div>
          ))}
        </div>

        {/* Brand + tagline */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
            Carbon<span style={{ color: '#00FF87' }}>Quest</span>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginTop: 4, letterSpacing: '0.05em' }}>
            Loading your living world…
          </div>
        </div>

        {/* Animated progress bar */}
        <div style={{ width: 200, height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, height: '100%',
            width: '45%',
            background: 'linear-gradient(90deg, #00FF87, #00D4FF)',
            borderRadius: 2,
            boxShadow: '0 0 8px rgba(0,255,135,0.6)',
          }} />
          {/* Shimmer sweep */}
          <div style={{
            position: 'absolute', top: 0, left: 0, height: '100%', width: '30%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
            animation: 'shimmer-bar 1.6s ease-in-out infinite',
          }} />
        </div>

        {/* Bouncing dots */}
        <div style={{ display: 'flex', gap: 8 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{
              width: 6, height: 6, borderRadius: '50%',
              background: i === 0 ? '#00FF87' : i === 1 ? '#00D4FF' : '#FFD700',
              animation: `dot-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
            }} />
          ))}
        </div>
      </div>

      {/* ── Skeleton preview cards at bottom ── */}
      <div style={{
        position: 'absolute', bottom: 100, left: 0, right: 0,
        padding: '0 20px',
        display: 'flex', flexDirection: 'column', gap: 10,
        maxWidth: 480, margin: '0 auto',
        animation: 'fade-up 0.8s ease-out 0.2s both',
      }}>
        {[{ w: '60%' }, { w: '90%' }, { w: '75%' }].map((s, i) => (
          <div key={i} style={{
            height: 12, borderRadius: 6,
            background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
            backgroundSize: '800px 100%',
            animation: 'skeleton-shimmer 1.5s ease-in-out infinite',
            width: s.w,
          }} />
        ))}
      </div>
    </div>
  )
}
