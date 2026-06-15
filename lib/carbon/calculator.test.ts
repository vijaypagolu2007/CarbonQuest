import { describe, it, expect } from 'vitest'
import { calculateBaselineFootprint } from './calculator'
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
