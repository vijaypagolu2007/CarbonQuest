import {
  doc,
  setDoc,
  getDoc,
  addDoc,
  collection,
  query,
  orderBy,
  limit as firestoreLimit,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './config'
import type { UserProfile, ActivityLog, WorldState, ChallengeProgress, ChatMessage, QuizAnswers, WeeklyFootprint } from '@/types'

export async function saveUserProfile(userId: string, profile: Partial<UserProfile>): Promise<void> {
  await setDoc(doc(db, 'users', userId), profile, { merge: true })
}

export async function saveQuizAnswers(
  userId: string,
  answers: QuizAnswers,
  footprint: WeeklyFootprint
): Promise<void> {
  await setDoc(
    doc(db, 'users', userId),
    {
      quizAnswers: answers,
      baselineFootprint: footprint,
      onboardingComplete: true,
      quizCompletedAt: new Date().toISOString(),
    },
    { merge: true }
  )
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', userId))
  return snap.exists() ? (snap.data() as UserProfile) : null
}

export async function logActivity(userId: string, activity: Omit<ActivityLog, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'users', userId, 'activities'), {
    ...activity,
    timestamp: serverTimestamp(),
  })

  // Damage the boss if active
  const gameState = await getGameState(userId)
  if (gameState && gameState.activeBoss && gameState.bossHealth !== undefined) {
    const damage = activity.ecoPoints || 10
    const newHealth = Math.max(0, gameState.bossHealth - damage)
    
    // If defeated
    if (newHealth === 0) {
      await updateGameState(userId, {
        activeBoss: null,
        bossHealth: 0,
        unlockedAssets: [...(gameState.unlockedAssets || []), 'ancient_tree_seed']
      })
    } else {
      await updateGameState(userId, {
        bossHealth: newHealth
      })
    }
  }

  return ref.id
}

export async function spawnWeeklyBoss(userId: string): Promise<void> {
  const gameState = await getGameState(userId)
  const currentLevel = gameState?.level || 1
  const maxHealth = 500 * currentLevel
  
  await setDoc(doc(db, 'users', userId), {
    gameState: {
      activeBoss: 'The Smog Titan',
      bossHealth: maxHealth,
      bossMaxHealth: maxHealth,
    }
  }, { merge: true })
}

export async function getActivities(userId: string, limitCount = 50): Promise<ActivityLog[]> {
  const q = query(
    collection(db, 'users', userId, 'activities'),
    orderBy('timestamp', 'desc'),
    firestoreLimit(limitCount)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ActivityLog))
}

export async function getWorldState(userId: string): Promise<WorldState | null> {
  const snap = await getDoc(doc(db, 'users', userId))
  return snap.exists() && snap.data().worldState ? (snap.data().worldState as WorldState) : null
}

export async function updateWorldState(userId: string, worldState: WorldState): Promise<void> {
  await setDoc(doc(db, 'users', userId), { worldState }, { merge: true })
}

export async function getGameState(userId: string): Promise<import('@/types').GameState | null> {
  const snap = await getDoc(doc(db, 'users', userId))
  return snap.exists() ? (snap.data().gameState as import('@/types').GameState) || null : null
}

export async function updateGameState(userId: string, gameState: Partial<import('@/types').GameState>): Promise<void> {
  await setDoc(doc(db, 'users', userId), { gameState }, { merge: true })
}

export async function saveChallenge(userId: string, challenge: ChallengeProgress): Promise<void> {
  await setDoc(
    doc(db, 'users', userId, 'challenges', challenge.challengeId),
    challenge,
    { merge: true }
  )
}

export async function getChallenges(userId: string): Promise<ChallengeProgress[]> {
  const snap = await getDocs(collection(db, 'users', userId, 'challenges'))
  return snap.docs.map((d) => d.data() as ChallengeProgress)
}

export async function getLeaderboard(teamId: string): Promise<unknown[]> {
  const q = query(
    collection(db, 'teams', teamId, 'members'),
    orderBy('ecoScore', 'desc'),
    firestoreLimit(20)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function saveChatMessage(userId: string, message: Omit<ChatMessage, 'id'>): Promise<void> {
  await addDoc(collection(db, 'users', userId, 'chatHistory'), {
    ...message,
    timestamp: serverTimestamp(),
  })
}

export async function getChatHistory(userId: string): Promise<ChatMessage[]> {
  const q = query(
    collection(db, 'users', userId, 'chatHistory'),
    orderBy('timestamp', 'asc'),
    firestoreLimit(50)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ChatMessage))
}
