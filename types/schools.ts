export type CampusLevel = "ES" | "MS" | "HS" | "K8" | "Other"

export interface SchoolDemographics {
  white?: number | null // percentage 0-100
  black?: number | null // percentage 0-100
  hispanic?: number | null // percentage 0-100
  asian?: number | null // percentage 0-100
  twoOrMore?: number | null // percentage 0-100
  nativeAmerican?: number | null // percentage 0-100
  pacificIslander?: number | null // percentage 0-100
  other?: number | null // percentage 0-100
  econDisadvantaged?: number | null // percentage 0-100
}

export interface SchoolRecord {
  campusId: string // TEA campus code (string)
  districtId: string // TEA district code
  name: string
  address?: string | null
  city?: string | null
  zip?: string | null // prefer TEA/NCES ZIP if present
  level: CampusLevel // ES/MS/HS/K8
  gradeSpan?: string | null // e.g., "PK-5"
  studentCount?: number | null
  studentTeacherRatio?: number | null

  // TEA / STAAR metrics (latest year)
  year: number // e.g., 2024
  staarMathProficiency?: number | null // 0–1
  staarReadingProficiency?: number | null // 0–1
  gradeLevelScores?: Array<{
    grade: number // 3, 4, 5, 6, 7, 8
    math: number | null // 0-1
    reading: number | null // 0-1
  }>
  growthMath?: number | null // optional growth
  growthReading?: number | null // optional growth
  accountabilityRating?: "A" | "B" | "C" | "D" | "F" | null

  demographics?: SchoolDemographics | null

  // Historical (optional; last 5 years if available)
  history?: Array<{
    year: number
    staarMathProficiency?: number | null
    staarReadingProficiency?: number | null
    accountabilityRating?: "A" | "B" | "C" | "D" | "F" | null
  }>

  stateRank?: number | null
  stateTotal?: number | null
  rankPercentile?: number | null // 0-100, calculated as (1 - rank/total) * 100

  latitude?: number | null
  longitude?: number | null

  // Source & freshness
  sources: string[] // e.g., ["TEA TAPR 2024"]
  updatedAt: string // "YYYY-MM"
}

export interface ZipSchoolSummary {
  zip: string
  year: number
  counts: { total: number; ES: number; MS: number; HS: number }
  avgProficiency: { math: number | null; reading: number | null }
  pctRatedA: number | null // % of campuses with A
  volatility: { math: number | null; reading: number | null } // std dev 5y
  trend: { math: number | null; reading: number | null } // slope 5y
  topPerformers: string[] // campusIds
  updatedAt: string
  source?: string // "TEA TAPR" | "SchoolDigger" | etc.
}

export interface SchoolRawData extends SchoolRecord {
  scraped: {
    url: string
    scrapedAt: string
    dataYear?: string | null
  }
}
