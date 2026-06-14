import type { ActivityLog, Badge, StreakStatus } from '@/types'

export const POINTS = {
  eco_positive_action: 15,
  carbon_heavy_action: -10,
  challenge_complete: 100,
  streak_day: 5,
  streak_week_bonus: 50,
  mission_complete: 25,
} as const

/** Higher streaks get multiplied points — rewards consistency */
export function calculateStreakMultiplier(streak: number): number {
  if (streak >= 30) return 2.0
  if (streak >= 14) return 1.5
  if (streak >= 7) return 1.25
  if (streak >= 3) return 1.1
  return 1.0
}

const BADGE_DEFINITIONS: Array<{
  id: string
  name: string
  icon: string
  description: string
  check: (activities: ActivityLog[]) => boolean
}> = [
  {
    id: 'first_log',
    name: 'First Step',
    icon: '🌱',
    description: 'Logged your first activity',
    check: (a) => a.length >= 1,
  },
  {
    id: 'green_week',
    name: 'Green Week',
    icon: '🌿',
    description: '7 days of positive eco actions',
    check: (a) => a.filter((x) => x.co2eImpact <= 0).length >= 7,
  },
  {
    id: 'vegan_streak',
    name: 'Plant Power',
    icon: '🥗',
    description: 'Logged 5 vegan meals',
    check: (a) => a.filter((x) => x.subtype === 'vegan_meal').length >= 5,
  },
  {
    id: 'cyclist',
    name: 'City Cyclist',
    icon: '🚴',
    description: 'Cycled 10 times',
    check: (a) => a.filter((x) => x.subtype === 'cycling').length >= 10,
  },
  {
    id: 'recycler',
    name: 'Recycling Hero',
    icon: '♻️',
    description: 'Recycled or composted 10 times',
    check: (a) =>
      a.filter((x) => x.type === 'waste' && x.co2eImpact < 0).length >= 10,
  },
  {
    id: 'transit_champion',
    name: 'Transit Champion',
    icon: '🚌',
    description: 'Used public transit 15 times',
    check: (a) =>
      a.filter((x) => ['metro', 'bus', 'train'].includes(x.subtype)).length >= 15,
  },
  {
    id: 'carbon_saver',
    name: 'Carbon Saver',
    icon: '🌍',
    description: 'Saved 50 kg of CO₂e total',
    check: (a) =>
      a.filter((x) => x.co2eImpact < 0).reduce((s, x) => s + Math.abs(x.co2eImpact), 0) >= 50,
  },
  {
    id: 'zero_waste',
    name: 'Zero Waste Hero',
    icon: '🎯',
    description: 'Logged 3 no-buy days',
    check: (a) => a.filter((x) => x.subtype === 'no_buy').length >= 3,
  },
  {
    id: 'solar_warrior',
    name: 'Solar Warrior',
    icon: '☀️',
    description: 'Used solar energy 5 times',
    check: (a) => a.filter((x) => x.subtype === 'solar_usage').length >= 5,
  },
  {
    id: 'centurion',
    name: 'Centurion',
    icon: '💯',
    description: 'Logged 100 activities',
    check: (a) => a.length >= 100,
  },
]

/** Check for newly unlocked badges given the full activity history */
export function checkBadgeUnlocks(activities: ActivityLog[], currentBadges: Badge[]): Badge[] {
  const currentIds = new Set(currentBadges.map((b) => b.id))
  const newBadges: Badge[] = []

  for (const def of BADGE_DEFINITIONS) {
    if (!currentIds.has(def.id) && def.check(activities)) {
      newBadges.push({
        id: def.id,
        name: def.name,
        icon: def.icon,
        description: def.description,
        unlockedAt: new Date().toISOString(),
      })
    }
  }

  return newBadges
}

/** Get current streak status including deadline pressure */
export function getStreakStatus(streak: number, lastActiveDate: string): StreakStatus {
  const last = new Date(lastActiveDate)
  const now = new Date()
  const hoursElapsed = (now.getTime() - last.getTime()) / (1000 * 60 * 60)
  const hoursRemaining = Math.max(0, 24 - hoursElapsed)
  const isAlive = hoursElapsed < 48

  return {
    current: isAlive ? streak : 0,
    isAlive,
    hoursRemaining,
  }
}
