import type { QuizAnswers } from '@/types'

export interface QuizOption {
  value: string
  label: string
  icon: string
  /** Weekly kg CO₂e contribution used for the live counter */
  co2ePerWeek: number
  description?: string
}

export interface QuizStep {
  id: keyof QuizAnswers | 'wasteHabits'
  title: string
  subtitle: string
  emoji: string
  type: 'single' | 'multi'
  options: QuizOption[]
}

export const QUIZ_STEPS: QuizStep[] = [
  {
    id: 'diet',
    title: 'What best describes your diet?',
    subtitle: 'Food is often the biggest slice of your footprint.',
    emoji: '🍽️',
    type: 'single',
    options: [
      { value: 'vegan', label: 'Vegan', icon: '🥦', co2ePerWeek: 14, description: 'No animal products' },
      { value: 'vegetarian', label: 'Vegetarian', icon: '🥗', co2ePerWeek: 21, description: 'No meat or fish' },
      { value: 'pescatarian', label: 'Pescatarian', icon: '🐟', co2ePerWeek: 28, description: 'Fish, no meat' },
      { value: 'omnivore', label: 'Omnivore', icon: '🍗', co2ePerWeek: 42, description: 'Eat everything' },
      { value: 'meat_heavy', label: 'Meat Heavy', icon: '🥩', co2ePerWeek: 63, description: 'Meat at most meals' },
    ],
  },
  {
    id: 'commute',
    title: 'How do you usually get around?',
    subtitle: 'Your daily commute adds up fast.',
    emoji: '🚌',
    type: 'single',
    options: [
      { value: 'walking', label: 'Walk / Cycle', icon: '🚶', co2ePerWeek: 0, description: 'Zero emissions' },
      { value: 'cycling', label: 'Cycling', icon: '🚴', co2ePerWeek: 0, description: 'Green commute' },
      { value: 'public_transit', label: 'Public Transit', icon: '🚇', co2ePerWeek: 7, description: 'Bus, metro, train' },
      { value: 'motorcycle', label: 'Motorcycle', icon: '🏍️', co2ePerWeek: 18, description: 'Motorbike or scooter' },
      { value: 'car', label: 'Car', icon: '🚗', co2ePerWeek: 29, description: 'Personal vehicle' },
    ],
  },
  {
    id: 'energyUsage',
    title: 'How much energy does your home use?',
    subtitle: 'AC, heating, appliances — it all counts.',
    emoji: '⚡',
    type: 'single',
    options: [
      { value: 'low', label: 'Low Usage', icon: '💡', co2ePerWeek: 8, description: 'Minimal appliances, rarely AC' },
      { value: 'medium', label: 'Average', icon: '🔌', co2ePerWeek: 12, description: 'Typical household use' },
      { value: 'high', label: 'High Usage', icon: '❄️', co2ePerWeek: 18, description: 'AC all day, many devices' },
    ],
  },
  {
    id: 'shoppingFreq',
    title: 'How often do you shop for new things?',
    subtitle: 'Fashion, gadgets, and goods have a hidden carbon cost.',
    emoji: '🛍️',
    type: 'single',
    options: [
      { value: 'rarely', label: 'Rarely', icon: '♻️', co2ePerWeek: 5, description: 'Secondhand or minimalist' },
      { value: 'monthly', label: 'Monthly', icon: '📦', co2ePerWeek: 10, description: 'Occasional shopping' },
      { value: 'weekly', label: 'Weekly', icon: '🛒', co2ePerWeek: 20, description: 'Regular buyer' },
      { value: 'daily', label: 'Daily', icon: '📱', co2ePerWeek: 35, description: 'Frequent online orders' },
    ],
  },
  {
    id: 'travelFreq',
    title: 'How often do you fly?',
    subtitle: 'A single long-haul flight can double your monthly footprint.',
    emoji: '✈️',
    type: 'single',
    options: [
      { value: 'none', label: 'Never / Rarely', icon: '🏠', co2ePerWeek: 0, description: 'No flights this year' },
      { value: 'domestic', label: '1–3 Flights', icon: '🛫', co2ePerWeek: 15, description: 'Short domestic trips' },
      { value: 'international', label: '4+ Flights', icon: '🌍', co2ePerWeek: 45, description: 'Frequent flyer' },
    ],
  },
  {
    id: 'wasteHabits',
    title: 'What eco habits do you already have?',
    subtitle: 'Every good habit reduces your footprint. (Select all that apply)',
    emoji: '🗑️',
    type: 'multi',
    options: [
      { value: 'recycling', label: 'I recycle regularly', icon: '♻️', co2ePerWeek: -1.5 },
      { value: 'composting', label: 'I compost food waste', icon: '🌱', co2ePerWeek: -0.8 },
      { value: 'reusable_bags', label: 'I use reusable bags', icon: '👜', co2ePerWeek: -0.3 },
      { value: 'reusable_bottle', label: 'I carry a reusable bottle', icon: '🍶', co2ePerWeek: -0.2 },
      { value: 'none', label: 'None of the above', icon: '🤷', co2ePerWeek: 0 },
    ],
  },
]

/** Default quiz answers for fast-lane / partial onboarding */
export const DEFAULT_QUIZ_ANSWERS: QuizAnswers = {
  diet: 'omnivore',
  commute: 'public_transit',
  energyUsage: 'medium',
  hasRenewable: false,
  shoppingFreq: 'monthly',
  travelFreq: 'none',
  wasteHabits: [],
}
