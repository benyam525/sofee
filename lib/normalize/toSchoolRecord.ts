import type { SchoolRecord, SchoolDemographics } from "@/types/schools"
import type { ParsedSD } from "../scrape/parseSchoolDigger"

function syntheticId(name: string | null, city: string | null): string {
  const base = `${(name || "").toLowerCase()}|${(city || "").toLowerCase()}`
  // Simple hash function
  let h = 0
  for (let i = 0; i < base.length; i++) {
    h = (h << 5) - h + base.charCodeAt(i)
    h |= 0
  }
  return `SD_${Math.abs(h)}`
}

function normalizeDemographics(raw: Record<string, number | null> | undefined): SchoolDemographics | null {
  if (!raw || Object.keys(raw).length === 0) return null

  return {
    white: raw["White"] ?? null,
    black: raw["Black"] ?? raw["African American"] ?? null,
    hispanic: raw["Hispanic"] ?? null,
    asian: raw["Asian"] ?? null,
    twoOrMore: raw["Two or more"] ?? null,
    nativeAmerican: raw["Native"] ?? null,
    pacificIslander: raw["Pacific"] ?? null,
    other: null,
  }
}

export function toSchoolRecord(p: ParsedSD): SchoolRecord {
  // Extract math and reading proficiency from subjects array
  const math = p.testing.subjects.find((s) => /Math/i.test(s.name))?.proficiencyPct ?? null
  const read = p.testing.subjects.find((s) => /(Reading|ELA)/i.test(s.name))?.proficiencyPct ?? null
  const yr = p.testing.year ?? new Date().getFullYear()

  const rankPercentile =
    p.ranking.stateRank && p.ranking.stateTotal
      ? Math.round((1 - p.ranking.stateRank / p.ranking.stateTotal) * 100)
      : null

  return {
    campusId: syntheticId(p.campus.name, p.campus.city),
    districtId: "", // SchoolDigger HTML doesn't provide TEA district IDs
    name: p.campus.name || "Unknown School",
    address: p.campus.address,
    city: p.campus.city,
    zip: p.campus.zip,
    level: p.campus.level,
    gradeSpan: p.campus.grades,
    studentCount: p.population.enrollment ?? null,
    studentTeacherRatio: p.population.studentTeacherRatio ?? null,
    year: yr,
    // Convert percentage (0-100) to decimal (0-1)
    staarMathProficiency: math == null ? null : math / 100,
    staarReadingProficiency: read == null ? null : read / 100,
    growthMath: null,
    growthReading: null,
    accountabilityRating: null, // Not reliably available in SchoolDigger HTML
    demographics: normalizeDemographics(p.population.demographics),
    stateRank: p.ranking.stateRank,
    stateTotal: p.ranking.stateTotal,
    rankPercentile,
    history: [],
    sources: ["SchoolDigger"],
    updatedAt: new Date().toISOString().slice(0, 7), // YYYY-MM format
  }
}
