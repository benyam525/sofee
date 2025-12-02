import { ZipSchoolSummary } from "@/types/schools"

export function schoolQualityIndex(z: ZipSchoolSummary): number | null {
  if (!z) return null
  // 0–100 scale combining average prof, pct A, negative volatility, positive trend
  const math = (z.avgProficiency.math ?? 0) * 100
  const read = (z.avgProficiency.reading ?? 0) * 100
  const avg = (math + read) / 2

  const aRated = z.pctRatedA ?? 0
  const volPenalty =
    100 -
    Math.min(
      100,
      ((z.volatility.math ?? 0) + (z.volatility.reading ?? 0)) * 100
    ) // lower vol -> higher score
  const trendBonus =
    Math.max(0, ((z.trend.math ?? 0) + (z.trend.reading ?? 0)) / 2) * 100 // positive trend helps

  const score =
    0.55 * avg + 0.25 * aRated + 0.1 * volPenalty + 0.1 * trendBonus
  return Math.round(Math.max(0, Math.min(100, score)))
}
