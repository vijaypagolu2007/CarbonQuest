import { describe, it, expect } from 'vitest'
import {
  calculateActivityImpact,
  getFootprintCategory,
  getRelatableComparison,
  calculateWorldState,
  calculateCarbonMoodScore,
  calculateGameImpact,
} from './calculator'
import type { ActivityLog, GameState } from '@/types'

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

function makeGameState(overrides: Partial<GameState> = {}): GameState {
  return {
    worldHealth: 50,
    xp: 0,
    level: 1,
    streak: 1,
    carbonTrend: 'stable',
    unlockedAssets: [],
    activeBoss: null,
    ...overrides,
  }
}

// ─── calculateActivityImpact ──────────────────────────────────────────────────

describe('calculateActivityImpact', () => {
  it('returns a positive value for a beef meal', () => {
    const impact = calculateActivityImpact('food', 'beef_meal', 1)
    expect(impact).toBeGreaterThan(0)
  })

  it('returns a negative or zero value for a vegan meal', () => {
    const impact = calculateActivityImpact('food', 'vegan_meal', 1)
    expect(impact).toBeLessThanOrEqual(0)
  })

  it('scales linearly with quantity', () => {
    const single = calculateActivityImpact('transport', 'car_petrol_km', 1)
    const double = calculateActivityImpact('transport', 'car_petrol_km', 2)
    expect(double).toBeCloseTo(single * 2, 1)
  })

  it('returns 0 for an unknown subtype', () => {
    const impact = calculateActivityImpact('food', 'unknown_subtype_xyz', 1)
    expect(impact).toBe(0)
  })

  it('rounds result to 2 decimal places', () => {
    const impact = calculateActivityImpact('transport', 'car_petrol_km', 3)
    const decimalPart = impact.toString().split('.')[1]
    expect((decimalPart ?? '').length).toBeLessThanOrEqual(2)
  })
})

// ─── getFootprintCategory ─────────────────────────────────────────────────────

describe('getFootprintCategory', () => {
  it('returns "low" for footprints below 30 kg/week', () => {
    expect(getFootprintCategory(0)).toBe('low')
    expect(getFootprintCategory(29.9)).toBe('low')
  })

  it('returns "moderate" for footprints between 30 and 60 kg/week', () => {
    expect(getFootprintCategory(30)).toBe('moderate')
    expect(getFootprintCategory(59.9)).toBe('moderate')
  })

  it('returns "high" for footprints at or above 60 kg/week', () => {
    expect(getFootprintCategory(60)).toBe('high')
    expect(getFootprintCategory(200)).toBe('high')
  })
})

// ─── getRelatableComparison ───────────────────────────────────────────────────

describe('getRelatableComparison', () => {
  it('returns a non-empty string for any CO2e value', () => {
    expect(getRelatableComparison(5)).toBeTruthy()
    expect(getRelatableComparison(0.1)).toBeTruthy()
    expect(getRelatableComparison(100)).toBeTruthy()
  })

  it('handles negative CO2e values (savings) correctly', () => {
    const result = getRelatableComparison(-5)
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('returns a fallback string for very small values', () => {
    const result = getRelatableComparison(0.001)
    expect(result).toContain('kg CO₂e')
  })
})

// ─── calculateWorldState ─────────────────────────────────────────────────────

describe('calculateWorldState', () => {
  it('returns higher sky pollution when activities are mostly bad', () => {
    const badActivities = Array.from({ length: 10 }, () =>
      makeActivity({ co2eImpact: 5, type: 'transport', subtype: 'car_petrol_km' })
    )
    const state = calculateWorldState(badActivities, 50)
    expect(state.skyPollution).toBeGreaterThan(0)
  })

  it('returns lower sky pollution when activities are eco-positive', () => {
    const goodActivities = Array.from({ length: 10 }, () =>
      makeActivity({ co2eImpact: -1, type: 'food', subtype: 'vegan_meal' })
    )
    const state = calculateWorldState(goodActivities, 50)
    expect(state.skyPollution).toBeLessThan(0.5)
  })

  it('sets gardenGrowth > 0 when vegan meals are logged', () => {
    const activities = Array.from({ length: 5 }, () =>
      makeActivity({ co2eImpact: -0.5, type: 'food', subtype: 'vegan_meal' })
    )
    const state = calculateWorldState(activities, 50)
    expect(state.gardenGrowth).toBeGreaterThan(0)
  })

  it('keeps all values in a valid 0-1 range', () => {
    const activities = Array.from({ length: 20 }, () =>
      makeActivity({ co2eImpact: 10 })
    )
    const state = calculateWorldState(activities, 50)
    expect(state.skyPollution).toBeGreaterThanOrEqual(0)
    expect(state.skyPollution).toBeLessThanOrEqual(1)
    expect(state.riverClarity).toBeGreaterThanOrEqual(0)
    expect(state.riverClarity).toBeLessThanOrEqual(1)
    expect(state.smokeLevel).toBeGreaterThanOrEqual(0)
    expect(state.smokeLevel).toBeLessThanOrEqual(1)
  })
})

// ─── calculateCarbonMoodScore ─────────────────────────────────────────────────

describe('calculateCarbonMoodScore', () => {
  it('returns "balanced" for an empty activity list', () => {
    expect(calculateCarbonMoodScore([])).toBe('balanced')
  })

  it('returns "green" when total CO2 is low and green actions dominate', () => {
    const activities = [
      makeActivity({ co2eImpact: -1 }),
      makeActivity({ co2eImpact: -0.5 }),
    ]
    expect(calculateCarbonMoodScore(activities)).toBe('green')
  })

  it('returns "heavy" when high CO2 actions are logged', () => {
    const activities = [
      makeActivity({ co2eImpact: 5 }),
      makeActivity({ co2eImpact: 6 }),
    ]
    expect(calculateCarbonMoodScore(activities)).toBe('heavy')
  })
})

// ─── calculateGameImpact ──────────────────────────────────────────────────────

describe('calculateGameImpact', () => {
  it('increases world health when logging a good action', () => {
    const state = makeGameState({ worldHealth: 50 })
    const result = calculateGameImpact('food', 'vegan_meal', 1, state)
    expect(result.newHealth).toBeGreaterThan(50)
  })

  it('decreases world health when logging a bad action', () => {
    const state = makeGameState({ worldHealth: 50 })
    const result = calculateGameImpact('food', 'beef_meal', 1, state)
    expect(result.newHealth).toBeLessThan(50)
  })

  it('awards more XP for good actions than bad ones', () => {
    const state = makeGameState()
    const goodResult = calculateGameImpact('food', 'vegan_meal', 1, state)
    const badResult = calculateGameImpact('food', 'beef_meal', 1, state)
    expect(goodResult.xpDelta).toBeGreaterThan(badResult.xpDelta)
  })

  it('deals boss damage only for good actions', () => {
    const state = makeGameState()
    const good = calculateGameImpact('food', 'vegan_meal', 1, state)
    const bad = calculateGameImpact('food', 'beef_meal', 1, state)
    expect(good.bossDamage).toBeGreaterThan(0)
    expect(bad.bossDamage).toBe(0)
  })

  it('world health never exceeds 100', () => {
    const state = makeGameState({ worldHealth: 99 })
    const result = calculateGameImpact('food', 'vegan_meal', 5, state)
    expect(result.newHealth).toBeLessThanOrEqual(100)
  })

  it('world health never drops below 0', () => {
    const state = makeGameState({ worldHealth: 1 })
    const result = calculateGameImpact('food', 'beef_meal', 10, state)
    expect(result.newHealth).toBeGreaterThanOrEqual(0)
  })

  it('initializes a boss if none exists', () => {
    const state = makeGameState({ activeBoss: null })
    const result = calculateGameImpact('food', 'vegan_meal', 1, state)
    expect(result.newState.activeBoss).not.toBeNull()
  })

  it('deals double boss damage when activity matches boss weakness', () => {
    // Set up a boss whose weakness is food
    const foodBossId = 'b1'
    const state = makeGameState({ activeBoss: foodBossId, bossHealth: 500, bossMaxHealth: 500 })
    const normalResult = calculateGameImpact('energy', 'solar_usage', 1, state)
    const critResult = calculateGameImpact('food', 'vegan_meal', 1, state)
    expect(critResult.bossDamage).toBeGreaterThan(normalResult.bossDamage)
  })
})
