import zipToCounties from "@/data/zipToCounties.json"
import county2020 from "@/data/countyResults_2020_presidential.json"
import county2022 from "@/data/countyResults_2022_governor.json"

type ZipMeta = {
  city: string
  counties: string[]
  weights?: number[]
}

type RaceSummary = {
  dem_share: number
  rep_share: number
  lean_label: string
  data_scope: string
}

type PoliticalSpectrum = {
  margin: number
  label: string
  side: "Republican" | "Democratic" | "Mixed"
  intensity: "Far" | "Lean" | "Slight" | "None"
}

export type ZipVotingProfile = {
  zip_code: string
  city: string
  primary_counties: string[]
  is_multi_county: boolean
  presidential_2020: RaceSummary
  governor_2022: RaceSummary
  overall_lean: string
  political_spectrum: PoliticalSpectrum
  trend: {
    direction: "more_dem" | "more_rep" | "stable"
    shift_points: number
    description: string
  }
}

function computeLean(dem: number, rep: number, counties: string[]): RaceSummary {
  const totalMajor = dem + rep
  if (totalMajor === 0) {
    return {
      dem_share: 0,
      rep_share: 0,
      lean_label: "No data",
      data_scope: counties.length > 1 ? "blended county-level" : "county-level",
    }
  }
  const demShare = dem / totalMajor
  const repShare = rep / totalMajor

  let label: string
  if (demShare - repShare >= 0.1) label = "Leans Democratic"
  else if (repShare - demShare >= 0.1) label = "Leans Republican"
  else label = "Politically Mixed"

  return {
    dem_share: +demShare.toFixed(3),
    rep_share: +repShare.toFixed(3),
    lean_label: label,
    data_scope: counties.length > 1 ? "blended county-level" : "county-level",
  }
}

function computeOverallLean(pres: RaceSummary, gov: RaceSummary): string {
  const weightedDem = pres.dem_share * 0.7 + gov.dem_share * 0.3
  const weightedRep = pres.rep_share * 0.7 + gov.rep_share * 0.3

  if (weightedDem - weightedRep >= 0.1) return "Leans Democratic"
  if (weightedRep - weightedDem >= 0.1) return "Leans Republican"
  return "Politically Mixed"
}

function computePoliticalSpectrum(pres: RaceSummary, gov: RaceSummary): PoliticalSpectrum {
  // Weighted margin: 70% presidential + 30% governor
  const weightedDem = pres.dem_share * 0.7 + gov.dem_share * 0.3
  const weightedRep = pres.rep_share * 0.7 + gov.rep_share * 0.3
  const margin = weightedDem - weightedRep // positive = Dem, negative = Rep

  let label: string
  let side: "Republican" | "Democratic" | "Mixed"
  let intensity: "Far" | "Lean" | "Slight" | "None"

  if (margin >= 0.2) {
    label = "Far Democratic"
    side = "Democratic"
    intensity = "Far"
  } else if (margin >= 0.1) {
    label = "Lean Democratic"
    side = "Democratic"
    intensity = "Lean"
  } else if (margin >= 0.03) {
    label = "Slight Democratic"
    side = "Democratic"
    intensity = "Slight"
  } else if (margin <= -0.2) {
    label = "Far Republican"
    side = "Republican"
    intensity = "Far"
  } else if (margin <= -0.1) {
    label = "Lean Republican"
    side = "Republican"
    intensity = "Lean"
  } else if (margin <= -0.03) {
    label = "Slight Republican"
    side = "Republican"
    intensity = "Slight"
  } else {
    label = "Politically Mixed"
    side = "Mixed"
    intensity = "None"
  }

  return {
    margin: +margin.toFixed(3),
    label,
    side,
    intensity,
  }
}

function computeTrend(
  pres: RaceSummary,
  gov: RaceSummary,
): { direction: "more_dem" | "more_rep" | "stable"; shift_points: number; description: string } {
  const presMargin = pres.dem_share - pres.rep_share
  const govMargin = gov.dem_share - gov.rep_share
  const shift = govMargin - presMargin
  const shiftPoints = Math.abs(shift * 100)

  if (shift > 0.02) {
    return {
      direction: "more_dem",
      shift_points: +shiftPoints.toFixed(1),
      description: `+${shiftPoints.toFixed(1)} pts more Democratic from 2020 → 2022`,
    }
  } else if (shift < -0.02) {
    return {
      direction: "more_rep",
      shift_points: +shiftPoints.toFixed(1),
      description: `+${shiftPoints.toFixed(1)} pts more Republican from 2020 → 2022`,
    }
  }
  return {
    direction: "stable",
    shift_points: +shiftPoints.toFixed(1),
    description: "Politically stable between 2020 → 2022",
  }
}

export function getZipVotingProfile(zip: string): ZipVotingProfile | null {
  const meta = (zipToCounties as Record<string, ZipMeta>)[zip]
  if (!meta) return null

  const counties: string[] = meta.counties
  if (!counties || counties.length === 0) return null

  const weights = meta.weights || counties.map(() => 1 / counties.length)

  // Weighted sum of county results
  const presTotals = { dem: 0, rep: 0 }
  const govTotals = { dem: 0, rep: 0 }

  counties.forEach((c, i) => {
    const weight = weights[i] || 1 / counties.length
    const c20 = (county2020 as Record<string, { dem: number; rep: number }>)[c]
    const c22 = (county2022 as Record<string, { dem: number; rep: number }>)[c]

    if (c20) {
      const total20 = c20.dem + c20.rep
      if (total20 > 0) {
        presTotals.dem += (c20.dem / total20) * weight
        presTotals.rep += (c20.rep / total20) * weight
      }
    }
    if (c22) {
      const total22 = c22.dem + c22.rep
      if (total22 > 0) {
        govTotals.dem += (c22.dem / total22) * weight
        govTotals.rep += (c22.rep / total22) * weight
      }
    }
  })

  const presTotal = presTotals.dem + presTotals.rep
  const govTotal = govTotals.dem + govTotals.rep

  const presidential_2020 = computeLean(
    presTotal > 0 ? presTotals.dem / presTotal : 0,
    presTotal > 0 ? presTotals.rep / presTotal : 0,
    counties,
  )
  presidential_2020.dem_share = presTotal > 0 ? +(presTotals.dem / presTotal).toFixed(3) : 0
  presidential_2020.rep_share = presTotal > 0 ? +(presTotals.rep / presTotal).toFixed(3) : 0

  const governor_2022 = computeLean(
    govTotal > 0 ? govTotals.dem / govTotal : 0,
    govTotal > 0 ? govTotals.rep / govTotal : 0,
    counties,
  )
  governor_2022.dem_share = govTotal > 0 ? +(govTotals.dem / govTotal).toFixed(3) : 0
  governor_2022.rep_share = govTotal > 0 ? +(govTotals.rep / govTotal).toFixed(3) : 0

  // Recalculate lean labels
  if (presidential_2020.dem_share - presidential_2020.rep_share >= 0.1) {
    presidential_2020.lean_label = "Leans Democratic"
  } else if (presidential_2020.rep_share - presidential_2020.dem_share >= 0.1) {
    presidential_2020.lean_label = "Leans Republican"
  } else {
    presidential_2020.lean_label = "Politically Mixed"
  }

  if (governor_2022.dem_share - governor_2022.rep_share >= 0.1) {
    governor_2022.lean_label = "Leans Democratic"
  } else if (governor_2022.rep_share - governor_2022.dem_share >= 0.1) {
    governor_2022.lean_label = "Leans Republican"
  } else {
    governor_2022.lean_label = "Politically Mixed"
  }

  return {
    zip_code: zip,
    city: meta.city,
    primary_counties: counties,
    is_multi_county: counties.length > 1,
    presidential_2020,
    governor_2022,
    overall_lean: computeOverallLean(presidential_2020, governor_2022),
    political_spectrum: computePoliticalSpectrum(presidential_2020, governor_2022),
    trend: computeTrend(presidential_2020, governor_2022),
  }
}

export function getAllSupportedZips(): string[] {
  return Object.keys(zipToCounties)
}
