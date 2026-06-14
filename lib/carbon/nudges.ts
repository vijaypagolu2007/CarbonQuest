import type { NudgeMessage } from '@/types'

interface NudgeRule {
  condition: (subtype: string, impact: number) => boolean
  message: NudgeMessage
}

const FOOD_NUDGES: NudgeRule[] = [
  {
    condition: (s) => s === 'beef_meal',
    message: {
      text: 'Beef uses 20x more land and water than plant foods. Try chicken or lentils next time! 🌱',
      icon: '🥩',
      type: 'warning',
    },
  },
  {
    condition: (s) => s === 'vegan_meal',
    message: {
      text: "Amazing! A vegan meal saves up to 6x the CO₂ of beef. Your planet thanks you! 🌍",
      icon: '🥗',
      type: 'positive',
    },
  },
  {
    condition: (s) => s === 'vegetarian_meal',
    message: {
      text: 'Great choice! Vegetarian meals cut food emissions by ~60% vs meat. Keep it up! 🌿',
      icon: '🥦',
      type: 'positive',
    },
  },
  {
    condition: (s) => s === 'food_waste',
    message: {
      text: 'Food waste is responsible for 8% of global emissions. Try planning meals to reduce it!',
      icon: '♻️',
      type: 'warning',
    },
  },
  {
    condition: (s) => s === 'coffee',
    message: {
      text: 'Enjoy your coffee! Switching to oat milk can cut its footprint by 70% ☕',
      icon: '☕',
      type: 'info',
    },
  },
]

const TRANSPORT_NUDGES: NudgeRule[] = [
  {
    condition: (s) => s === 'metro' || s === 'bus',
    message: {
      text: 'Excellent! Public transit emits 10x less per passenger than a solo car trip 🚌',
      icon: '🚌',
      type: 'positive',
    },
  },
  {
    condition: (s) => s === 'cycling',
    message: {
      text: 'Zero emissions AND exercise — cycling is the ultimate green commute! 🚴',
      icon: '🚴',
      type: 'positive',
    },
  },
  {
    condition: (s) => s === 'car',
    message: {
      text: 'Could you carpool or take the metro next time? Even 2 days/week cuts your transport footprint by 40%!',
      icon: '🚗',
      type: 'warning',
    },
  },
  {
    condition: (s) => s === 'taxi',
    message: {
      text: 'Taxis emit as much as personal cars. Metro or bus would save ~0.17 kg CO₂ per km 🚕',
      icon: '🚕',
      type: 'info',
    },
  },
  {
    condition: (s) => s === 'walking',
    message: {
      text: "Steps for the planet! Walking produces zero emissions and improves your health 🚶",
      icon: '🚶',
      type: 'positive',
    },
  },
]

const ENERGY_NUDGES: NudgeRule[] = [
  {
    condition: (s) => s === 'ac_off_1hr',
    message: {
      text: "Nice! Each hour without AC saves 0.9 kg CO₂. One small step, big impact! ❄️",
      icon: '❄️',
      type: 'positive',
    },
  },
  {
    condition: (s) => s === 'solar_usage',
    message: {
      text: 'Solar power = clean energy from the sun. You\'re literally running on sunshine! ☀️',
      icon: '☀️',
      type: 'positive',
    },
  },
  {
    condition: (s) => s === 'ac_on_2hr',
    message: {
      text: 'AC accounts for ~17% of home emissions. Try a fan or natural ventilation when possible 💨',
      icon: '🌡️',
      type: 'warning',
    },
  },
  {
    condition: (s) => s === 'led_lights',
    message: {
      text: 'LED bulbs use 75% less energy than incandescents. Every switch counts! 💡',
      icon: '💡',
      type: 'positive',
    },
  },
]

const SHOPPING_NUDGES: NudgeRule[] = [
  {
    condition: (s) => s === 'fast_fashion',
    message: {
      text: 'Fast fashion emits 8 kg CO₂ per item. Consider secondhand or sustainable brands next time 👗',
      icon: '👗',
      type: 'warning',
    },
  },
  {
    condition: (s) => s === 'secondhand',
    message: {
      text: 'Secondhand shopping reduces emissions by 94%! You\'re a circular economy hero ♻️',
      icon: '♻️',
      type: 'positive',
    },
  },
  {
    condition: (s) => s === 'reusable_bag',
    message: {
      text: 'A reusable bag replaces ~500 plastic bags over its lifetime. Keep it up! 🛍️',
      icon: '🛍️',
      type: 'positive',
    },
  },
  {
    condition: (s) => s === 'no_buy',
    message: {
      text: "No-buy day! The most sustainable product is the one you didn't buy 🎯",
      icon: '🎯',
      type: 'positive',
    },
  },
]

const WASTE_NUDGES: NudgeRule[] = [
  {
    condition: (s) => s === 'recycled',
    message: {
      text: 'Recycling saves an average 0.5 kg CO₂ per kg of material. Every item matters! 🔄',
      icon: '🔄',
      type: 'positive',
    },
  },
  {
    condition: (s) => s === 'composted',
    message: {
      text: 'Composting diverts waste from landfill and creates nutrient-rich soil. Nature wins! 🌱',
      icon: '🌱',
      type: 'positive',
    },
  },
  {
    condition: (s) => s === 'landfill',
    message: {
      text: 'Landfill waste produces methane, a potent greenhouse gas. Check if it can be recycled!',
      icon: '🗑️',
      type: 'warning',
    },
  },
]

const NUDGE_MAP: Record<string, NudgeRule[]> = {
  food: FOOD_NUDGES,
  transport: TRANSPORT_NUDGES,
  energy: ENERGY_NUDGES,
  shopping: SHOPPING_NUDGES,
  waste: WASTE_NUDGES,
}

const DEFAULT_NUDGE: NudgeMessage = {
  text: 'Every action counts toward a healthier planet! 🌍',
  icon: '🌍',
  type: 'info',
}

/** Get a contextual nudge message for a logged activity */
export function getNudgeMessage(
  activityType: string,
  subtype: string,
  impact: number
): NudgeMessage {
  const rules = NUDGE_MAP[activityType] ?? []
  const match = rules.find((r) => r.condition(subtype, impact))
  return match?.message ?? DEFAULT_NUDGE
}

/** Get a short comparison nudge for a specific activity type + subtype */
export function getComparisonNudge(activityType: string, subtype: string): string {
  const comparisons: Record<string, Record<string, string>> = {
    food: {
      beef_meal: 'Like driving 31 km in a petrol car',
      vegan_meal: 'Less than charging your phone 70 times',
      coffee: 'About 1/3 the footprint of a glass of milk',
    },
    transport: {
      car: 'Solo car: 5× more CO₂ than the bus per km',
      cycling: 'Zero carbon — the greenest way to move!',
      metro: '10× cleaner than driving alone',
      flight_domestic: 'Like powering 70 homes for a day',
    },
    energy: {
      ac_on_2hr: 'Equivalent to leaving 10 LED bulbs on for 180 hours',
      solar_usage: 'Powered by the sun — 0 grid emissions!',
    },
  }
  return comparisons[activityType]?.[subtype] ?? ''
}
