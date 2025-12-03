import { type NextRequest, NextResponse } from "next/server"
import dfwData from "@/data/dfwData.json"
import type { UserWeights, UserAllPrefs, LifestyleTag } from "@/lib/criteria"
import { type ZipScores, scoreZipWithPrefs } from "@/lib/scoring"
import { computeLifestyleSubscores, computeLifestyleConvenienceCultureScore } from "@/lib/scoring/lifestyle"
import type { ZipRawData } from "@/types/zip"

const DEBUG = process.env.NODE_ENV === "development"

interface Preferences {
  budget: string
  homeType: string
  schoolImportance: string
  safetyImportance: string
  affordabilityImportance: string
  parksImportance: string
  climate: string
  fromZip: string
  lifestylePreferences: string
  preferTownCenter?: string
  preferNewerHomes?: string
  preferEstablishedNeighborhoods?: string
}

function getDFWDescription(zip: string, city: string, userWeights: UserWeights, zipScores: ZipScores): string {
  const topPriorities: Array<{ name: string; displayName: string; score: number; weight: number }> = []

  if (userWeights.schoolQuality >= 4) {
    topPriorities.push({
      name: "schools",
      displayName: "excellent schools",
      score: zipScores.schoolQualityScore,
      weight: userWeights.schoolQuality,
    })
  }

  if (userWeights.affordability >= 4) {
    topPriorities.push({
      name: "affordability",
      displayName: "affordability",
      score: zipScores.affordabilityScore,
      weight: userWeights.affordability,
    })
  }

  if (userWeights.safetyStability >= 4) {
    topPriorities.push({
      name: "safety",
      displayName: "safety",
      score: zipScores.safetyStabilityScore,
      weight: userWeights.safetyStability,
    })
  }

  if (userWeights.lifestyleConvenienceCulture >= 4) {
    topPriorities.push({
      name: "lifestyle",
      displayName: "lifestyle & convenience",
      score: zipScores.lifestyleConvenienceCultureScore,
      weight: userWeights.lifestyleConvenienceCulture,
    })
  }

  if (userWeights.taxBurden >= 4) {
    topPriorities.push({
      name: "taxes",
      displayName: "low tax burden",
      score: zipScores.taxBurdenScore,
      weight: userWeights.taxBurden,
    })
  }

  if (userWeights.childDevelopmentOpportunity >= 4) {
    topPriorities.push({
      name: "childDev",
      displayName: "child development opportunities",
      score: zipScores.childDevelopmentOpportunityScore,
      weight: userWeights.childDevelopmentOpportunity,
    })
  }

  if (userWeights.commuteBurden >= 4) {
    topPriorities.push({
      name: "commute",
      displayName: "convenient commute",
      score: zipScores.commuteBurdenScore,
      weight: userWeights.commuteBurden,
    })
  }

  topPriorities.sort((a, b) => {
    if (b.weight !== a.weight) return b.weight - a.weight
    return b.score - a.score
  })

  const strengthsText =
    topPriorities.length > 0
      ? topPriorities
          .slice(0, 2)
          .map((p) => p.displayName)
          .join(" and ")
      : "your priorities"

  const cityHighlight = (() => {
    if (city === "Frisco")
      return "access to highly rated Frisco ISD schools, newer master-planned neighborhoods, and high resale value"
    if (city === "Allen")
      return "Allen ISD's strong schools, family athletic programs, and established suburban character"
    if (city === "McKinney")
      return "McKinney ISD's solid reputation, historic and newer mixed areas, and family-friendly amenities"
    if (city.includes("Plano"))
      return "highly rated Plano ISD schools, established communities, and strong corporate corridor access"
    if (city === "Prosper")
      return "new development with rapid growth, larger homes at value, and strong future potential"
    if (city === "Celina") return "emerging development, larger homes at value, and strong growth potential"
    if (city === "Southlake") return "premium Carroll ISD schools, luxury suburbs, and top-ranked safety"
    if (city === "Colleyville") return "premium Grapevine-Colleyville ISD schools, luxury suburbs, and excellent safety"
    if (city === "Carrollton")
      return "Carrollton-Farmers Branch ISD's improving schools, diverse neighborhoods, and central location"
    if (city === "Coppell") return "highly rated Coppell ISD schools, tight-knit community, and excellent parks"
    if (city === "Grand Prairie")
      return "affordable housing, growing amenities, and central location between Dallas and Fort Worth"
    if (city === "Richardson")
      return "Richardson ISD schools, exceptional diversity, central location, and urban amenities"
    if (city === "Irving")
      return "affordable housing, strong diversity, and excellent access to DFW Airport and Las Colinas"
    if (city === "Farmers Branch") return "affordable housing, diverse community, and central North Dallas location"
    if (city === "Lewisville") return "Lewisville ISD schools, affordability, and growing amenities"
    return "balanced amenities and family-friendly neighborhoods"
  })()

  return `${zip} in ${city} is a strong match for your priorities in ${strengthsText}, featuring ${cityHighlight}.`
}

function calculateFutureGrowthScore(
  schoolScore: number,
  parksScore: number,
  medianHomePrice: number,
  commuteTime: number,
  city: string,
): number {
  let growthScore = 0

  growthScore += schoolScore * 2.5

  growthScore += parksScore * 1.5

  const priceScore = Math.min((medianHomePrice - 300000) / 70000, 10)
  growthScore += priceScore * 2.0

  const commuteScore = Math.max(0, 10 - (commuteTime - 20) / 3)
  growthScore += commuteScore * 1.0

  if (city === "Prosper" || city === "Celina") {
    growthScore += 15
  } else if (city === "Southlake" || city === "Colleyville") {
    growthScore += 10
  } else if (city === "Plano" || city === "McKinney" || city === "Allen") {
    growthScore += 5
  }

  const normalizedScore = (growthScore / 75) * 10

  return Math.max(0, Math.min(10, Math.round(normalizedScore * 10) / 10))
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (DEBUG) {
      console.log("[v0] API - Raw request body received:", JSON.stringify(body, null, 2))
      console.log("[v0] API - Type check:", {
        schoolQuality: `value="${body.schoolQuality}" type=${typeof body.schoolQuality}`,
        affordability: `value="${body.affordability}" type=${typeof body.affordability}`,
      })
    }

    const parseWeight = (value: any, defaultValue = 3): number => {
      const parsed = Number.parseInt(value)
      return !isNaN(parsed) && parsed >= 0 && parsed <= 4 ? parsed : defaultValue
    }

    const weights: UserWeights = {
      schoolQuality: parseWeight(body.schoolQuality),
      commuteBurden: parseWeight(body.commuteBurden),
      safetyStability: parseWeight(body.safetyStability),
      lifestyleConvenienceCulture: parseWeight(body.lifestyleConvenienceCulture),
      childDevelopmentOpportunity: parseWeight(body.childDevelopmentOpportunity),
      taxBurden: parseWeight(body.taxBurden),
      tollRoadConvenience: parseWeight(body.tollRoadConvenience),
    }

    if (DEBUG) {
      console.log("[v0] API - Parsed weights:", weights)
      console.log("[v0] API - Parse test:", {
        schoolQualityRaw: body.schoolQuality,
        schoolQualityParsed: Number.parseInt(body.schoolQuality),
        schoolQualityFinal: weights.schoolQuality,
      })
    }

    const lifestyleTagsRaw = body.lifestyleTags || ""
    const lifestyleTags = (
      typeof lifestyleTagsRaw === "string" ? lifestyleTagsRaw.split(",").filter(Boolean) : lifestyleTagsRaw
    ) as LifestyleTag[]

    const specialPrefs = {
      preferTownCenter: body.preferTownCenter === "true" || body.preferTownCenter === true,
      preferNewerHomes: body.preferNewerHomes === "true" || body.preferNewerHomes === true,
      preferEstablishedNeighborhoods:
        body.preferEstablishedNeighborhoods === "true" || body.preferEstablishedNeighborhoods === true,
    }

    if (DEBUG) {
      console.log("[v0] Lifestyle tags:", lifestyleTags)
      console.log("[v0] Special prefs:", specialPrefs)
    }

    const userAllPrefs: UserAllPrefs = {
      weights,
      lifestyle: { tags: lifestyleTags },
      special: specialPrefs,
    }

    const budget = Number.parseInt((body.budget || "500000").replace(/\D/g, ""))
    if (DEBUG) console.log("[v0] Budget:", budget)

    const budgetThreshold = budget * 1.1
    const relaxedBudgetThreshold = budget * 1.2
    const overrideData = body.overrideData

    const excludedCitiesRaw = body.excludedCities || ""
    const excludedCities = (
      typeof excludedCitiesRaw === "string" ? excludedCitiesRaw.split(",").filter(Boolean) : excludedCitiesRaw
    ) as string[]

    if (DEBUG) console.log("[v0] Excluded cities:", excludedCities)

    let workingData = [...(dfwData as unknown as ZipRawData[])]

    const zip75007Initial = workingData.find((n) => n.zip === "75007")
    if (DEBUG) {
      console.log(
        "[v0] 75007 in initial data:",
        zip75007Initial
          ? `Yes - ${zip75007Initial.city}, price: ${zip75007Initial.medianHomePrice || zip75007Initial.medianSalePrice}`
          : "NO",
      )
    }

    if (excludedCities.length > 0) {
      workingData = workingData.filter((neighborhood) => !excludedCities.includes(neighborhood.city))
      if (DEBUG) {
        console.log(
          `[v0] Filtered out ${dfwData.length - workingData.length} ZIPs from excluded cities. ${workingData.length} ZIPs remaining.`,
        )
        const zip75007AfterCityFilter = workingData.find((n) => n.zip === "75007")
        console.log("[v0] 75007 after city exclusion filter:", zip75007AfterCityFilter ? "Still present" : "FILTERED OUT")
      }
    }

    if (overrideData) {
      workingData = workingData.map((neighborhood) => {
        const zip = neighborhood.zip
        const overrides: any = {}

        if (overrideData.prices?.[zip]) {
          Object.assign(overrides, overrideData.prices[zip])
        }

        if (overrideData.schools?.[zip]) {
          Object.assign(overrides, overrideData.schools[zip])
        }

        if (overrideData.parks?.[zip]) {
          Object.assign(overrides, overrideData.parks[zip])
        }

        return { ...neighborhood, ...overrides }
      })
    }

    const maxRestaurantUnique = Math.max(...workingData.map((z) => z.restaurantUniqueCount || 0))
    const maxEntertainmentCount = Math.max(...workingData.map((z) => z.entertainmentCount || 0))
    const globalStats = { maxRestaurantUnique, maxEntertainmentCount }

    const allMedianPrices = workingData.map((n) => n.medianSalePrice || n.medianHomePrice)
    const allParksCount = workingData.map((n) => n.parksCountPerSqMi || 0)

    const toQuantileScore = (value: number, array: number[], inverse = false): number => {
      const sorted = [...array].sort((a, b) => (inverse ? b - a : a - b))
      const position = sorted.findIndex((v) => (inverse ? v <= value : v >= value))
      const percentile = position / sorted.length
      return Math.round(percentile * 100)
    }

    const results = workingData.map((neighborhood) => {
      let schoolQualityScore = 50
      if (typeof neighborhood.schoolSignal === "number") {
        schoolQualityScore = neighborhood.schoolSignal
      }

      let safetyStabilityScore = 50
      if (typeof neighborhood.safetySignal === "number") {
        const safetyBand = neighborhood.safetySignal
        switch (safetyBand) {
          case 1:
            safetyStabilityScore = 100
            break
          case 2:
            safetyStabilityScore = 80
            break
          case 3:
            safetyStabilityScore = 60
            break
          case 4:
            safetyStabilityScore = 40
            break
          case 5:
            safetyStabilityScore = 20
            break
          default:
            safetyStabilityScore = 50
        }
      }

      let parksScore = 50
      if (typeof neighborhood.parksCountPerSqMi === "number") {
        parksScore = toQuantileScore(neighborhood.parksCountPerSqMi, allParksCount, false)
      }

      const priceToUse = neighborhood.medianSalePrice || neighborhood.medianHomePrice
      const affordabilityScore = toQuantileScore(priceToUse, allMedianPrices, true)

      const commuteTime = neighborhood.commuteTime || 30
      const commuteBurdenScore = Math.max(0, Math.min(100, Math.round(100 - (commuteTime / 60) * 100)))

      const lifestyleSubs = computeLifestyleSubscores(neighborhood, globalStats)
      const lifestyleConvenienceCultureScore = computeLifestyleConvenienceCultureScore(lifestyleSubs)

      const childDevelopmentOpportunityScore = Math.round((schoolQualityScore + parksScore) / 2)
      const taxBurdenScore = 50
      const tollRoadConvenienceScore = 50

      const zipScores: ZipScores = {
        zip: neighborhood.zip,
        city: neighborhood.city,
        schoolQualityScore,
        affordabilityScore,
        commuteBurdenScore,
        safetyStabilityScore,
        lifestyleConvenienceCultureScore,
        childDevelopmentOpportunityScore,
        taxBurdenScore,
        tollRoadConvenienceScore,
        hasTownCenter: neighborhood.hasTownCenter,
        restaurantDiversityIndex: neighborhood.restaurantDiversityIndex,
        restaurantUniqueCount: neighborhood.restaurantUniqueCount,
        entertainmentCount: neighborhood.entertainmentCount,
        parksCountPerSqMi: neighborhood.parksCountPerSqMi,
        safetySignal: neighborhood.safetySignal,
        medianHomePrice: neighborhood.medianHomePrice,
        convenienceClusterScore: neighborhood.convenienceClusterScore,
        percentNewConstruction: neighborhood.percentNewConstruction,
      }

      const scored = scoreZipWithPrefs(zipScores, userAllPrefs)

      if (DEBUG) {
        console.log(
          `[v0] ${neighborhood.zip} (${neighborhood.city}): baseline=${scored.baselineScore.toFixed(1)}, priority=${scored.priorityWeightedScore.toFixed(1)}, sofee=${scored.sofeeFitScore.toFixed(1)}, adjusted=${scored.adjustedScore.toFixed(1)}`,
        )
      }

      const reason = getDFWDescription(neighborhood.zip, neighborhood.city, weights, zipScores)

      const futureGrowthScore = calculateFutureGrowthScore(
        schoolQualityScore / 10,
        parksScore / 10,
        neighborhood.medianHomePrice,
        neighborhood.commuteTime,
        neighborhood.city,
      )

      const affordabilityGap = (neighborhood.medianSalePrice || neighborhood.medianHomePrice) - budget

      const calculateDataQuality = (): "High" | "Medium" | "Low" => {
        const now = new Date()
        const signals = [
          { present: neighborhood.priceUpdatedAt, timestamp: neighborhood.priceUpdatedAt },
          { present: neighborhood.rentMedian, timestamp: neighborhood.priceUpdatedAt },
          { present: neighborhood.schoolSignal, timestamp: neighborhood.schoolUpdatedAt },
          { present: neighborhood.parksCountPerSqMi, timestamp: neighborhood.parksUpdatedAt },
        ]

        const presentSignals = signals.filter((s) => s.present !== undefined && s.present !== null)

        if (presentSignals.length === 4) {
          const allRecent = presentSignals.every((s) => {
            if (!s.timestamp) return false
            const [year, month] = s.timestamp.split("-").map(Number)
            const signalDate = new Date(year, month - 1)
            const monthsDiff =
              (now.getFullYear() - signalDate.getFullYear()) * 12 + (now.getMonth() - signalDate.getMonth())
            return monthsDiff <= 12
          })
          if (allRecent) return "High"
        }

        if (presentSignals.length >= 2) {
          const recentCount = presentSignals.filter((s) => {
            if (!s.timestamp) return false
            const [year, month] = s.timestamp.split("-").map(Number)
            const signalDate = new Date(year, month - 1)
            const monthsDiff =
              (now.getFullYear() - signalDate.getFullYear()) * 12 + (now.getMonth() - signalDate.getMonth())
            return monthsDiff <= 18
          }).length

          if (recentCount >= 2) return "Medium"
        }

        return "Low"
      }

      const dataQuality = calculateDataQuality()

      const isPriceOutdated = (() => {
        if (!neighborhood.priceUpdatedAt) return false
        const now = new Date()
        const [year, month] = neighborhood.priceUpdatedAt.split("-").map(Number)
        const priceDate = new Date(year, month - 1)
        const monthsDiff = (now.getFullYear() - priceDate.getFullYear()) * 12 + (now.getMonth() - priceDate.getMonth())
        return monthsDiff > 18
      })()

      return {
        zipCode: neighborhood.zip,
        city: neighborhood.city,
        isd: neighborhood.isd, // Ensure ISD is included
        score: scored.adjustedScore,
        schools: schoolQualityScore / 10,
        crime: safetyStabilityScore / 10,
        affordability: affordabilityScore / 10,
        parks: parksScore / 10,
        reason,
        medianHomePrice: neighborhood.medianHomePrice,
        medianPrice: neighborhood.medianHomePrice, // Add medianPrice alias for budget display
        commuteTime: neighborhood.commuteTime,
        climate: neighborhood.climate,
        futureGrowth: futureGrowthScore,
        affordabilityGap,
        priceUpdatedAt: neighborhood.priceUpdatedAt,
        schoolUpdatedAt: neighborhood.schoolUpdatedAt,
        safetyUpdatedAt: neighborhood.safetyUpdatedAt,
        parksUpdatedAt: neighborhood.parksUpdatedAt,
        dataQuality,
        isPriceOutdated,
        localExplanation: neighborhood.localExplanation,
        safetySignal: neighborhood.safetySignal,
        restaurantCount: neighborhood.restaurantUniqueCount,
        entertainmentCount: neighborhood.entertainmentCount,
        diversityIndex: neighborhood.restaurantDiversityIndex,
        parksPerSqMi: neighborhood.parksCountPerSqMi,
        hasTownCenter: neighborhood.hasTownCenter,
        convenienceScore: neighborhood.convenienceClusterScore,
        taxBurden: neighborhood.taxBurden,
        percentNewConstruction: neighborhood.percentNewConstruction,
        rawData: {
          medianSalePrice: neighborhood.medianSalePrice || neighborhood.medianHomePrice,
          rentMedian: neighborhood.rentMedian,
          schoolSignal: neighborhood.schoolSignal,
          safetyBand: neighborhood.safetySignal,
          parksCountPerSqMi: neighborhood.parksCountPerSqMi,
          sources: neighborhood.sources || [],
          restaurantUniqueCount: neighborhood.restaurantUniqueCount,
          restaurantDiversityIndex: neighborhood.restaurantDiversityIndex,
          entertainmentCount: neighborhood.entertainmentCount,
          convenienceClusterScore: neighborhood.convenienceClusterScore,
          hasTownCenter: neighborhood.hasTownCenter,
        },
        scoringDetails: scored,
        modifiers: scored.modifiers,
      }
    })

    results.sort((a, b) => b.score - a.score)

    if (DEBUG) {
      const zip75007Result = results.find((r) => r.zipCode === "75007")
      const zip75007Index = results.findIndex((r) => r.zipCode === "75007")
      if (zip75007Result) {
        console.log(`[v0] 75007 position in sorted results: ${zip75007Index + 1} of ${results.length}`)
        console.log(`[v0] 75007 score: ${zip75007Result.score.toFixed(1)}, price: ${zip75007Result.medianHomePrice}`)
      } else {
        console.log("[v0] 75007 NOT FOUND in results array")
      }
    }

    const totalZips = results.length
    const criteriaKeys = [
      "schoolQuality",
      "commuteBurden",
      "safetyStability",
      "lifestyleConvenienceCulture",
      "childDevelopmentOpportunity",
      "taxBurden",
      "tollRoadConvenience",
    ] as const

    const rankings: Record<string, Record<string, number>> = {}

    for (const key of criteriaKeys) {
      // Sort all results by this criterion's raw score (descending)
      const sortedByKey = [...results].sort((a, b) => {
        const scoreA = a.scoringDetails?.perCriterion?.[key]?.score || 0
        const scoreB = b.scoringDetails?.perCriterion?.[key]?.score || 0
        return scoreB - scoreA
      })

      // Assign rankings
      sortedByKey.forEach((r, idx) => {
        if (!rankings[r.zipCode]) rankings[r.zipCode] = {}
        rankings[r.zipCode][key] = idx + 1
      })
    }

    // Add rankings to each result
    const resultsWithRankings = results.map((r) => ({
      ...r,
      criteriaRankings: rankings[r.zipCode] || {},
      totalZipsCompared: totalZips,
    }))

    if (DEBUG) {
      console.log(
        "[v0] Top 5 after sorting by score:",
        resultsWithRankings.slice(0, 5).map((r) => `${r.city} (${r.zipCode}): ${r.score.toFixed(1)}`),
      )
    }

    const withinBudget = resultsWithRankings.filter((r) => r.medianHomePrice <= budgetThreshold)

    if (DEBUG) {
      const zip75007InBudget = withinBudget.find((r) => r.zipCode === "75007")
      console.log(`[v0] Budget threshold: ${budgetThreshold}, 75007 in withinBudget: ${zip75007InBudget ? "Yes" : "No"}`)
      if (zip75007InBudget) {
        const posInBudget = withinBudget.findIndex((r) => r.zipCode === "75007")
        console.log(`[v0] 75007 position in withinBudget: ${posInBudget + 1} of ${withinBudget.length}`)
      }
    }

    let finalResults: any[]
    let needsStretchBudget = false

    if (withinBudget.length >= 3) {
      finalResults = withinBudget.slice(0, 5)
    } else {
      needsStretchBudget = true
      const withinRelaxedBudget = resultsWithRankings.filter((r) => r.medianHomePrice <= relaxedBudgetThreshold)

      if (withinRelaxedBudget.length > 0) {
        finalResults = withinRelaxedBudget.slice(0, 5).map((r) => ({
          ...r,
          isStretchBudget: r.medianHomePrice > budgetThreshold,
        }))
      } else {
        finalResults = resultsWithRankings.slice(0, 5).map((r) => ({
          ...r,
          isStretchBudget: true,
        }))
      }
    }

    if (DEBUG) {
      console.log(
        "[v0] Final results:",
        finalResults.map((r) => `${r.city} (${r.zipCode}): ${r.score.toFixed(1)}`),
      )
      const zip75007Final = finalResults.find((r: any) => r.zipCode === "75007")
      console.log(`[v0] 75007 in final results: ${zip75007Final ? "Yes" : "No"}`)
    }

    return NextResponse.json({ results: finalResults })
  } catch (error) {
    console.error("Error processing neighborhoods:", error)
    return NextResponse.json({ error: "Failed to process neighborhoods" }, { status: 500 })
  }
}
