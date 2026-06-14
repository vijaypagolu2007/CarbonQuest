/** 
 * CO2e emission factors in kg per unit
 * SOURCES:
 * - EPA Greenhouse Gas Equivalencies Calculator (2024)
 * - WHO Health and Climate Change Guidelines / IPCC AR6
 * - Our World in Data (Food & Agriculture Emissions)
 */
export const EMISSION_FACTORS = {
  food: {
    beef_meal: 14.8, // IPCC: ~99 kg CO2e/kg beef -> 150g serving
    chicken_meal: 1.48, // IPCC: ~9.9 kg CO2e/kg poultry
    fish_meal: 2.04, // IPCC: ~13.6 kg CO2e/kg farmed fish
    vegetarian_meal: -1.5, // Estimated savings vs average omnivore meal
    vegan_meal: -2.2, // Estimated savings vs average omnivore meal
    dairy_meal: 3.15, // High dairy footprint (cheese/butter)
    fast_food_meal: 3.8, // Includes packaging and transport overhead
    coffee: 0.4, // WHO: ~0.4 kg CO2e per latte (dairy + land use)
    food_waste_kg: 2.5, // EPA: Methane emissions from landfill food waste
  },
  transport: {
    car_petrol_km: 0.248, // EPA: 4.00x10^-4 metric tons CO2E/mile -> ~0.248 kg/km
    car_diesel_km: 0.268, // EPA standard for light-duty diesel
    car_electric_km: 0.08, // Includes average US grid charging emissions
    motorcycle_km: 0.113, // EPA estimates
    bus_km: -0.15, // Savings vs driving alone (mass transit offset)
    metro_km: -0.20, // Electric rail savings
    train_km: -0.18, // Commuter rail savings
    flight_domestic_km: 0.255, // IPCC: High altitude radiative forcing
    flight_international_km: 0.195, // More efficient long-haul cruising
    taxi_km: 0.3, // Includes empty cruising time
    cycling_km: -0.248, // Total savings of avoiding 1 km of average driving
    walking_km: -0.248, 
  },
  energy: {
    electricity_kwh: 0.388, // EPA: 0.855 lbs CO2e/kWh national average
    natural_gas_kwh: 0.181, // EPA: 5.3 kg CO2e/therm (~29.3 kWh)
    ac_hour: 0.85, // Assumes average 2.2kW window unit
    led_hour: -0.05, // Savings vs incandescent
    ev_charge_kwh: 0.388, // Standard grid electricity
  },
  shopping: {
    fast_fashion_item: 15.0, // WHO/UNEP: Textiles generate 10% global emissions
    electronics_item: 85.0, // Lifecycle emissions for average smartphone/tablet
    secondhand_item: -10.0, // Avoided manufacturing emissions
    plastic_bag: 0.033, // EPA: manufacturing + disposal
    reusable_bag: -0.033, // Savings per use (after break-even)
    online_delivery: 0.8, // Last-mile delivery vehicle emissions
  },
  waste: {
    recycled_kg: -0.89, // EPA: Avoided landfill methane & raw material extraction
    landfill_kg: 1.46, // EPA: Average municipal solid waste emission factor
    composted_kg: -0.18, // EPA: Sequestration and avoided methane
    plastic_recycled_kg: -1.2, // High offset due to oil extraction avoidance
  },
} as const

/** Weekly baseline footprint in kg CO2e by diet type (WHO/IPCC Annual / 52) */
export const BASELINE_BY_DIET: Record<string, number> = {
  vegan: 20.1, // ~1.05 tons/year
  vegetarian: 26.9, // ~1.4 tons/year
  pescatarian: 32.6, // ~1.7 tons/year
  omnivore: 48.0, // ~2.5 tons/year (Global average)
  meat_heavy: 63.4, // ~3.3 tons/year (Western heavy meat diet)
}

/** Weekly commute footprint multipliers (kg per typical 20km round trip x 5 days) */
export const COMMUTE_WEEKLY: Record<string, number> = {
  walking: 0,
  cycling: 0,
  public_transit: 5.5, // 100km/week bus/metro
  car: 24.8, // 100km/week * 0.248 kg/km
  motorcycle: 11.3, // 100km/week * 0.113 kg/km
}

/** Relatable comparisons for displaying CO2e impact */
export const RELATABLE_COMPARISONS = [
  {
    threshold: 0.1,
    text: (kg: number) => `= charging your phone ${Math.round(kg * 122)} times`,
  },
  {
    threshold: 1,
    text: (kg: number) => `= driving ${Math.round(kg / 0.21)} km by car`,
  },
  {
    threshold: 5,
    text: (kg: number) => `= burning ${Math.round((kg / 2.31) * 10) / 10} liters of petrol`,
  },
  {
    threshold: 10,
    text: (kg: number) =>
      `= ${Math.round((kg / 21.7) * 100) / 100} days of a tree's annual absorption`,
  },
  {
    threshold: 50,
    text: (kg: number) =>
      `= ${Math.round(kg / 900)} transatlantic flights`,
  },
]
