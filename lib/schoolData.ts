/**
 * School Data Utilities
 *
 * Provides helper functions for checking and managing school data
 * across the 27 supported ZIP codes.
 *
 * Implements Sofee Scoring Logic:
 * - Sofee Balanced Diversity Score (entropy-based with dominance penalty)
 * - Sofee Academic Score (rank percentile + proficiency blend)
 */

import { DFW_ZIPCITY } from "./scrape/dfwZips"
import type { SchoolRecord, SchoolDemographics } from "@/types/schools"

// In-memory cache for school data (populated on first load)
const schoolsCache: SchoolRecord[] | null = null
const rawSchoolsCache: SchoolDemographics[] | null = null

/**
 * Get all supported ZIP codes
 */
export function getSupportedZips(): string[] {
  return DFW_ZIPCITY.map((z) => z.zip)
}

/**
 * Check if we have school data for a specific ZIP code
 * Returns true if at least one school exists for this ZIP with demographics
 */
export function hasSchoolDataForZip(zip: string, schools: SchoolRecord[]): boolean {
  const zipSchools = schools.filter((s) => s.zip === zip)
  if (zipSchools.length === 0) return false

  // Check if at least some schools have demographics data
  const withDemographics = zipSchools.filter((s) => s.demographics && Object.keys(s.demographics).length > 0)
  return withDemographics.length > 0
}

/**
 * Check which ZIPs are missing school data
 * Returns array of ZIP codes that need to be scraped
 */
export function getMissingZips(schools: SchoolRecord[]): string[] {
  const supportedZips = getSupportedZips()
  return supportedZips.filter((zip) => !hasSchoolDataForZip(zip, schools))
}

/**
 * Check if all 27 ZIPs have been scraped with demographics
 */
export function hasAllSchoolData(schools: SchoolRecord[]): boolean {
  const missingZips = getMissingZips(schools)
  return missingZips.length === 0
}

/**
 * Get schools by ZIP code
 */
export function getSchoolsByZip(zip: string, schools: SchoolRecord[]): SchoolRecord[] {
  return schools.filter((s) => s.zip === zip)
}

/**
 * Get schools by district
 */
export function getSchoolsByDistrict(districtName: string, schools: SchoolRecord[]): SchoolRecord[] {
  return schools.filter(
    (s) =>
      s.districtId === districtName || s.sources.some((src) => src.toLowerCase().includes(districtName.toLowerCase())),
  )
}

/**
 * Calculate Sofee Academic Score (0-100) for a school
 *
 * Formula:
 * - RankPercentile = 100 * (1 - (rank_state - 1) / (num_schools_state - 1))
 * - Proficiency = average(math, reading)
 * - SofeeAcademic = 0.6 * RankPercentile + 0.4 * Proficiency
 */
export function calculateAcademicScore(
  stateRank: number,
  stateTotal: number,
  mathProf: number,
  readingProf: number,
): number
export function calculateAcademicScore(school: SchoolRecord): number | null
export function calculateAcademicScore(
  schoolOrRank: SchoolRecord | number,
  stateTotal?: number,
  mathProf?: number,
  readingProf?: number,
): number | null {
  // If called with raw values
  if (typeof schoolOrRank === "number") {
    const rank = schoolOrRank
    const proficiencyScore = ((mathProf ?? 0) + (readingProf ?? 0)) / 2

    if (stateTotal && stateTotal > 1) {
      const rankPercentile = 100 * (1 - (rank - 1) / (stateTotal - 1))
      return Math.round(0.6 * rankPercentile + 0.4 * proficiencyScore)
    }
    return Math.round(proficiencyScore)
  }

  // If called with SchoolRecord
  const school = schoolOrRank
  const math = school.staarMathProficiency
  const reading = school.staarReadingProficiency
  const rank = school.stateRank
  const total = school.stateTotal

  // If no test data, return null
  if (math === null && reading === null) return null

  // Calculate proficiency score (0-100)
  const mathScore = math !== null ? math * 100 : null
  const readingScore = reading !== null ? reading * 100 : null

  let proficiencyScore: number
  if (mathScore !== null && readingScore !== null) {
    proficiencyScore = (mathScore + readingScore) / 2
  } else {
    proficiencyScore = mathScore ?? readingScore ?? 0
  }

  // Calculate rank percentile if we have rank data
  if (rank !== null && total !== null && total > 1) {
    const rankPercentile = 100 * (1 - (rank - 1) / (total - 1))
    return Math.round(0.6 * rankPercentile + 0.4 * proficiencyScore)
  }

  return Math.round(proficiencyScore)
}

/**
 * Get academic score label for parent-friendly display
 */
export function getAcademicLabel(score: number | null): string {
  if (score === null) return "Insufficient Data"
  if (score >= 80) return "Strong Academics"
  if (score >= 60) return "Solid Academics"
  if (score >= 40) return "Below Average"
  return "Weak Academics"
}

/**
 * Calculate Sofee Balanced Diversity Score (0-100) for a school
 *
 * Formula:
 * 1. Entropy-based balance score:
 *    H = -Σ[p_i * ln(p_i)]
 *    H_norm = H / ln(N)
 *    BalanceScore = 100 * H_norm
 *
 * 2. Dominance Penalty:
 *    p_max = max(p_i)
 *    If p_max >= 0.80 → DominanceScore = 0
 *    If p_max <= 0.40 → DominanceScore = 100
 *    Else: DominanceScore = 100 * (0.80 - p_max) / 0.40
 *
 * 3. Final: SofeeDiversity = 0.6 * BalanceScore + 0.4 * DominanceScore
 */
export function calculateDiversityScore(demographics: {
  white?: number | null
  black?: number | null
  hispanic?: number | null
  asian?: number | null
  other?: number | null
}): number
export function calculateDiversityScore(school: SchoolRecord): number | null
export function calculateDiversityScore(
  schoolOrDemo:
    | SchoolRecord
    | {
        white?: number | null
        black?: number | null
        hispanic?: number | null
        asian?: number | null
        other?: number | null
      },
): number | null {
  // Determine if it's a SchoolRecord or demographics object
  const demo = "demographics" in schoolOrDemo ? schoolOrDemo.demographics : schoolOrDemo

  if (!demo) return null

  // Get all demographic proportions (as decimals 0-1)
  // Convert percentages (0-100) to decimals (0-1) if needed
  const white = (demo.white ?? 0) > 1 ? (demo.white ?? 0) / 100 : (demo.white ?? 0)
  const black = (demo.black ?? 0) > 1 ? (demo.black ?? 0) / 100 : (demo.black ?? 0)
  const hispanic = (demo.hispanic ?? 0) > 1 ? (demo.hispanic ?? 0) / 100 : (demo.hispanic ?? 0)
  const asian = (demo.asian ?? 0) > 1 ? (demo.asian ?? 0) / 100 : (demo.asian ?? 0)
  const other =
    "other" in demo
      ? (demo.other ?? 0)
      : (("twoOrMore" in demo ? (demo as any).twoOrMore : 0) ?? 0) +
        (("nativeAmerican" in demo ? (demo as any).nativeAmerican : 0) ?? 0) +
        (("pacificIslander" in demo ? (demo as any).pacificIslander : 0) ?? 0)
  const otherNorm = other > 1 ? other / 100 : other

  const proportions = [white, black, hispanic, asian, otherNorm].filter((v) => v > 0)

  if (proportions.length === 0) return null

  // Normalize proportions to sum to 1
  const total = proportions.reduce((a, b) => a + b, 0)
  if (total === 0) return null
  const normalizedProps = proportions.map((p) => p / total)

  // H = -Σ[p_i * ln(p_i)]
  let entropy = 0
  for (const p of normalizedProps) {
    if (p > 0) {
      entropy -= p * Math.log(p)
    }
  }

  // Normalize entropy: H_norm = H / ln(N)
  const maxEntropy = Math.log(normalizedProps.length)
  const normalizedEntropy = maxEntropy > 0 ? entropy / maxEntropy : 0
  const balanceScore = 100 * normalizedEntropy

  const pMax = Math.max(...normalizedProps)
  let dominanceScore: number

  if (pMax >= 0.8) {
    dominanceScore = 0
  } else if (pMax <= 0.4) {
    dominanceScore = 100
  } else {
    dominanceScore = (100 * (0.8 - pMax)) / 0.4
  }

  // Final score: 60% balance + 40% dominance
  const finalScore = 0.6 * balanceScore + 0.4 * dominanceScore

  return Math.round(Math.min(100, Math.max(0, finalScore)))
}

/**
 * Get majority demographic group name
 */
export function getMajorityGroup(demo: SchoolDemographics | undefined): string {
  if (!demo) return "Unknown"

  const groups: { name: string; value: number }[] = [
    { name: "White", value: demo.white ?? 0 },
    { name: "Black", value: demo.black ?? 0 },
    { name: "Hispanic", value: demo.hispanic ?? 0 },
    { name: "Asian", value: demo.asian ?? 0 },
    { name: "Two or More Races", value: demo.twoOrMore ?? 0 },
  ]

  const sorted = groups.sort((a, b) => b.value - a.value)
  return sorted[0]?.name ?? "Unknown"
}

/**
 * Get diversity score label for parent-friendly display
 */
export function getDiversityLabel(score: number | null, demo?: SchoolDemographics): string {
  if (score === null) return "Insufficient Data"
  if (score >= 70) return "Balanced Diversity"
  if (score >= 40) return "Some Diversity (leans toward one group)"
  return `Mostly ${getMajorityGroup(demo)}`
}

/**
 * Calculate Sofee Fit Score (0-100) for a school
 *
 * Formula: SofeeFit = (SofeeAcademic + SofeeDiversity) / 2
 * Simple average gives equal weight to academics and diversity.
 */
export function calculateFitScore(academicScore: number | null, diversityScore: number | null): number | null {
  if (academicScore === null || diversityScore === null) return null
  return Math.round((academicScore + diversityScore) / 2)
}

/**
 * Get fit score label for parent-friendly display
 */
export function getFitLabel(score: number | null): string {
  if (score === null) return "Insufficient Data"
  if (score >= 80) return "Excellent Fit"
  if (score >= 70) return "Great Fit"
  if (score >= 60) return "Good Fit"
  if (score >= 50) return "Fair Fit"
  return "Below Average Fit"
}

/**
 * Get rank badge for top schools
 */
export function getRankBadge(rank: number): { label: string; color: string } | null {
  if (rank === 1) return { label: "Best Overall Fit", color: "bg-amber-100 text-amber-800 border-amber-300" }
  if (rank === 2 || rank === 3) return { label: "Great Fit", color: "bg-blue-100 text-blue-800 border-blue-300" }
  return null
}

/**
 * Get school data summary for School Clarity Grid
 */
export interface SchoolClarityData {
  campusId: string
  name: string
  zip: string
  city: string | null
  district: string
  level: "ES" | "MS" | "HS"
  gradeSpan: string | null
  enrollment: number | null
  fitScore: number | null
  fitLabel: string
  academicScore: number | null
  academicLabel: string
  diversityScore: number | null
  diversityLabel: string
  demographics: {
    white: number | null
    black: number | null
    hispanic: number | null
    asian: number | null
    other: number | null
  }
  proficiency: {
    math: number | null
    reading: number | null
  }
  stateRank: number | null
  stateTotal: number | null
  schoolType: "Public" | "Charter" | "Private"
}

export function getSchoolClarityData(schools: SchoolRecord[]): SchoolClarityData[] {
  return schools
    .filter((s) => s.zip && getSupportedZips().includes(s.zip))
    .map((s) => {
      const academicScore = calculateAcademicScore(s)
      const diversityScore = calculateDiversityScore(s)
      const fitScore = calculateFitScore(academicScore, diversityScore)

      return {
        campusId: s.campusId,
        name: s.name,
        zip: s.zip || "",
        city: s.city || null,
        district: s.districtId || s.sources[0] || "Unknown",
        level: s.level as "ES" | "MS" | "HS",
        gradeSpan: s.gradeSpan || null,
        enrollment: s.studentCount || null,
        fitScore,
        fitLabel: getFitLabel(fitScore),
        academicScore,
        academicLabel: getAcademicLabel(academicScore),
        diversityScore,
        diversityLabel: getDiversityLabel(diversityScore, s.demographics),
        demographics: {
          white: s.demographics?.white ?? null,
          black: s.demographics?.black ?? null,
          hispanic: s.demographics?.hispanic ?? null,
          asian: s.demographics?.asian ?? null,
          other:
            (s.demographics?.twoOrMore ?? 0) +
              (s.demographics?.nativeAmerican ?? 0) +
              (s.demographics?.pacificIslander ?? 0) || null,
        },
        proficiency: {
          math: s.staarMathProficiency ? Math.round(s.staarMathProficiency * 100) : null,
          reading: s.staarReadingProficiency ? Math.round(s.staarReadingProficiency * 100) : null,
        },
        stateRank: s.stateRank || null,
        stateTotal: s.stateTotal || null,
        schoolType: "Public",
      }
    })
}

/**
 * Get quadrant label for a school based on academic and diversity scores
 */
export function getQuadrantLabel(academicScore: number | null, diversityScore: number | null): string {
  if (academicScore === null || diversityScore === null) return "Insufficient Data"

  const isHighAcademic = academicScore >= 60
  const isHighDiversity = diversityScore >= 50

  if (isHighAcademic && isHighDiversity) return "Balanced & Strong"
  if (!isHighAcademic && isHighDiversity) return "Diverse but Lower Performing"
  if (isHighAcademic && !isHighDiversity) return "Strong but Less Diverse"
  return "Needs Improvement"
}
