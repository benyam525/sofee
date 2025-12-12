/**
 * Compute schoolSignal (0-100) from SchoolDigger data
 *
 * Formula:
 *   schoolSignal = (avgProficiency * 100 * 0.7) + (pctRatedA * 0.3)
 *
 * Where:
 *   - avgProficiency = average of math and reading proficiency (0-1 scale)
 *   - pctRatedA = percentage of schools rated A by TEA (0-100)
 *   - 70% weight on test scores, 30% on accountability rating
 */

import fs from "fs"
import path from "path"

interface ZipSchoolSummary {
  zip: string
  year: number
  counts: { total: number; ES: number; MS: number; HS: number }
  avgProficiency: { math: number | null; reading: number | null }
  pctRatedA: number | null
  updatedAt: string
  source: string
}

interface DfwDataEntry {
  zip: string
  city: string
  isd: string
  schoolSignal: number
  schoolUpdatedAt: string
  [key: string]: unknown
}

function computeSchoolSignal(summary: ZipSchoolSummary): number | null {
  const { avgProficiency } = summary

  // Need at least proficiency data
  if (avgProficiency.math === null && avgProficiency.reading === null) {
    return null
  }

  // Average the proficiency scores (handle missing values)
  let avgProf: number
  if (avgProficiency.math !== null && avgProficiency.reading !== null) {
    avgProf = (avgProficiency.math + avgProficiency.reading) / 2
  } else if (avgProficiency.math !== null) {
    avgProf = avgProficiency.math
  } else {
    avgProf = avgProficiency.reading!
  }

  // schoolSignal = average STAAR proficiency (0-100 scale)
  // This is the most direct measure of educational outcomes
  return Math.round(avgProf * 100)
}

function main() {
  const summariesPath = path.resolve("public/data/zip_school_summaries.json")
  const dfwDataPath = path.resolve("data/dfwData.json")

  // Read summaries
  const summaries: ZipSchoolSummary[] = JSON.parse(fs.readFileSync(summariesPath, "utf8"))

  // Read current dfwData
  const dfwData: DfwDataEntry[] = JSON.parse(fs.readFileSync(dfwDataPath, "utf8"))

  // Create lookup by ZIP
  const summaryByZip = new Map<string, ZipSchoolSummary>()
  for (const s of summaries) {
    summaryByZip.set(s.zip, s)
  }

  // Track changes
  const changes: Array<{ zip: string; old: number; new: number; diff: number }> = []

  // Update dfwData with computed signals
  for (const entry of dfwData) {
    const summary = summaryByZip.get(entry.zip)
    if (!summary) {
      console.log(`No summary found for ZIP ${entry.zip}`)
      continue
    }

    const newSignal = computeSchoolSignal(summary)
    if (newSignal === null) {
      console.log(`Could not compute signal for ZIP ${entry.zip} (missing data)`)
      continue
    }

    const oldSignal = entry.schoolSignal
    if (oldSignal !== newSignal) {
      changes.push({
        zip: entry.zip,
        old: oldSignal,
        new: newSignal,
        diff: newSignal - oldSignal
      })
    }

    entry.schoolSignal = newSignal
    entry.schoolUpdatedAt = summary.updatedAt

    // Update sources to include SchoolDigger if not present
    const sources = entry.sources as string[]
    if (!sources.includes("SchoolDigger")) {
      // Replace GreatSchools with SchoolDigger if present
      const gsIndex = sources.indexOf("GreatSchools")
      if (gsIndex >= 0) {
        sources[gsIndex] = "SchoolDigger"
      } else {
        sources.unshift("SchoolDigger")
      }
    }
  }

  // Write updated dfwData
  fs.writeFileSync(dfwDataPath, JSON.stringify(dfwData, null, 2))

  // Print summary
  console.log("\n=== School Signal Update Summary ===\n")
  console.log(`Updated ${changes.length} ZIP codes\n`)

  if (changes.length > 0) {
    console.log("Changes:")
    changes
      .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))
      .forEach(c => {
        const direction = c.diff > 0 ? "+" : ""
        console.log(`  ${c.zip}: ${c.old} → ${c.new} (${direction}${c.diff})`)
      })
  }

  // Show all ZIPs with their new signals
  console.log("\n=== All ZIP School Signals (from SchoolDigger) ===\n")
  dfwData
    .sort((a, b) => b.schoolSignal - a.schoolSignal)
    .forEach(d => {
      const summary = summaryByZip.get(d.zip)
      const profStr = summary?.avgProficiency
        ? `Math: ${((summary.avgProficiency.math || 0) * 100).toFixed(0)}%, Read: ${((summary.avgProficiency.reading || 0) * 100).toFixed(0)}%`
        : "N/A"
      console.log(`  ${d.zip} (${d.city}): ${d.schoolSignal}/100 — ${profStr}`)
    })
}

main()
