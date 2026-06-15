import {
  EMISSION_FACTORS,
  BASELINE_BY_DIET,
  COMMUTE_WEEKLY,
  RELATABLE_COMPARISONS,
} from '@/data/emission-factors'
import type {
  QuizAnswers,
  WeeklyFootprint,
  ActivityLog,
  WorldState,
  ChallengeProgress,
  ActivityCategory,
  CarbonMood,
  FootprintCategory,
  CarbonBoss,
  DailyQuest,
  GameState
} from '@/types'

// ── Named constants (no magic numbers) ───────────────────────────────────────
const WORLD_SCORE_BASE = 1_000
const WORLD_SCORE_MAX = 1_000
const POLLUTION_WEIGHT = 700
const GREEN_WEIGHT = 300
const RECENT_ACTIVITY_WINDOW = 50
const BASELINE_POLLUTION_MULTIPLIER = 2
const ECO_SCORE_MAX = 1_000
const CHALLENGE_BONUS_PER_COMPLETION = 100
const STREAK_BONUS_PER_DAY = 5
const GOOD_ACTION_HEALTH_DELTA = 4
const BAD_ACTION_HEALTH_DELTA = -4
const GOOD_ACTION_XP = 25
const BAD_ACTION_XP = 5
const BASE_BOSS_DAMAGE = 20
const CRITICAL_HIT_MULTIPLIER = 2
const HEAVY_CO2_THRESHOLD = 3
const HEAVY_MOOD_THRESHOLD = 8

export const MOCK_BOSSES: CarbonBoss[] = [
  { id: 'b1', name: 'The Fast-Food Behemoth', description: 'A massive blob of single-use wrappers and processed meat. Weak to plant-based choices!', health: 500, maxHealth: 500, weaknessCategory: 'food', rewardAsset: 'flower_garden' },
  { id: 'b2', name: 'The Smog Serpent', description: 'A flying dragon made of exhaust fumes. Defeat it by taking eco-friendly transit!', health: 800, maxHealth: 800, weaknessCategory: 'transport', rewardAsset: 'wind_turbine' },
  { id: 'b3', name: 'The Energy Vampire', description: 'Drains your grid power. Defeat it by saving electricity!', health: 600, maxHealth: 600, weaknessCategory: 'energy', rewardAsset: 'solar_panel' }
]

export const MOCK_QUESTS: DailyQuest[] = [
  { id: 'q1', title: 'Choose a plant-based meal today', rewardXp: 50, rewardHealth: 4, completed: false, targetCategory: 'food', targetActionType: 'positive' },
  { id: 'q2', title: 'Take public transit or cycle', rewardXp: 40, rewardHealth: 3, completed: false, targetCategory: 'transport', targetActionType: 'positive' },
  { id: 'q3', title: 'Log a recycling action', rewardXp: 30, rewardHealth: 2, completed: false, targetCategory: 'waste', targetActionType: 'positive' },
]

/**
 * Calculates the user's baseline weekly carbon footprint from their onboarding quiz answers.
 *
 * @param answers - The completed quiz answers from onboarding
 * @returns A WeeklyFootprint object with total kg CO₂e and a per-category breakdown
 */
export function calculateBaselineFootprint(answers: QuizAnswers): WeeklyFootprint {
  const food = BASELINE_BY_DIET[answers.diet] ?? 45
  const transport = COMMUTE_WEEKLY[answers.commute] ?? 29.4

  const energyMultiplier = { low: 0.7, medium: 1.0, high: 1.5 }[answers.energyUsage] ?? 1
  const energyBase = 12 * energyMultiplier * (answers.hasRenewable ? 0.5 : 1)

  const shoppingMultiplier = { rarely: 0.5, monthly: 1, weekly: 2, daily: 3.5 }[answers.shoppingFreq] ?? 1
  const shopping = 10 * shoppingMultiplier

  const travelMultiplier = { none: 0, domestic: 1, international: 3 }[answers.travelFreq] ?? 0
  const travel = 15 * travelMultiplier

  // Waste offset based on self-reported habits
  const wasteOffset = answers.wasteHabits.includes('recycling') ? -1.5 : 0
  const compostOffset = answers.wasteHabits.includes('composting') ? -0.8 : 0
  const waste = Math.max(0, 3 + wasteOffset + compostOffset)

  return {
    total: food + transport + energyBase + shopping + travel + waste,
    byCategory: {
      food,
      transport,
      energy: energyBase,
      shopping,
      waste,
      travel,
    },
  }
}

/**
 * Calculates the CO₂e impact in kg for a single logged activity.
 *
 * @param activityType - The high-level category (e.g. 'food', 'transport')
 * @param subtype - The specific activity subtype (e.g. 'vegan_meal', 'car_petrol_km')
 * @param quantity - The amount (e.g. number of km, meals, or kg). Defaults to 1.
 * @returns The CO₂e impact in kg, rounded to 2 decimal places. Positive = emissions, negative = savings.
 */
export function calculateActivityImpact(
  activityType: ActivityCategory,
  subtype: string,
  quantity = 1
): number {
  const categoryFactors = (EMISSION_FACTORS as Record<string, Record<string, number>>)[activityType]
  const factor = categoryFactors?.[subtype] ?? 0
  return Math.round(factor * quantity * 100) / 100
}

/**
 * Classifies a weekly footprint total into a human-readable category.
 *
 * @param kgCO2ePerWeek - Total weekly footprint in kg CO₂e
 * @returns 'low' (<30), 'moderate' (30–60), or 'high' (≥60)
 */
export function getFootprintCategory(kgCO2ePerWeek: number): FootprintCategory {
  if (kgCO2ePerWeek < 30) return 'low'
  if (kgCO2ePerWeek < 60) return 'moderate'
  return 'high'
}

/**
 * Returns a relatable real-world comparison string for a given CO₂e amount.
 * For example, "equivalent to driving 42 km in a petrol car".
 *
 * @param kgCO2e - The CO₂e amount (can be negative for savings)
 * @returns A human-readable comparison string
 */
export function getRelatableComparison(kgCO2e: number): string {
  const absKg = Math.abs(kgCO2e)
  const match = [...RELATABLE_COMPARISONS]
    .reverse()
    .find((c) => absKg >= c.threshold)
  return match ? match.text(absKg) : `= ${absKg.toFixed(2)} kg CO₂e`
}

/**
 * Derives the living world's visual state from the user's recent activity history.
 * Controls sky pollution, tree growth, river clarity, smoke, and garden bloom.
 *
 * @param activities - Full list of the user's logged activities (uses the most recent 50)
 * @param baseline - The user's baseline weekly footprint in kg CO₂e, used to normalize pollution
 * @returns A WorldState object with all visual parameters between 0 and 1
 */
export function calculateWorldState(activities: ActivityLog[], baseline: number): WorldState {
  const recentActivities = activities.slice(0, RECENT_ACTIVITY_WINDOW)

  const totalImpact = recentActivities.reduce((sum, a) => sum + a.co2eImpact, 0)
  const positiveActions = recentActivities.filter((a) => a.co2eImpact <= 0).length
  const negativeActions = recentActivities.filter((a) => a.co2eImpact > 2).length

  // 0 = best, 1 = worst
  const pollutionRatio = Math.min(1, Math.max(0, totalImpact / (baseline * 2)))
  const greenRatio = positiveActions / Math.max(1, recentActivities.length)

  const hasVegetarianFood = recentActivities.some(
    (a) => a.type === 'food' && ['vegan_meal', 'vegetarian_meal'].includes(a.subtype)
  )
  const hasEnergySaving = recentActivities.some(
    (a) => a.type === 'energy' && a.co2eImpact <= 0
  )
  const hasRecycling = recentActivities.some(
    (a) => a.type === 'waste' && a.co2eImpact < 0
  )

  const overallScore = Math.max(0, Math.min(WORLD_SCORE_MAX, WORLD_SCORE_BASE - pollutionRatio * POLLUTION_WEIGHT + greenRatio * GREEN_WEIGHT))

  return {
    skyPollution: pollutionRatio,
    treeStage: Math.round(greenRatio * 5),
    riverClarity: 1 - pollutionRatio * 0.8,
    smokeLevel: Math.min(1, negativeActions / 10),
    gardenGrowth: hasVegetarianFood ? Math.min(1, positiveActions / 5) : 0,
  }
}

/**
 * Calculates the user's overall eco-score combining activity points, streak bonus, and challenge completions.
 *
 * @param activities - All logged activities
 * @param streak - Current daily streak count
 * @param challenges - List of challenge progress records
 * @returns An eco-score clamped between 0 and 1000
 */
export function calculateEcoScore(
  activities: ActivityLog[],
  streak: number,
  challenges: ChallengeProgress[]
): number {
  const activityPoints = activities.reduce((sum, a) => sum + a.ecoPoints, 0)
  const streakBonus = streak * STREAK_BONUS_PER_DAY
  const challengeBonus = challenges.filter((c) => c.completedAt).length * CHALLENGE_BONUS_PER_COMPLETION
  return Math.max(0, Math.min(ECO_SCORE_MAX, activityPoints + streakBonus + challengeBonus))
}

/**
 * Determines the user's carbon mood for today based on their logged activities.
 *
 * @param todaysActivities - All activities logged today
 * @returns 'green' (doing well), 'balanced' (neutral or no logs), or 'heavy' (high emissions day)
 */
export function calculateCarbonMoodScore(todaysActivities: ActivityLog[]): CarbonMood {
  if (todaysActivities.length === 0) return 'balanced'

  const totalCO2 = todaysActivities.reduce((sum, a) => sum + a.co2eImpact, 0)
  const heavyCount = todaysActivities.filter((a) => a.co2eImpact > HEAVY_CO2_THRESHOLD).length
  const greenCount = todaysActivities.filter((a) => a.co2eImpact <= 0).length

  if (totalCO2 < 2 && greenCount > heavyCount) return 'green'
  if (totalCO2 > HEAVY_MOOD_THRESHOLD || heavyCount >= 2) return 'heavy'
  return 'balanced'
}

/**
 * Calculates all game state changes resulting from a single logged activity.
 * Handles world health, XP, boss damage, quest completions, and asset unlocks.
 *
 * @param activityType - The category of the logged activity
 * @param subtype - The specific activity subtype
 * @param quantity - How many units were logged
 * @param state - The current GameState before this activity
 * @returns Delta values and the full updated GameState
 */
export function calculateGameImpact(activityType: ActivityCategory, subtype: string, quantity: number, state: GameState) {
  let healthDelta = 0
  let xpDelta = 10 * quantity
  let bossDamage = 0

  const goodActions = ['vegan_meal', 'vegetarian_meal', 'cycling_km', 'metro_km', 'secondhand_item', 'recycled_kg', 'composted_kg']
  const badActions = ['beef_meal', 'car_petrol_km', 'flight_domestic_km', 'electricity_kwh', 'ac_hour', 'fast_fashion_item', 'landfill_kg']

  const isGood = goodActions.includes(subtype)
  const isBad = badActions.includes(subtype)

  if (isGood) {
    healthDelta = GOOD_ACTION_HEALTH_DELTA * quantity
    xpDelta = GOOD_ACTION_XP * quantity
    bossDamage = BASE_BOSS_DAMAGE * quantity
  } else if (isBad) {
    healthDelta = BAD_ACTION_HEALTH_DELTA * quantity
    xpDelta = BAD_ACTION_XP * quantity
  }

  // Boss Logic
  let activeBoss = state.activeBoss
  let bossHealth = state.bossHealth
  let bossMaxHealth = state.bossMaxHealth

  // Initialize a boss if none exists
  if (!activeBoss) {
    const newBoss = MOCK_BOSSES[Math.floor(Math.random() * MOCK_BOSSES.length)]
    activeBoss = newBoss.id
    bossHealth = newBoss.maxHealth
    bossMaxHealth = newBoss.maxHealth
  }

  const bossDef = MOCK_BOSSES.find(b => b.id === activeBoss)
  let unlockedAssets = [...(state.unlockedAssets || [])]
  
  if (bossDef && isGood) {
    if (activityType === bossDef.weaknessCategory) {
      bossDamage *= CRITICAL_HIT_MULTIPLIER
    }
    if (bossHealth !== undefined && bossHealth > 0) {
      bossHealth = Math.max(0, bossHealth - bossDamage)
      if (bossHealth === 0 && !unlockedAssets.includes(bossDef.rewardAsset)) {
        unlockedAssets.push(bossDef.rewardAsset)
      }
    }
  }

  // Quests Logic
  let activeQuests = state.activeQuests || MOCK_QUESTS.map(q => ({ ...q }))
  if (isGood) {
    activeQuests = activeQuests.map(quest => {
      if (!quest.completed && quest.targetCategory === activityType) {
        xpDelta += quest.rewardXp
        healthDelta += quest.rewardHealth
        return { ...quest, completed: true }
      }
      return quest
    })
  }

  const newHealth = Math.max(0, Math.min(100, state.worldHealth + healthDelta))
  
  return { 
    healthDelta, 
    newHealth, 
    xpDelta, 
    bossDamage,
    newState: {
      ...state,
      worldHealth: newHealth,
      xp: state.xp + xpDelta,
      activeBoss,
      bossHealth,
      bossMaxHealth,
      activeQuests,
      unlockedAssets
    }
  }
}
