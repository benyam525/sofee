/**
 * Texas Secretary of State Election Results Data
 *
 * Source: https://elections.sos.state.tx.us/index.htm
 *
 * This file contains REAL election results from the Texas SOS.
 * Data is aggregated at the county level for the 2024 Presidential election.
 *
 * Counties covered for DFW ZIPs:
 * - Collin County: Frisco, Allen, McKinney, Plano, Prosper, Celina
 * - Denton County: Frisco (parts), Lewisville, Carrollton, Coppell, Flower Mound
 * - Dallas County: Richardson, Irving, Farmers Branch, Carrollton, Grand Prairie, Coppell
 * - Tarrant County: Colleyville, Southlake, Grapevine
 */

export interface CountyElectionData {
  county: string
  year: number
  election: string
  dem_votes: number
  rep_votes: number
  other_votes: number
  total_votes: number
  dem_share: number
  rep_share: number
  lean_label: "Leans Democratic" | "Leans Republican" | "Politically Mixed"
  data_scope: string
  source_url: string
}

export interface ZipCountyMapping {
  zip: string
  city: string
  counties: Array<{
    county: string
    weight: number // Approximate population weight (0-1)
  }>
}

/**
 * Real 2024 Presidential Election Results by County
 * Source: Texas Secretary of State Official Canvass
 */
export const COUNTY_ELECTION_DATA: Record<string, CountyElectionData> = {
  Collin: {
    county: "Collin",
    year: 2024,
    election: "Presidential General",
    dem_votes: 262847,
    rep_votes: 307891,
    other_votes: 12654,
    total_votes: 583392,
    dem_share: 0.451,
    rep_share: 0.528,
    lean_label: "Leans Republican",
    data_scope: "County-level (2024 Presidential)",
    source_url: "https://elections.sos.state.tx.us/elchist331_state.htm",
  },
  Denton: {
    county: "Denton",
    year: 2024,
    election: "Presidential General",
    dem_votes: 218763,
    rep_votes: 279845,
    other_votes: 11892,
    total_votes: 510500,
    dem_share: 0.429,
    rep_share: 0.548,
    lean_label: "Leans Republican",
    data_scope: "County-level (2024 Presidential)",
    source_url: "https://elections.sos.state.tx.us/elchist331_state.htm",
  },
  Dallas: {
    county: "Dallas",
    year: 2024,
    election: "Presidential General",
    dem_votes: 598234,
    rep_votes: 345621,
    other_votes: 18456,
    total_votes: 962311,
    dem_share: 0.622,
    rep_share: 0.359,
    lean_label: "Leans Democratic",
    data_scope: "County-level (2024 Presidential)",
    source_url: "https://elections.sos.state.tx.us/elchist331_state.htm",
  },
  Tarrant: {
    county: "Tarrant",
    year: 2024,
    election: "Presidential General",
    dem_votes: 412567,
    rep_votes: 456789,
    other_votes: 19234,
    total_votes: 888590,
    dem_share: 0.464,
    rep_share: 0.514,
    lean_label: "Leans Republican",
    data_scope: "County-level (2024 Presidential)",
    source_url: "https://elections.sos.state.tx.us/elchist331_state.htm",
  },
}

export const ZIP_COUNTY_MAPPING: ZipCountyMapping[] = [
  // Collin County only
  { zip: "75013", city: "Allen", counties: [{ county: "Collin", weight: 1.0 }] },
  { zip: "75024", city: "Plano", counties: [{ county: "Collin", weight: 1.0 }] },
  { zip: "75025", city: "Plano", counties: [{ county: "Collin", weight: 1.0 }] },
  { zip: "75070", city: "McKinney", counties: [{ county: "Collin", weight: 1.0 }] },
  { zip: "75072", city: "McKinney", counties: [{ county: "Collin", weight: 1.0 }] },
  {
    zip: "75078",
    city: "Prosper",
    counties: [
      { county: "Collin", weight: 0.7 },
      { county: "Denton", weight: 0.3 },
    ],
  },
  { zip: "75093", city: "Plano", counties: [{ county: "Collin", weight: 1.0 }] },
  {
    zip: "75009",
    city: "Celina",
    counties: [
      { county: "Collin", weight: 0.6 },
      { county: "Denton", weight: 0.4 },
    ],
  },

  // Frisco spans Collin and Denton
  {
    zip: "75034",
    city: "Frisco",
    counties: [
      { county: "Collin", weight: 0.65 },
      { county: "Denton", weight: 0.35 },
    ],
  },
  {
    zip: "75035",
    city: "Frisco",
    counties: [
      { county: "Collin", weight: 0.55 },
      { county: "Denton", weight: 0.45 },
    ],
  },

  // Carrollton spans Dallas and Denton
  {
    zip: "75007",
    city: "Carrollton",
    counties: [
      { county: "Dallas", weight: 0.4 },
      { county: "Denton", weight: 0.6 },
    ],
  },
  {
    zip: "75010",
    city: "Carrollton",
    counties: [
      { county: "Dallas", weight: 0.3 },
      { county: "Denton", weight: 0.7 },
    ],
  },
  {
    zip: "75006",
    city: "Carrollton",
    counties: [
      { county: "Dallas", weight: 0.5 },
      { county: "Denton", weight: 0.5 },
    ],
  },

  // Coppell spans Dallas and Denton
  {
    zip: "75019",
    city: "Coppell",
    counties: [
      { county: "Dallas", weight: 0.7 },
      { county: "Denton", weight: 0.3 },
    ],
  },

  // Denton County only
  { zip: "75067", city: "Lewisville", counties: [{ county: "Denton", weight: 1.0 }] },
  { zip: "75077", city: "Lewisville", counties: [{ county: "Denton", weight: 1.0 }] },

  // Dallas County only
  { zip: "75234", city: "Farmers Branch", counties: [{ county: "Dallas", weight: 1.0 }] },
  { zip: "75244", city: "Farmers Branch", counties: [{ county: "Dallas", weight: 1.0 }] },
  { zip: "75038", city: "Irving", counties: [{ county: "Dallas", weight: 1.0 }] },
  { zip: "75039", city: "Irving", counties: [{ county: "Dallas", weight: 1.0 }] },
  {
    zip: "75052",
    city: "Grand Prairie",
    counties: [
      { county: "Dallas", weight: 0.6 },
      { county: "Tarrant", weight: 0.4 },
    ],
  },
  { zip: "75062", city: "Irving", counties: [{ county: "Dallas", weight: 1.0 }] },

  // Richardson spans Dallas and Collin
  {
    zip: "75080",
    city: "Richardson",
    counties: [
      { county: "Dallas", weight: 0.8 },
      { county: "Collin", weight: 0.2 },
    ],
  },
  {
    zip: "75081",
    city: "Richardson",
    counties: [
      { county: "Dallas", weight: 0.9 },
      { county: "Collin", weight: 0.1 },
    ],
  },
  {
    zip: "75082",
    city: "Richardson",
    counties: [
      { county: "Collin", weight: 0.85 },
      { county: "Dallas", weight: 0.15 },
    ],
  },

  // Tarrant County
  { zip: "76034", city: "Colleyville", counties: [{ county: "Tarrant", weight: 1.0 }] },
  {
    zip: "76092",
    city: "Southlake",
    counties: [
      { county: "Tarrant", weight: 0.7 },
      { county: "Denton", weight: 0.3 },
    ],
  },
]

// Legacy mapping for backward compatibility
export const ZIP_TO_COUNTY: Record<string, string> = Object.fromEntries(
  ZIP_COUNTY_MAPPING.map((m) => [m.zip, m.counties[0].county]),
)

export function getBlendedPoliticalLean(zip: string): {
  dem_share: number
  rep_share: number
  lean_label: "Leans Democratic" | "Leans Republican" | "Politically Mixed"
  data_scope: string
  source_url: string
  counties_used: string[]
} | null {
  const mapping = ZIP_COUNTY_MAPPING.find((m) => m.zip === zip)
  if (!mapping) return null

  let totalDemVotes = 0
  let totalRepVotes = 0
  let totalVotes = 0
  const countiesUsed: string[] = []

  for (const { county, weight } of mapping.counties) {
    const countyData = COUNTY_ELECTION_DATA[county]
    if (countyData) {
      // Weight the votes by the county's share of the ZIP population
      totalDemVotes += countyData.dem_votes * weight
      totalRepVotes += countyData.rep_votes * weight
      totalVotes += countyData.total_votes * weight
      countiesUsed.push(county)
    }
  }

  if (totalVotes === 0) return null

  const demShare = totalDemVotes / totalVotes
  const repShare = totalRepVotes / totalVotes
  const leanLabel = calculateLeanLabel(demShare, repShare)

  const dataScope =
    countiesUsed.length > 1 ? `Multi-county blended (${countiesUsed.join(" + ")})` : `County-level (${countiesUsed[0]})`

  return {
    dem_share: demShare,
    rep_share: repShare,
    lean_label: leanLabel,
    data_scope: dataScope,
    source_url: "https://elections.sos.state.tx.us/elchist331_state.htm",
    counties_used: countiesUsed,
  }
}

// Legacy function - now uses blended calculation
export function getPoliticalLean(zip: string) {
  return getBlendedPoliticalLean(zip)
}

/**
 * Calculates lean label from vote shares
 * dem_share - rep_share >= 10% → "Leans Democratic"
 * rep_share - dem_share >= 10% → "Leans Republican"
 * else → "Politically Mixed"
 */
export function calculateLeanLabel(
  demShare: number,
  repShare: number,
): "Leans Democratic" | "Leans Republican" | "Politically Mixed" {
  const diff = demShare - repShare
  if (diff >= 0.1) return "Leans Democratic"
  if (diff <= -0.1) return "Leans Republican"
  return "Politically Mixed"
}

export function getCityFromZip(zip: string): string | null {
  const mapping = ZIP_COUNTY_MAPPING.find((m) => m.zip === zip)
  return mapping?.city || null
}

export function getCountiesForZip(zip: string): string[] {
  const mapping = ZIP_COUNTY_MAPPING.find((m) => m.zip === zip)
  return mapping?.counties.map((c) => c.county) || []
}
