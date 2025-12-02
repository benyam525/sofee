import type { UserWeights, UserAllPrefs } from "@/lib/criteria"

export interface ZipScores {
  zip: string
  city: string
  schoolQualityScore: number // 0–100
  affordabilityScore: number // 0–100 - kept for display purposes
  commuteBurdenScore: number // 0–100
  safetyStabilityScore: number // 0–100
  lifestyleConvenienceCultureScore: number // 0–100
  childDevelopmentOpportunityScore: number // 0–100
  taxBurdenScore: number // 0–100
  tollRoadConvenienceScore: number // 0–100
  // Raw data fields for lifestyle tag scoring
  hasTownCenter?: boolean
  restaurantDiversityIndex?: number // 0-1 scale
  restaurantUniqueCount?: number
  entertainmentCount?: number
  parksCountPerSqMi?: number
  safetySignal?: number // 1=Excellent, 2=Very Good, 3=Good, 4=Fair
  medianHomePrice?: number
  convenienceClusterScore?: number
  qualityOfLifeScore?: number // 0-100
}

export interface ZipFinalScore {
  zip: string
  city: string
  rawScores: ZipScores
  weights: UserWeights
  weightedTotal: number // legacy - kept for compatibility
  normalized: number // legacy - kept for compatibility
  baselineScore: number // 0-100, objective baseline
  priorityWeightedScore: number // 0-100, user-weighted
  sofeeFitScore: number // 0-100, final combined score
  perCriterion: {
    schoolQuality: { weight: number; score: number; contribution: number }
    commuteBurden: { weight: number; score: number; contribution: number }
    safetyStability: { weight: number; score: number; contribution: number }
    lifestyleConvenienceCulture: { weight: number; score: number; contribution: number }
    childDevelopmentOpportunity: { weight: number; score: number; contribution: number }
    taxBurden: { weight: number; score: number; contribution: number }
    tollRoadConvenience: { weight: number; score: number; contribution: number }
  }
}

export interface ZipFinalEnriched extends ZipFinalScore {
  adjustedScore: number // final after modifiers (now equals sofeeFitScore + modifiers)
  modifiers: {
    townCenterBonus: number
    lifestyleTagBonus: number
  }
}

function weightToMultiplier(weight: number): number {
  // Clamp weight to 0-3 range
  const clampedWeight = Math.max(0, Math.min(3, Math.round(weight)))
  switch (clampedWeight) {
    case 0:
      return 0.5
    case 1:
      return 1.0
    case 2:
      return 1.5
    case 3:
      return 2.0
    default:
      return 1.0
  }
}

function calculateBaselineScore(zip: ZipScores): number {
  const schoolQuality = zip.schoolQualityScore ?? 0
  const safety = zip.safetyStabilityScore ?? 0
  const diversity = (zip.restaurantDiversityIndex ?? 0.5) * 100 // Convert 0-1 to 0-100
  const housingValue = zip.affordabilityScore ?? 50
  const amenities = zip.lifestyleConvenienceCultureScore ?? 0
  const commute = zip.commuteBurdenScore ?? 50
  const familyEcosystem = zip.childDevelopmentOpportunityScore ?? 0
  const qualityOfLife = zip.qualityOfLifeScore ?? (safety + amenities + (zip.parksCountPerSqMi ?? 2) * 20) / 3

  // Baseline formula with fixed weights
  const baseline =
    schoolQuality * 0.18 +
    safety * 0.18 +
    diversity * 0.1 +
    housingValue * 0.1 +
    amenities * 0.1 +
    commute * 0.08 +
    familyEcosystem * 0.12 +
    qualityOfLife * 0.14

  return Math.min(100, Math.max(0, baseline))
}

function calculatePriorityWeightedScore(zip: ZipScores, weights: UserWeights): number {
  const schoolMultiplier = weightToMultiplier(weights.schoolQuality)
  const safetyMultiplier = weightToMultiplier(weights.safetyStability)
  const commuteMultiplier = weightToMultiplier(weights.commuteBurden)
  const amenitiesMultiplier = weightToMultiplier(weights.lifestyleConvenienceCulture)
  const taxMultiplier = weightToMultiplier(weights.taxBurden)
  const familyMultiplier = weightToMultiplier(weights.childDevelopmentOpportunity)

  // Calculate raw weighted contributions
  const schoolContrib = (zip.schoolQualityScore ?? 0) * schoolMultiplier * 0.2
  const safetyContrib = (zip.safetyStabilityScore ?? 0) * safetyMultiplier * 0.2
  const commuteContrib = (zip.commuteBurdenScore ?? 50) * commuteMultiplier * 0.15
  const amenitiesContrib = (zip.lifestyleConvenienceCultureScore ?? 0) * amenitiesMultiplier * 0.15
  const taxContrib = (zip.taxBurdenScore ?? 50) * taxMultiplier * 0.1
  const familyContrib = (zip.childDevelopmentOpportunityScore ?? 0) * familyMultiplier * 0.2

  const rawScore = schoolContrib + safetyContrib + commuteContrib + amenitiesContrib + taxContrib + familyContrib

  // Normalize based on max possible score (if all multipliers were 2.0x)
  // Max raw = 100 * 2.0 * (0.20 + 0.20 + 0.15 + 0.15 + 0.10 + 0.20) = 100 * 2.0 * 1.0 = 200
  // But we want to normalize to 0-100 based on current multipliers
  const totalWeight =
    schoolMultiplier * 0.2 +
    safetyMultiplier * 0.2 +
    commuteMultiplier * 0.15 +
    amenitiesMultiplier * 0.15 +
    taxMultiplier * 0.1 +
    familyMultiplier * 0.2

  const normalized = totalWeight > 0 ? rawScore / totalWeight : 0

  return Math.min(100, Math.max(0, normalized))
}

export function scoreZip(zip: ZipScores, weights: UserWeights): ZipFinalScore {
  const baselineScore = calculateBaselineScore(zip)
  const priorityWeightedScore = calculatePriorityWeightedScore(zip, weights)

  // Final Sofee Fit Score: 60% baseline + 40% priority-weighted
  const sofeeFitScore = baselineScore * 0.6 + priorityWeightedScore * 0.4

  // Legacy per-criterion breakdown for compatibility
  const perCriterion: any = {}
  const entries: [string, number, number][] = [
    ["schoolQuality", weights.schoolQuality, zip.schoolQualityScore],
    ["commuteBurden", weights.commuteBurden, zip.commuteBurdenScore],
    ["safetyStability", weights.safetyStability, zip.safetyStabilityScore],
    ["lifestyleConvenienceCulture", weights.lifestyleConvenienceCulture, zip.lifestyleConvenienceCultureScore],
    ["childDevelopmentOpportunity", weights.childDevelopmentOpportunity, zip.childDevelopmentOpportunityScore],
    ["taxBurden", weights.taxBurden, zip.taxBurdenScore],
    ["tollRoadConvenience", weights.tollRoadConvenience, zip.tollRoadConvenienceScore],
  ]

  let weightedSum = 0
  let weightTotal = 0
  for (const [key, weight, score] of entries) {
    const multiplier = weightToMultiplier(weight)
    const contribution = multiplier * score
    perCriterion[key] = { weight, score, contribution }
    weightedSum += contribution
    weightTotal += multiplier
  }

  const normalized = weightTotal > 0 ? weightedSum / weightTotal : 0

  return {
    zip: zip.zip,
    city: zip.city,
    rawScores: zip,
    weights,
    weightedTotal: weightedSum,
    normalized, // Legacy - kept for compatibility
    baselineScore,
    priorityWeightedScore,
    sofeeFitScore,
    perCriterion,
  }
}

export function scoreZipWithPrefs(zip: ZipScores, prefs: UserAllPrefs): ZipFinalEnriched {
  const base = scoreZip(zip, prefs.weights)

  let townCenterBonus = 0
  let lifestyleTagBonus = 0

  // Special preference: Town Center (+3/-3)
  if (prefs.special.preferTownCenter) {
    if (zip.hasTownCenter) {
      townCenterBonus += 3
    } else {
      townCenterBonus -= 3
    }
  }

  // Lifestyle tags: bonuses AND penalties based on ZIP characteristics
  const tagSet = new Set(prefs.lifestyle.tags)

  if (tagSet.has("diverseGlobal")) {
    const diversityIndex = zip.restaurantDiversityIndex ?? 0
    if (diversityIndex >= 0.85) {
      lifestyleTagBonus += 5
    } else if (diversityIndex >= 0.75) {
      lifestyleTagBonus += 2
    } else if (diversityIndex >= 0.65) {
      lifestyleTagBonus += 0
    } else {
      lifestyleTagBonus -= 5
    }
  }

  if (tagSet.has("lateNightFood")) {
    const restaurants = zip.restaurantUniqueCount ?? 0
    const entertainment = zip.entertainmentCount ?? 0
    if (restaurants >= 70 && entertainment >= 20) {
      lifestyleTagBonus += 5
    } else if (restaurants >= 50 && entertainment >= 12) {
      lifestyleTagBonus += 2
    } else if (restaurants >= 30) {
      lifestyleTagBonus += 0
    } else {
      lifestyleTagBonus -= 5
    }
  }

  if (tagSet.has("sportsHeavy")) {
    const parks = zip.parksCountPerSqMi ?? 0
    const isSportsCity = /frisco|allen|mckinney|prosper/i.test(zip.city)
    if (isSportsCity && parks >= 3.0) {
      lifestyleTagBonus += 5
    } else if (isSportsCity || parks >= 3.5) {
      lifestyleTagBonus += 2
    } else if (parks >= 2.5) {
      lifestyleTagBonus += 0
    } else {
      lifestyleTagBonus -= 5
    }
  }

  if (tagSet.has("quietPredictable")) {
    const safety = zip.safetySignal ?? 3
    const entertainment = zip.entertainmentCount ?? 0
    if (safety === 1 && entertainment <= 10) {
      lifestyleTagBonus += 5
    } else if (safety <= 2 && entertainment <= 15) {
      lifestyleTagBonus += 2
    } else if (entertainment <= 20) {
      lifestyleTagBonus += 0
    } else {
      lifestyleTagBonus -= 5
    }
  }

  if (tagSet.has("upscaleRefined")) {
    const price = zip.medianHomePrice ?? 0
    const convenience = zip.convenienceClusterScore ?? 0
    const hasTown = zip.hasTownCenter ?? false
    if (price >= 550000 && convenience >= 85 && hasTown) {
      lifestyleTagBonus += 5
    } else if (price >= 450000 && convenience >= 75) {
      lifestyleTagBonus += 2
    } else if (price >= 400000 && convenience >= 70) {
      lifestyleTagBonus += 0
    } else {
      lifestyleTagBonus -= 5
    }
  }

  if (tagSet.has("townCenter")) {
    if (zip.hasTownCenter) {
      lifestyleTagBonus += 5
    } else {
      lifestyleTagBonus -= 5
    }
  }

  const adjustedScore = Math.max(0, Math.min(100, base.sofeeFitScore + townCenterBonus + lifestyleTagBonus))

  return {
    ...base,
    adjustedScore,
    modifiers: {
      townCenterBonus,
      lifestyleTagBonus,
    },
  }
}
