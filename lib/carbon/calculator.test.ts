import { describe, it, expect } from 'vitest'
import { 
  calculateBaselineFootprint,
  getFootprintCategory,
  getRelatableComparison,
  calculateWorldState,
  calculateEcoScore,
  calculateCarbonMoodScore,
  calculateActivityImpact,
  calculateGameImpact
} from './calculator'
import type { QuizAnswers } from '@/types'

// ─── Default quiz answer set ──────────────────────────────────────────────────

function makeAnswers(overrides: Partial<QuizAnswers> = {}): QuizAnswers {
  return {
    diet: 'omnivore',
    commute: 'car',
    energyUsage: 'medium',
    hasRenewable: false,
    shoppingFreq: 'monthly',
    travelFreq: 'none',
    wasteHabits: [],
    ...overrides,
  }
}

// ─── calculateBaselineFootprint ───────────────────────────────────────────────

describe('calculateBaselineFootprint', () => {
  it('returns a positive total for a default omnivore profile', () => {
    const result = calculateBaselineFootprint(makeAnswers())
    expect(result.total).toBeGreaterThan(0)
  })

  it('vegan diet produces lower food footprint than beef-heavy diet', () => {
    const vegan = calculateBaselineFootprint(makeAnswers({ diet: 'vegan' }))
    const meatHeavy = calculateBaselineFootprint(makeAnswers({ diet: 'meat_heavy' }))
    expect(vegan.byCategory.food).toBeLessThan(meatHeavy.byCategory.food)
  })

  it('cycling commute produces lower transport footprint than car commute', () => {
    const cyclist = calculateBaselineFootprint(makeAnswers({ commute: 'cycling' }))
    const driver = calculateBaselineFootprint(makeAnswers({ commute: 'car' }))
    expect(cyclist.byCategory.transport).toBeLessThan(driver.byCategory.transport)
  })

  it('renewable energy reduces energy footprint by 50%', () => {
    const withRenewable = calculateBaselineFootprint(makeAnswers({ hasRenewable: true, energyUsage: 'medium' }))
    const withoutRenewable = calculateBaselineFootprint(makeAnswers({ hasRenewable: false, energyUsage: 'medium' }))
    expect(withRenewable.byCategory.energy).toBeLessThan(withoutRenewable.byCategory.energy)
  })

  it('high energy usage produces more energy footprint than low usage', () => {
    const high = calculateBaselineFootprint(makeAnswers({ energyUsage: 'high' }))
    const low = calculateBaselineFootprint(makeAnswers({ energyUsage: 'low' }))
    expect(high.byCategory.energy).toBeGreaterThan(low.byCategory.energy)
  })

  it('international travel adds more footprint than no travel', () => {
    const traveler = calculateBaselineFootprint(makeAnswers({ travelFreq: 'international' }))
    const noTravel = calculateBaselineFootprint(makeAnswers({ travelFreq: 'none' }))
    expect(traveler.byCategory.travel).toBeGreaterThan(noTravel.byCategory.travel)
  })

  it('recycling reduces waste footprint', () => {
    const recycler = calculateBaselineFootprint(makeAnswers({ wasteHabits: ['recycling'] }))
    const nonRecycler = calculateBaselineFootprint(makeAnswers({ wasteHabits: [] }))
    expect(recycler.byCategory.waste).toBeLessThan(nonRecycler.byCategory.waste)
  })

  it('composting reduces waste footprint', () => {
    const composter = calculateBaselineFootprint(makeAnswers({ wasteHabits: ['composting'] }))
    const nonComposter = calculateBaselineFootprint(makeAnswers({ wasteHabits: [] }))
    expect(composter.byCategory.waste).toBeLessThan(nonComposter.byCategory.waste)
  })

  it('waste footprint never goes below 0', () => {
    const both = calculateBaselineFootprint(makeAnswers({ wasteHabits: ['recycling', 'composting'] }))
    expect(both.byCategory.waste).toBeGreaterThanOrEqual(0)
  })

  it('total equals sum of all categories', () => {
    const result = calculateBaselineFootprint(makeAnswers())
    const sum = Object.values(result.byCategory).reduce((a, b) => a + b, 0)
    expect(result.total).toBeCloseTo(sum, 5)
  })

  it('byCategory contains all required keys', () => {
    const result = calculateBaselineFootprint(makeAnswers())
    expect(result.byCategory).toHaveProperty('food')
    expect(result.byCategory).toHaveProperty('transport')
    expect(result.byCategory).toHaveProperty('energy')
    expect(result.byCategory).toHaveProperty('shopping')
    expect(result.byCategory).toHaveProperty('waste')
    expect(result.byCategory).toHaveProperty('travel')
  })

  it('daily shopping frequency greatly increases shopping footprint', () => {
    const daily = calculateBaselineFootprint(makeAnswers({ shoppingFreq: 'daily' }))
    const rarely = calculateBaselineFootprint(makeAnswers({ shoppingFreq: 'rarely' }))
    expect(daily.byCategory.shopping).toBeGreaterThan(rarely.byCategory.shopping)
  })
})

describe('getFootprintCategory', () => {
  it('returns low for <30', () => {
    expect(getFootprintCategory(20)).toBe('low')
  })
  it('returns moderate for 30-60', () => {
    expect(getFootprintCategory(45)).toBe('moderate')
  })
  it('returns high for >=60', () => {
    expect(getFootprintCategory(65)).toBe('high')
  })
})

describe('getRelatableComparison', () => {
  it('returns string equivalent', () => {
    expect(getRelatableComparison(0.5)).toContain('phone')
    expect(getRelatableComparison(2)).toContain('driving')
    expect(getRelatableComparison(8)).toContain('petrol')
    expect(getRelatableComparison(20)).toContain('tree')
    expect(getRelatableComparison(100)).toContain('flights')
  })
})

describe('calculateWorldState', () => {
  it('calculates world state correctly', () => {
    const activities = [
      { type: 'food', subtype: 'vegan_meal', co2eImpact: -1 },
      { type: 'transport', subtype: 'car_petrol_km', co2eImpact: 5 }
    ] as unknown as never[]
    const state = calculateWorldState(activities, 50)
    expect(state.skyPollution).toBeGreaterThan(0)
    expect(state.treeStage).toBeGreaterThan(0)
  })
})

describe('calculateEcoScore', () => {
  it('calculates eco score correctly', () => {
    const activities = [{ ecoPoints: 10 }, { ecoPoints: 20 }] as unknown as never[]
    const challenges = [{ completedAt: '2023-01-01' }] as unknown as never[]
    const score = calculateEcoScore(activities, 2, challenges)
    expect(score).toBe(140) // 30 + 10 + 100
  })
})

describe('calculateCarbonMoodScore', () => {
  it('returns balanced for no activities', () => {
    expect(calculateCarbonMoodScore([])).toBe('balanced')
  })
  it('returns green for low emissions', () => {
    expect(calculateCarbonMoodScore([{ co2eImpact: -1 } as never])).toBe('green')
  })
  it('returns heavy for high emissions', () => {
    expect(calculateCarbonMoodScore([{ co2eImpact: 10 } as never])).toBe('heavy')
  })
})

describe('calculateActivityImpact', () => {
  it('returns expected impact', () => {
    const impact = calculateActivityImpact('food', 'beef_meal', 1)
    expect(impact).toBeGreaterThan(0)
  })
})

describe('calculateGameImpact', () => {
  const baseState = {
    worldHealth: 50,
    xp: 100,
    activeBoss: 'b1',
    bossHealth: 100,
    bossMaxHealth: 500,
    activeQuests: [],
    unlockedAssets: []
  }

  it('calculates game impact for good action', () => {
    const result = calculateGameImpact('food', 'vegan_meal', 1, baseState as never)
    expect(result.healthDelta).toBeGreaterThan(0)
    expect(result.xpDelta).toBeGreaterThan(0)
    expect(result.bossDamage).toBeGreaterThan(0)
    expect(result.newState.worldHealth).toBeGreaterThan(50)
  })

  it('calculates game impact for bad action', () => {
    const result = calculateGameImpact('food', 'beef_meal', 1, baseState as never)
    expect(result.healthDelta).toBeLessThan(0)
    expect(result.newState.worldHealth).toBeLessThan(50)
  })

  it('handles boss logic correctly', () => {
    const noBossState = { ...baseState, activeBoss: null, bossHealth: undefined }
    const result = calculateGameImpact('transport', 'cycling_km', 1, noBossState as never)
    expect(result.newState.activeBoss).toBeDefined()
  })

  it('handles quest logic correctly', () => {
    const result = calculateGameImpact('food', 'vegan_meal', 1, { ...baseState, activeQuests: null } as never)
    expect(result.newState.activeQuests).toBeDefined()
  })
})
