'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { QUIZ_STEPS } from '@/data/quiz-questions'
import type { QuizAnswers } from '@/types'
import { calculateBaselineFootprint } from '@/lib/carbon/calculator'
import { useAuth } from '@/lib/firebase/AuthContext'
import { saveUserProfile, saveQuizAnswers } from '@/lib/firebase/firestore'

const SLIDE_VARIANTS = {
  enter: (d: number) => ({ x: d > 0 ? '50%' : '-50%', opacity: 0, scale: 0.96 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (d: number) => ({ x: d > 0 ? '-50%' : '50%', opacity: 0, scale: 0.96 }),
}

export default function QuizPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({ wasteHabits: [], hasRenewable: false })
  const [isSaving, setIsSaving] = useState(false)

  const currentStep = QUIZ_STEPS[step]
  const totalSteps = QUIZ_STEPS.length
  const progress = ((step + 1) / totalSteps) * 100

  const liveCO2 = useMemo(() => {
    let total = 0
    QUIZ_STEPS.forEach((s) => {
      const answer = answers[s.id as keyof QuizAnswers]
      if (s.type === 'single' && answer) {
        const opt = s.options.find((o) => o.value === answer)
        if (opt) total += opt.co2ePerWeek
      } else if (s.type === 'multi' && Array.isArray(answer)) {
        ;(answer as string[]).forEach((v) => {
          const opt = s.options.find((o) => o.value === v)
          if (opt) total += opt.co2ePerWeek
        })
      }
    })
    return Math.max(0, total)
  }, [answers])

  function selectSingle(value: string) {
    setAnswers((p) => ({ ...p, [currentStep.id]: value }))
  }

  function toggleMulti(value: string) {
    setAnswers((p) => {
      const curr = (p.wasteHabits ?? []) as string[]
      if (value === 'none') return { ...p, wasteHabits: curr.includes('none') ? [] : ['none'] }
      const without = curr.filter((v) => v !== 'none')
      return { ...p, wasteHabits: without.includes(value) ? without.filter((v) => v !== value) : [...without, value] }
    })
  }

  function canAdvance() {
    const answer = answers[currentStep.id as keyof QuizAnswers]
    return currentStep.type === 'single' ? !!answer : true
  }

  function goNext() {
    if (!canAdvance()) return
    if (step < totalSteps - 1) { setDirection(1); setStep((s) => s + 1) }
    else handleFinish()
  }

  function goBack() {
    if (step > 0) { setDirection(-1); setStep((s) => s - 1) }
  }

  async function handleFinish() {
    if (!user) return
    setIsSaving(true)
    const finalAnswers = answers as QuizAnswers
    const footprint = calculateBaselineFootprint(finalAnswers)
    try {
      await saveUserProfile(user.uid, { uid: user.uid, displayName: user.displayName ?? 'Eco Explorer', email: user.email ?? '', photoURL: user.photoURL, createdAt: new Date().toISOString(), onboardingComplete: true })
      await saveQuizAnswers(user.uid, finalAnswers, footprint)
      router.push(`/onboarding/results?total=${footprint.total.toFixed(1)}`)
    } catch {
      router.push(`/onboarding/results?total=${liveCO2.toFixed(1)}`)
    } finally {
      setIsSaving(false)
    }
  }

  const currentAnswer = answers[currentStep.id as keyof QuizAnswers]

  const co2Color = liveCO2 < 30 ? '#00FF87' : liveCO2 < 60 ? '#FFD700' : '#FF4757'

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#050d0a', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', sans-serif", position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap');
        @keyframes float1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(20px,-30px)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-20px,20px)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        * { box-sizing: border-box; }
      `}</style>

      {/* Ambient orbs */}
      <div style={{ position: 'fixed', top: '5%', left: '5%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(0,255,135,0.08) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none', animation: 'float1 10s ease-in-out infinite' }} />
      <div style={{ position: 'fixed', bottom: '10%', right: '5%', width: 350, height: 350, background: 'radial-gradient(circle, rgba(0,212,255,0.07) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(50px)', pointerEvents: 'none', animation: 'float2 12s ease-in-out infinite' }} />
      <div style={{ position: 'fixed', top: '50%', right: '20%', width: 200, height: 200, background: 'radial-gradient(circle, rgba(255,215,0,0.05) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(30px)', pointerEvents: 'none' }} />

      {/* ── TOP HEADER ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 0', maxWidth: 540, margin: '0 auto', width: '100%' }}>
        {/* Back button */}
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={goBack}
          disabled={step === 0}
          style={{ width: 40, height: 40, borderRadius: 12, background: step === 0 ? 'transparent' : 'rgba(255,255,255,0.08)', border: step === 0 ? '1px solid transparent' : '1px solid rgba(255,255,255,0.12)', cursor: step === 0 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, opacity: step === 0 ? 0 : 1, transition: 'all 0.2s', backdropFilter: 'blur(12px)' }}
        >←</motion.button>

        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {QUIZ_STEPS.map((_, i) => (
            <motion.div key={i} animate={{ width: i === step ? 24 : 8, backgroundColor: i < step ? '#00FF87' : i === step ? '#00D4FF' : 'rgba(255,255,255,0.15)' }} transition={{ duration: 0.35 }} style={{ height: 6, borderRadius: 3 }} />
          ))}
        </div>

        {/* Live CO₂ badge */}
        <div style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 14 }}>⚡</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: co2Color, fontWeight: 600, transition: 'color 0.3s' }}>
            {liveCO2.toFixed(0)}
            <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}> kg/wk</span>
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ maxWidth: 540, margin: '14px auto 0', width: '100%', padding: '0 20px' }}>
        <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
          <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.4, ease: 'easeOut' }} style={{ height: '100%', background: 'linear-gradient(90deg, #00FF87, #00D4FF)', borderRadius: 2 }} />
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, overflow: 'hidden', padding: '0 20px', maxWidth: 540, margin: '0 auto', width: '100%' }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={SLIDE_VARIANTS}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            style={{ paddingTop: 32 }}
          >
            {/* Step header */}
            <div style={{ marginBottom: 28 }}>
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                style={{ fontSize: 52, marginBottom: 14, display: 'block', filter: 'drop-shadow(0 0 20px rgba(0,255,135,0.3))' }}
              >
                {currentStep.emoji}
              </motion.div>
              <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 26, fontWeight: 800, color: '#fff', margin: '0 0 8px', lineHeight: 1.2, letterSpacing: '-0.5px' }}>
                {currentStep.title}
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, margin: 0, lineHeight: 1.5 }}>
                {currentStep.subtitle}
              </p>
            </div>

            {/* Option cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {currentStep.options.map((option, i) => {
                const isSelected = currentStep.type === 'single'
                  ? currentAnswer === option.value
                  : Array.isArray(currentAnswer) && (currentAnswer as string[]).includes(option.value)

                const co2Tag = option.co2ePerWeek < 0 ? `${option.co2ePerWeek} kg` : option.co2ePerWeek === 0 ? '0 kg' : `+${option.co2ePerWeek} kg`
                const tagColor = option.co2ePerWeek < 0 ? '#00FF87' : option.co2ePerWeek === 0 ? 'rgba(255,255,255,0.3)' : option.co2ePerWeek > 30 ? '#FF4757' : 'rgba(255,255,255,0.5)'
                const tagBg = option.co2ePerWeek < 0 ? 'rgba(0,255,135,0.1)' : option.co2ePerWeek > 30 ? 'rgba(255,71,87,0.1)' : 'rgba(255,255,255,0.05)'

                return (
                  <motion.button
                    key={option.value}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.3 }}
                    whileHover={{ scale: 1.015, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => currentStep.type === 'single' ? selectSingle(option.value) : toggleMulti(option.value)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                      padding: '16px 18px',
                      background: isSelected ? 'rgba(0,255,135,0.08)' : 'rgba(255,255,255,0.04)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      border: `1px solid ${isSelected ? 'rgba(0,255,135,0.45)' : 'rgba(255,255,255,0.09)'}`,
                      borderRadius: 18,
                      cursor: 'pointer', textAlign: 'left',
                      boxShadow: isSelected ? '0 0 0 4px rgba(0,255,135,0.08), 0 8px 24px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.2)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {/* Icon */}
                    <div style={{ width: 46, height: 46, borderRadius: 13, background: isSelected ? 'rgba(0,255,135,0.12)' : 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0, transition: 'all 0.2s', border: `1px solid ${isSelected ? 'rgba(0,255,135,0.2)' : 'rgba(255,255,255,0.08)'}` }}>
                      {option.icon}
                    </div>

                    {/* Text */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: isSelected ? '#00FF87' : '#fff', fontWeight: 600, fontSize: 15, transition: 'color 0.2s', fontFamily: "'Outfit', sans-serif" }}>
                        {option.label}
                      </div>
                      {option.description && (
                        <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 2 }}>
                          {option.description}
                        </div>
                      )}
                    </div>

                    {/* CO₂ tag */}
                    <div style={{ background: tagBg, border: `1px solid ${tagColor}30`, borderRadius: 8, padding: '4px 10px', color: tagColor, fontSize: 12, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, flexShrink: 0 }}>
                      {co2Tag}
                    </div>

                    {/* Checkbox for multi */}
                    {currentStep.type === 'multi' && (
                      <div style={{ width: 22, height: 22, borderRadius: 7, border: `2px solid ${isSelected ? '#00FF87' : 'rgba(255,255,255,0.2)'}`, background: isSelected ? '#00FF87' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
                        {isSelected && <span style={{ color: '#050d0a', fontSize: 13, fontWeight: 800, lineHeight: 1 }}>✓</span>}
                      </div>
                    )}

                    {/* Radio dot for single */}
                    {currentStep.type === 'single' && (
                      <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${isSelected ? '#00FF87' : 'rgba(255,255,255,0.2)'}`, background: isSelected ? '#00FF87' : 'transparent', flexShrink: 0, transition: 'all 0.2s', boxShadow: isSelected ? '0 0 8px rgba(0,255,135,0.5)' : 'none' }} />
                    )}
                  </motion.button>
                )
              })}
            </div>

            {/* Renewable toggle — energy step only */}
            {currentStep.id === 'energyUsage' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 16, padding: '14px 18px' }}
              >
                <div>
                  <div style={{ color: '#fff', fontWeight: 600, fontSize: 14, fontFamily: "'Outfit', sans-serif" }}>☀️ I use renewable energy</div>
                  <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 2 }}>Solar, wind, or green tariff</div>
                </div>
                <div
                  onClick={() => setAnswers((p) => ({ ...p, hasRenewable: !p.hasRenewable }))}
                  style={{ width: 50, height: 28, borderRadius: 14, background: answers.hasRenewable ? 'linear-gradient(135deg, #00FF87, #00D4FF)' : 'rgba(255,255,255,0.1)', position: 'relative', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: answers.hasRenewable ? '0 0 12px rgba(0,255,135,0.4)' : 'none', flexShrink: 0 }}
                >
                  <motion.div
                    animate={{ x: answers.hasRenewable ? 22 : 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    style={{ width: 22, height: 22, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
                  />
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── FOOTER CTA ── */}
      <div style={{ padding: '16px 20px 32px', maxWidth: 540, margin: '0 auto', width: '100%' }}>
        <motion.button
          whileHover={canAdvance() ? { scale: 1.02, filter: 'brightness(1.08)' } : {}}
          whileTap={canAdvance() ? { scale: 0.97 } : {}}
          onClick={goNext}
          disabled={!canAdvance() || isSaving}
          style={{
            width: '100%', padding: '16px 24px',
            background: canAdvance() && !isSaving ? 'linear-gradient(135deg, #00FF87 0%, #00D4FF 100%)' : 'rgba(255,255,255,0.08)',
            border: 'none', borderRadius: 18,
            color: canAdvance() && !isSaving ? '#050d0a' : 'rgba(255,255,255,0.25)',
            fontSize: 16, fontWeight: 700,
            cursor: canAdvance() && !isSaving ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontFamily: "'Outfit', sans-serif",
            boxShadow: canAdvance() && !isSaving ? '0 8px 32px rgba(0,255,135,0.3)' : 'none',
            transition: 'all 0.25s ease',
            letterSpacing: '0.02em',
          }}
        >
          {isSaving
            ? <div style={{ width: 22, height: 22, border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#050d0a', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            : <>{step === totalSteps - 1 ? '🌍 See My Footprint' : 'Continue'} →</>
          }
        </motion.button>

        {/* Step counter */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 14 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00FF87', animation: 'pulse 2s infinite' }} />
          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12, margin: 0, fontFamily: "'Inter', sans-serif" }}>
            Step {step + 1} of {totalSteps} · {(totalSteps - step - 1) > 0 ? `${totalSteps - step - 1} more to go` : 'Last step!'}
          </p>
        </div>
      </div>
    </div>
  )
}
