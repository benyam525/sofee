import type { UserWeights, UserAllPrefs, CriterionKey } from "@/lib/criteria"

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
  percentNewConstruction?: number // 0-100, percent of homes built after 2010
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

function calculatePriorityWeightedScore(
  zip: ZipScores,
  weights: UserWeights,
  nonNegotiables: CriterionKey[] = []
): number {
  const nonNegSet = new Set(nonNegotiables)

  // Non-negotiables get 4x multiplier (dominant), regular criteria get base multiplier
  const getNonNegMultiplier = (key: CriterionKey, baseMultiplier: number) =>
    nonNegSet.has(key) ? baseMultiplier * 4 : baseMultiplier

  const schoolMultiplier = getNonNegMultiplier("schoolQuality", weightToMultiplier(weights.schoolQuality))
  const safetyMultiplier = getNonNegMultiplier("safetyStability", weightToMultiplier(weights.safetyStability))
  const commuteMultiplier = getNonNegMultiplier("commuteBurden", weightToMultiplier(weights.commuteBurden))
  const amenitiesMultiplier = getNonNegMultiplier(
    "lifestyleConvenienceCulture",
    weightToMultiplier(weights.lifestyleConvenienceCulture)
  )
  const taxMultiplier = getNonNegMultiplier("taxBurden", weightToMultiplier(weights.taxBurden))
  const familyMultiplier = getNonNegMultiplier(
    "childDevelopmentOpportunity",
    weightToMultiplier(weights.childDevelopmentOpportunity)
  )
  const tollMultiplier = getNonNegMultiplier("tollRoadConvenience", weightToMultiplier(weights.tollRoadConvenience))

  // Base category weights (sum to 1.0)
  const baseWeights = {
    school: 0.2,
    safety: 0.2,
    commute: 0.15,
    amenities: 0.15,
    tax: 0.1,
    family: 0.15,
    toll: 0.05,
  }

  // Calculate raw weighted contributions
  const schoolContrib = (zip.schoolQualityScore ?? 0) * schoolMultiplier * baseWeights.school
  const safetyContrib = (zip.safetyStabilityScore ?? 0) * safetyMultiplier * baseWeights.safety
  const commuteContrib = (zip.commuteBurdenScore ?? 50) * commuteMultiplier * baseWeights.commute
  const amenitiesContrib = (zip.lifestyleConvenienceCultureScore ?? 0) * amenitiesMultiplier * baseWeights.amenities
  const taxContrib = (zip.taxBurdenScore ?? 50) * taxMultiplier * baseWeights.tax
  const familyContrib = (zip.childDevelopmentOpportunityScore ?? 0) * familyMultiplier * baseWeights.family
  const tollContrib = (zip.tollRoadConvenienceScore ?? 50) * tollMultiplier * baseWeights.toll

  const rawScore =
    schoolContrib + safetyContrib + commuteContrib + amenitiesContrib + taxContrib + familyContrib + tollContrib

  // Normalize based on actual multipliers used
  const totalWeight =
    schoolMultiplier * baseWeights.school +
    safetyMultiplier * baseWeights.safety +
    commuteMultiplier * baseWeights.commute +
    amenitiesMultiplier * baseWeights.amenities +
    taxMultiplier * baseWeights.tax +
    familyMultiplier * baseWeights.family +
    tollMultiplier * baseWeights.toll

  const normalized = totalWeight > 0 ? rawScore / totalWeight : 0

  return Math.min(100, Math.max(0, normalized))
}

export function scoreZip(
  zip: ZipScores,
  weights: UserWeights,
  nonNegotiables: CriterionKey[] = []
): ZipFinalScore {
  const baselineScore = calculateBaselineScore(zip)
  const priorityWeightedScore = calculatePriorityWeightedScore(zip, weights, nonNegotiables)

  // When non-negotiables are set, weight priority score more heavily
  // No non-negs: 60% baseline + 40% priority
  // With non-negs: 40% baseline + 60% priority (user preferences dominate)
  const hasNonNegs = nonNegotiables.length > 0
  const baselineWeight = hasNonNegs ? 0.4 : 0.6
  const priorityWeight = hasNonNegs ? 0.6 : 0.4

  const sofeeFitScore = baselineScore * baselineWeight + priorityWeightedScore * priorityWeight

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
  const base = scoreZip(zip, prefs.weights, prefs.nonNegotiables ?? [])

  let townCenterBonus = 0
  let lifestyleTagBonus = 0

  // Special preference: Town Center (+1/-1)
  // Reduced to stay secondary to primary weights
  if (prefs.special.preferTownCenter) {
    if (zip.hasTownCenter) {
      townCenterBonus += 1
    } else {
      townCenterBonus -= 1
    }
  }

  // Special preference: Newer Homes (+2/-2)
  // Based on percentNewConstruction (% of homes built after 2010)
  if (prefs.special.preferNewerHomes) {
    const newConstruction = zip.percentNewConstruction ?? 30
    if (newConstruction >= 60) {
      townCenterBonus += 2 // Lots of new construction
    } else if (newConstruction >= 40) {
      townCenterBonus += 1 // Moderate new construction
    } else if (newConstruction >= 25) {
      townCenterBonus += 0 // Neutral
    } else {
      townCenterBonus -= 2 // Mostly older homes
    }
  }

  // Special preference: Established Neighborhoods (+2/-2)
  // Inverse of new construction - prefer mature, settled areas
  if (prefs.special.preferEstablishedNeighborhoods) {
    const newConstruction = zip.percentNewConstruction ?? 30
    if (newConstruction <= 15) {
      townCenterBonus += 2 // Very established, mature neighborhood
    } else if (newConstruction <= 25) {
      townCenterBonus += 1 // Mostly established
    } else if (newConstruction <= 40) {
      townCenterBonus += 0 // Neutral
    } else {
      townCenterBonus -= 2 // Too much new development
    }
  }

  // Lifestyle tags: secondary modifiers (smaller than primary weight impact)
  // Bonuses/penalties are ±2 per tag (4-point spread) to stay secondary to primary weights
  const tagSet = new Set(prefs.lifestyle.tags)

  if (tagSet.has("diverseGlobal")) {
    const diversityIndex = zip.restaurantDiversityIndex ?? 0
    if (diversityIndex >= 0.85) {
      lifestyleTagBonus += 2
    } else if (diversityIndex >= 0.75) {
      lifestyleTagBonus += 1
    } else if (diversityIndex >= 0.65) {
      lifestyleTagBonus += 0
    } else {
      lifestyleTagBonus -= 2
    }
  }

  if (tagSet.has("lateNightFood")) {
    const restaurants = zip.restaurantUniqueCount ?? 0
    const entertainment = zip.entertainmentCount ?? 0
    if (restaurants >= 70 && entertainment >= 20) {
      lifestyleTagBonus += 2
    } else if (restaurants >= 50 && entertainment >= 12) {
      lifestyleTagBonus += 1
    } else if (restaurants >= 30) {
      lifestyleTagBonus += 0
    } else {
      lifestyleTagBonus -= 2
    }
  }

  if (tagSet.has("sportsHeavy")) {
    const parks = zip.parksCountPerSqMi ?? 0
    const isSportsCity = /frisco|allen|mckinney|prosper/i.test(zip.city)
    if (isSportsCity && parks >= 3.0) {
      lifestyleTagBonus += 2
    } else if (isSportsCity || parks >= 3.5) {
      lifestyleTagBonus += 1
    } else if (parks >= 2.5) {
      lifestyleTagBonus += 0
    } else {
      lifestyleTagBonus -= 2
    }
  }

  if (tagSet.has("quietPredictable")) {
    const safety = zip.safetySignal ?? 3
    const entertainment = zip.entertainmentCount ?? 0
    if (safety === 1 && entertainment <= 10) {
      lifestyleTagBonus += 2
    } else if (safety <= 2 && entertainment <= 15) {
      lifestyleTagBonus += 1
    } else if (entertainment <= 20) {
      lifestyleTagBonus += 0
    } else {
      lifestyleTagBonus -= 2
    }
  }

  if (tagSet.has("upscaleRefined")) {
    const price = zip.medianHomePrice ?? 0
    const convenience = zip.convenienceClusterScore ?? 0
    const hasTown = zip.hasTownCenter ?? false
    if (price >= 550000 && convenience >= 85 && hasTown) {
      lifestyleTagBonus += 2
    } else if (price >= 450000 && convenience >= 75) {
      lifestyleTagBonus += 1
    } else if (price >= 400000 && convenience >= 70) {
      lifestyleTagBonus += 0
    } else {
      lifestyleTagBonus -= 2
    }
  }

  if (tagSet.has("townCenter")) {
    if (zip.hasTownCenter) {
      lifestyleTagBonus += 2
    } else {
      lifestyleTagBonus -= 2
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
