import { describe, it, expect } from 'vitest'
import {
  calculateStreakMultiplier,
  checkBadgeUnlocks,
  getStreakStatus,
  POINTS,
} from './scoring'
import type { ActivityLog, Badge } from '@/types'

// ─── Helper factories ────────────────────────────────────────────────────────

function makeActivity(overrides: Partial<ActivityLog> = {}): ActivityLog {
  return {
    id: 'test-id',
    userId: 'user-1',
    type: 'food',
    subtype: 'vegan_meal',
    quantity: 1,
    co2eImpact: -0.5,
    ecoPoints: 15,
    timestamp: new Date().toISOString(),
    ...overrides,
  }
}

// ─── POINTS constant ──────────────────────────────────────────────────────────

describe('POINTS constants', () => {
  it('has positive reward for eco_positive_action', () => {
    expect(POINTS.eco_positive_action).toBeGreaterThan(0)
  })

  it('has negative penalty for carbon_heavy_action', () => {
    expect(POINTS.carbon_heavy_action).toBeLessThan(0)
  })

  it('has a streak week bonus greater than single streak day', () => {
    expect(POINTS.streak_week_bonus).toBeGreaterThan(POINTS.streak_day)
  })
})

// ─── calculateStreakMultiplier ────────────────────────────────────────────────

describe('calculateStreakMultiplier', () => {
  it('returns 1.0 for a streak of 1', () => {
    expect(calculateStreakMultiplier(1)).toBe(1.0)
  })

  it('returns 1.1 for a streak of 3', () => {
    expect(calculateStreakMultiplier(3)).toBe(1.1)
  })

  it('returns 1.25 for a streak of 7', () => {
    expect(calculateStreakMultiplier(7)).toBe(1.25)
  })

  it('returns 1.5 for a streak of 14', () => {
    expect(calculateStreakMultiplier(14)).toBe(1.5)
  })

  it('returns 2.0 for a streak of 30 or more', () => {
    expect(calculateStreakMultiplier(30)).toBe(2.0)
    expect(calculateStreakMultiplier(100)).toBe(2.0)
  })

  it('always returns a value >= 1.0', () => {
    expect(calculateStreakMultiplier(0)).toBeGreaterThanOrEqual(1.0)
  })

  it('multiplier is monotonically non-decreasing at key thresholds', () => {
    expect(calculateStreakMultiplier(7)).toBeGreaterThanOrEqual(calculateStreakMultiplier(3))
    expect(calculateStreakMultiplier(14)).toBeGreaterThanOrEqual(calculateStreakMultiplier(7))
    expect(calculateStreakMultiplier(30)).toBeGreaterThanOrEqual(calculateStreakMultiplier(14))
  })
})

// ─── checkBadgeUnlocks ────────────────────────────────────────────────────────

describe('checkBadgeUnlocks', () => {
  it('unlocks "First Step" badge after 1 logged activity', () => {
    const activities = [makeActivity()]
    const badges = checkBadgeUnlocks(activities, [])
    expect(badges.some((b) => b.id === 'first_log')).toBe(true)
  })

  it('does not re-unlock an already held badge', () => {
    const existing: Badge[] = [{
      id: 'first_log',
      name: 'First Step',
      icon: '🌱',
      description: 'Logged your first activity',
      unlockedAt: new Date().toISOString(),
    }]
    const activities = [makeActivity()]
    const newBadges = checkBadgeUnlocks(activities, existing)
    expect(newBadges.some((b) => b.id === 'first_log')).toBe(false)
  })

  it('unlocks "Plant Power" badge after 5 vegan meals', () => {
    const activities = Array.from({ length: 5 }, () =>
      makeActivity({ subtype: 'vegan_meal' })
    )
    const badges = checkBadgeUnlocks(activities, [])
    expect(badges.some((b) => b.id === 'vegan_streak')).toBe(true)
  })

  it('does not unlock "Plant Power" with only 4 vegan meals', () => {
    const activities = Array.from({ length: 4 }, () =>
      makeActivity({ subtype: 'vegan_meal' })
    )
    const badges = checkBadgeUnlocks(activities, [])
    expect(badges.some((b) => b.id === 'vegan_streak')).toBe(false)
  })

  it('unlocks "Centurion" badge after 100 logged activities', () => {
    const activities = Array.from({ length: 100 }, () => makeActivity())
    const badges = checkBadgeUnlocks(activities, [])
    expect(badges.some((b) => b.id === 'centurion')).toBe(true)
  })

  it('returns an empty array when no new badges are earned', () => {
    const badges = checkBadgeUnlocks([], [])
    expect(badges).toHaveLength(0)
  })

  it('all returned badges have required fields', () => {
    const activities = [makeActivity()]
    const badges = checkBadgeUnlocks(activities, [])
    for (const badge of badges) {
      expect(badge).toHaveProperty('id')
      expect(badge).toHaveProperty('name')
      expect(badge).toHaveProperty('icon')
      expect(badge).toHaveProperty('unlockedAt')
    }
  })
})

// ─── getStreakStatus ──────────────────────────────────────────────────────────

describe('getStreakStatus', () => {
  it('streak is alive when last activity was recent', () => {
    const recent = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hrs ago
    const status = getStreakStatus(5, recent)
    expect(status.isAlive).toBe(true)
    expect(status.current).toBe(5)
  })

  it('streak is dead when last activity was more than 48 hours ago', () => {
    const old = new Date(Date.now() - 50 * 60 * 60 * 1000).toISOString() // 50 hrs ago
    const status = getStreakStatus(10, old)
    expect(status.isAlive).toBe(false)
    expect(status.current).toBe(0)
  })

  it('hoursRemaining is 0 when streak is expired', () => {
    const old = new Date(Date.now() - 50 * 60 * 60 * 1000).toISOString()
    const status = getStreakStatus(10, old)
    expect(status.hoursRemaining).toBe(0)
  })

  it('hoursRemaining is greater than 0 when streak is fresh', () => {
    const recent = new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() // 1 hr ago
    const status = getStreakStatus(3, recent)
    expect(status.hoursRemaining).toBeGreaterThan(0)
  })
})
