'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Globe2, PlusCircle, Users, BotMessageSquare, Target } from 'lucide-react'

const TABS = [
  { href: '/dashboard/world',  icon: Globe2,          label: 'World',  accent: '#00FF87' },
  { href: '/dashboard/log',    icon: PlusCircle,       label: 'Log',    accent: '#00FF87' },
  { href: '/dashboard/quests', icon: Target,           label: 'Quests', accent: '#FFD700' },
  { href: '/dashboard/coach',  icon: BotMessageSquare, label: 'Coach',  accent: '#BF5FFF' },
  { href: '/dashboard/team',   icon: Users,            label: 'Team',   accent: '#00D4FF' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=Inter:wght@400;500&display=swap');
      `}</style>

      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          display: 'flex',
          justifyContent: 'center',
          padding: '0 12px',
          paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
        }}
        aria-label="Dashboard navigation"
      >
        {/* Glass pill container */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            maxWidth: '480px',
            background: 'rgba(10, 12, 20, 0.80)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            borderRadius: '28px',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.04) inset',
            padding: '8px 6px',
            position: 'relative',
          }}
        >
          {TABS.map((tab) => {
            const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/')
            const Icon = tab.icon

            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-label={`Navigate to ${tab.label}`}
                aria-current={isActive ? 'page' : undefined}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textDecoration: 'none',
                  position: 'relative',
                  paddingTop: '4px',
                  paddingBottom: '2px',
                }}
              >
                <motion.div
                  whileTap={{ scale: 0.82 }}
                  whileHover={{ scale: 1.08 }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    width: 48,
                    height: 44,
                    borderRadius: 14,
                    cursor: 'pointer',
                  }}
                >
                  {/* Glowing pill background — only when this tab is active */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTabPill"
                      transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '14px',
                        background: `radial-gradient(ellipse at 50% 20%, ${tab.accent}28 0%, ${tab.accent}12 70%, transparent 100%)`,
                        border: `1px solid ${tab.accent}30`,
                        boxShadow: `0 0 18px ${tab.accent}25`,
                      }}
                    />
                  )}

                  <Icon
                    size={isActive ? 22 : 20}
                    strokeWidth={isActive ? 2.2 : 1.6}
                    aria-hidden="true"
                    style={{
                      color: isActive ? tab.accent : 'rgba(255,255,255,0.35)',
                      filter: isActive ? `drop-shadow(0 0 6px ${tab.accent}90)` : 'none',
                      transition: 'color 0.25s ease, filter 0.25s ease',
                      position: 'relative',
                      zIndex: 1,
                    }}
                  />

                  {/* Sliding dot indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTabDot"
                      transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        bottom: '3px',
                        width: '4px',
                        height: '4px',
                        borderRadius: '2px',
                        background: tab.accent,
                        boxShadow: `0 0 6px ${tab.accent}`,
                        zIndex: 1,
                      }}
                    />
                  )}
                </motion.div>

                <span
                  aria-hidden="true"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '10px',
                    fontWeight: isActive ? 600 : 400,
                    letterSpacing: '0.03em',
                    color: isActive ? tab.accent : 'rgba(255,255,255,0.28)',
                    marginTop: '3px',
                    textShadow: isActive ? `0 0 8px ${tab.accent}50` : 'none',
                    transition: 'color 0.25s ease',
                  }}
                >
                  {tab.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
