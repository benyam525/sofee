/**
 * Sofee Insights Generator
 * Generates personalized, actionable insights based on results
 */

export interface SofeeInsight {
  type: "value-alternative" | "just-out-of-reach" | "trade-off-alert"
  icon: "piggy-bank" | "unlock" | "scale"
  title: string
  description: string
  highlight?: string // The key number or fact to emphasize
}

interface ResultForInsights {
  zipCode: string
  city?: string
  score: number
  medianHomePrice?: number
  medianPrice?: number
  scoringDetails?: {
    adjustedScore?: number
    normalized: number
    perCriterion: {
      schoolQuality: { weight: number; score: number }
      commuteBurden: { weight: number; score: number }
      safetyStability: { weight: number; score: number }
      lifestyleConvenienceCulture: { weight: number; score: number }
      [key: string]: { weight: number; score: number }
    }
  }
  commuteTime?: number
}

interface InsightContext {
  results: ResultForInsights[] // Top results shown to user
  allResults: ResultForInsights[] // All scored results (including over budget)
  userBudgetMax: number
  userBudgetMin: number
}

/**
 * Generate Value Alternative insight
 * "You could get 90% of what Frisco offers and save $100k with Richardson"
 */
function generateValueAlternative(ctx: InsightContext): SofeeInsight | null {
  const { results } = ctx
  if (results.length < 2) return null

  const topResult = results[0]
  const topScore = topResult.scoringDetails?.adjustedScore ?? topResult.score
  const topPrice = topResult.medianPrice ?? topResult.medianHomePrice ?? 0

  // Find a cheaper alternative that's within 15 points of top score
  for (let i = 1; i < results.length; i++) {
    const alt = results[i]
    const altScore = alt.scoringDetails?.adjustedScore ?? alt.score
    const altPrice = alt.medianPrice ?? alt.medianHomePrice ?? 0

    const scoreDiff = topScore - altScore
    const priceDiff = topPrice - altPrice

    // Good value alternative: within 15 points but saves at least $50k
    if (scoreDiff <= 15 && scoreDiff > 0 && priceDiff >= 50000) {
      const matchPercent = Math.round((altScore / topScore) * 100)
      const savings = Math.round(priceDiff / 1000) * 1000 // Round to nearest $1k

      return {
        type: "value-alternative",
        icon: "piggy-bank",
        title: "Value Alternative",
        description: `${alt.city || `ZIP ${alt.zipCode}`} scores ${matchPercent}% as well as your #1 pick (${topResult.city || topResult.zipCode}), but could save you $${(savings / 1000).toFixed(0)}k.`,
        highlight: `Save $${(savings / 1000).toFixed(0)}k`,
      }
    }
  }

  return null
}

/**
 * Generate Just Out of Reach insight
 * "Bump your budget $30k and you unlock Frisco 75034 — best schools in your list"
 */
function generateJustOutOfReach(ctx: InsightContext): SofeeInsight | null {
  const { results, allResults, userBudgetMax } = ctx
  if (allResults.length === 0) return null

  // Get the top result's score for comparison
  const topShownScore = results[0]?.scoringDetails?.adjustedScore ?? results[0]?.score ?? 0

  // Find results that are just over budget but score well
  const justOverBudget = allResults.filter((r) => {
    const price = r.medianPrice ?? r.medianHomePrice ?? 0
    const score = r.scoringDetails?.adjustedScore ?? r.score
    const budgetCeiling = userBudgetMax * 1.1 // Current filter threshold

    // Just over the ceiling (within 15% above budget) and scores better than shown results
    return price > budgetCeiling && price <= userBudgetMax * 1.25 && score > topShownScore
  })

  if (justOverBudget.length === 0) return null

  // Sort by score to get the best one
  justOverBudget.sort((a, b) => {
    const scoreA = a.scoringDetails?.adjustedScore ?? a.score
    const scoreB = b.scoringDetails?.adjustedScore ?? b.score
    return scoreB - scoreA
  })

  const bestOverBudget = justOverBudget[0]
  const price = bestOverBudget.medianPrice ?? bestOverBudget.medianHomePrice ?? 0
  const budgetIncrease = price - userBudgetMax
  const score = bestOverBudget.scoringDetails?.adjustedScore ?? bestOverBudget.score

  // Find what makes this ZIP special (highest scoring criterion)
  let specialFeature = "great overall scores"
  if (bestOverBudget.scoringDetails?.perCriterion) {
    const criteria = Object.entries(bestOverBudget.scoringDetails.perCriterion)
    const topCriterion = criteria.reduce((best, [key, val]) => {
      return val.score > (best[1]?.score ?? 0) ? [key, val] : best
    }, criteria[0])

    const criterionLabels: Record<string, string> = {
      schoolQuality: "top-tier schools",
      safetyStability: "excellent safety",
      commuteBurden: "short commutes",
      lifestyleConvenienceCulture: "great lifestyle amenities",
      childDevelopmentOpportunity: "family-friendly environment",
    }
    specialFeature = criterionLabels[topCriterion[0]] || "strong scores"
  }

  const increaseK = Math.ceil(budgetIncrease / 5000) * 5 // Round up to nearest $5k

  return {
    type: "just-out-of-reach",
    icon: "unlock",
    title: "Just Out of Reach",
    description: `Raise your budget by $${increaseK}k and you'd unlock ${bestOverBudget.city || `ZIP ${bestOverBudget.zipCode}`} (score: ${Math.round(score)}/100) — known for ${specialFeature}.`,
    highlight: `+$${increaseK}k unlocks more`,
  }
}

/**
 * Generate Trade-off Alert insight
 * "Your #1 pick has great schools but 40% longer commute than #3"
 */
function generateTradeOffAlert(ctx: InsightContext): SofeeInsight | null {
  const { results } = ctx
  if (results.length < 2) return null

  const topResult = results[0]
  if (!topResult.scoringDetails?.perCriterion) return null

  const topCriteria = topResult.scoringDetails.perCriterion

  // Find significant trade-offs: where #1 is weak but another result is strong
  const weaknesses: { criterion: string; score: number; label: string }[] = []
  const criterionLabels: Record<string, string> = {
    schoolQuality: "schools",
    safetyStability: "safety",
    commuteBurden: "commute",
    lifestyleConvenienceCulture: "lifestyle",
    childDevelopmentOpportunity: "family amenities",
    taxBurden: "taxes",
  }

  // Find where #1 scores below 60 (a weakness)
  for (const [key, val] of Object.entries(topCriteria)) {
    if (val.score < 60 && val.weight >= 2 && criterionLabels[key]) {
      weaknesses.push({
        criterion: key,
        score: val.score,
        label: criterionLabels[key],
      })
    }
  }

  if (weaknesses.length === 0) return null

  // Find a result that's strong where #1 is weak
  for (const weakness of weaknesses) {
    for (let i = 1; i < Math.min(results.length, 5); i++) {
      const alt = results[i]
      if (!alt.scoringDetails?.perCriterion) continue

      const altScore = alt.scoringDetails.perCriterion[weakness.criterion]?.score ?? 0
      const scoreDiff = altScore - weakness.score

      // Alt is significantly better (20+ points) in this criterion
      if (scoreDiff >= 20) {
        const topOverallScore = topResult.scoringDetails?.adjustedScore ?? topResult.score
        const altOverallScore = alt.scoringDetails?.adjustedScore ?? alt.score
        const overallDiff = topOverallScore - altOverallScore

        return {
          type: "trade-off-alert",
          icon: "scale",
          title: "Trade-off to Consider",
          description: `Your #1 pick (${topResult.city || topResult.zipCode}) scores lower on ${weakness.label}. ${alt.city || `ZIP ${alt.zipCode}`} ranks ${Math.round(scoreDiff)} points higher there, with only ${Math.round(overallDiff)} points less overall.`,
          highlight: `${weakness.label} trade-off`,
        }
      }
    }
  }

  return null
}

/**
 * Main function to generate all applicable insights
 */
export function generateInsights(ctx: InsightContext): SofeeInsight[] {
  const insights: SofeeInsight[] = []

  // Try to generate each type of insight
  const valueAlt = generateValueAlternative(ctx)
  if (valueAlt) insights.push(valueAlt)

  const justOutOfReach = generateJustOutOfReach(ctx)
  if (justOutOfReach) insights.push(justOutOfReach)

  const tradeOff = generateTradeOffAlert(ctx)
  if (tradeOff) insights.push(tradeOff)

  // Return max 2 insights to avoid overwhelming the user
  return insights.slice(0, 2)
}
