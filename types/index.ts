import { User } from 'firebase/auth'

export type FirebaseUser = User

export interface UserProfile {
  uid: string
  displayName: string
  email: string
  photoURL: string | null
  createdAt: string
  onboardingComplete: boolean
  teamId?: string | null
  baselineFootprint?: WeeklyFootprint
  quizAnswers?: QuizAnswers
}

export interface QuizAnswers {
  diet: 'vegan' | 'vegetarian' | 'pescatarian' | 'omnivore' | 'meat_heavy'
  commute: 'walking' | 'cycling' | 'public_transit' | 'car' | 'motorcycle'
  energyUsage: 'low' | 'medium' | 'high'
  hasRenewable: boolean
  shoppingFreq: 'rarely' | 'monthly' | 'weekly' | 'daily'
  travelFreq: 'none' | 'domestic' | 'international'
  wasteHabits: string[]
}

export interface WeeklyFootprint {
  total: number
  byCategory: {
    food: number
    transport: number
    energy: number
    shopping: number
    waste: number
    travel: number
  }
}

export interface ActivityLog {
  id: string
  userId: string
  type: ActivityCategory
  subtype: string
  co2eImpact: number
  ecoPoints: number
  timestamp: string
  notes?: string
}

export type ActivityCategory = 'food' | 'transport' | 'energy' | 'shopping' | 'waste' | 'travel'

export interface WorldState {
  skyPollution: number      // 0 (clean) to 1 (polluted)
  treeStage: number         // 0 (stump) to 5 (full canopy)
  riverClarity: number      // 0 (polluted) to 1 (crystal clear)
  smokeLevel: number        // 0 (none) to 1 (heavy)
  gardenGrowth: number      // 0 to 1
}

export interface GameState {
  worldHealth: number       // 0 to 100
  xp: number
  level: number
  streak: number
  carbonTrend: 'decreasing' | 'increasing' | 'stable'
  unlockedAssets: string[]
  activeBoss: string | null
  bossHealth?: number
  bossMaxHealth?: number
  activeQuests?: DailyQuest[]
}

export interface CarbonBoss {
  id: string
  name: string
  description: string
  health: number
  maxHealth: number
  weaknessCategory: ActivityCategory
  rewardAsset: string
}

export interface DailyQuest {
  id: string
  title: string
  rewardXp: number
  rewardHealth: number
  completed: boolean
  targetCategory: ActivityCategory
  targetActionType: 'positive' | 'negative'
}

export interface Badge {
  id: string
  name: string
  icon: string
  description: string
  unlockedAt?: string
}

export interface ChallengeProgress {
  challengeId: string
  startedAt: string
  completedAt?: string
  progress: number
  isActive: boolean
}

export interface TeamData {
  id: string
  name: string
  members: string[]
  worldState: WorldState
  weeklyCarbon: number
  leaderboard: LeaderboardEntry[]
}

export interface LeaderboardEntry {
  userId: string
  displayName: string
  photoURL: string | null
  carbonSaved: number
  ecoScore: number
  streak: number
  badges: Badge[]
  rank: number
  rankDelta: number
}

export interface NudgeMessage {
  text: string
  icon: string
  type: 'positive' | 'warning' | 'info'
}

export type CarbonMood = 'green' | 'balanced' | 'heavy'
export type FootprintCategory = 'low' | 'moderate' | 'high'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface StreakStatus {
  current: number
  isAlive: boolean
  hoursRemaining: number
}

export interface EcoChallenge {
  id: string
  name: string
  description: string
  icon: string
  durationDays: number
  rewardPoints: number
  difficulty: 'easy' | 'medium' | 'hard'
  category: ActivityCategory
  targetActions: string[]
}

export interface DailyMission {
  id: string
  title: string
  description: string
  icon: string
  points: number
  category: ActivityCategory
  targetSubtype: string
  completed: boolean
}

export interface SimulatorScenario {
  vegetarianMealsPerWeek: number
  transitDaysPerWeek: number
  acReductionHours: number
}
