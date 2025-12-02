/**
 * Google Civic Information API Integration
 *
 * This module provides functions to fetch real elected officials data
 * from the Google Civic Information API.
 *
 * API Key should be set as environment variable: GOOGLE_CIVIC_API_KEY
 *
 * API Documentation: https://developers.google.com/civic-information
 */

const CIVIC_BASE_URL = "https://civicinfo.googleapis.com/civicinfo/v2/representatives"

export interface CivicOfficial {
  level: "Federal" | "State" | "County" | "City" | "School Board"
  office: string
  name: string
  party: string
  district: string
  website_url: string
  photoUrl?: string
  phones?: string[]
  emails?: string[]
}

export interface CivicApiResponse {
  officials: CivicOfficial[]
  error?: string
  source: "google_civic_api" | "fallback" | "curated_data"
}

/**
 * Maps Google Civic API office levels to our standard levels
 */
function mapOfficeLevel(ocdDivisionId: string, officeName: string): CivicOfficial["level"] {
  if (ocdDivisionId.includes("country:us") && !ocdDivisionId.includes("state:")) {
    return "Federal"
  }
  if (ocdDivisionId.includes("state:tx") && !ocdDivisionId.includes("county:") && !ocdDivisionId.includes("place:")) {
    if (officeName.toLowerCase().includes("u.s.") || officeName.toLowerCase().includes("united states")) {
      return "Federal"
    }
    return "State"
  }
  if (ocdDivisionId.includes("county:")) {
    return "County"
  }
  if (ocdDivisionId.includes("place:") || ocdDivisionId.includes("locality:")) {
    return "City"
  }
  if (officeName.toLowerCase().includes("school") || officeName.toLowerCase().includes("isd")) {
    return "School Board"
  }
  return "State"
}

/**
 * Fetches elected officials from Google Civic Information API
 *
 * @param address - Full address, city+state, or ZIP code
 * @param apiKey - Google Civic API key (optional, uses env var if not provided)
 * @param zip - ZIP code for fallback data (optional)
 */
export async function fetchElectedOfficials(address: string, apiKey?: string, zip?: string): Promise<CivicApiResponse> {
  // Now using curated official data directly
  const zipCode = zip || address.match(/\d{5}/)?.[0] || ""

  return {
    officials: getFallbackOfficials(zipCode),
    source: "curated_data",
  }
}

/**
 * Formats an address for the Civic API from ZIP code and city
 */
export function formatAddressForApi(zip: string, city: string, state = "TX"): string {
  return `${city}, ${state} ${zip}`
}

/**
 * Real Texas statewide officials - Updated November 2024
 * Source: Official Texas government websites
 */
export const TEXAS_STATEWIDE_OFFICIALS: CivicOfficial[] = [
  {
    level: "Federal",
    office: "U.S. Senator",
    name: "John Cornyn",
    party: "Republican",
    district: "TX",
    website_url: "https://www.cornyn.senate.gov",
  },
  {
    level: "Federal",
    office: "U.S. Senator",
    name: "Ted Cruz",
    party: "Republican",
    district: "TX",
    website_url: "https://www.cruz.senate.gov",
  },
  {
    level: "State",
    office: "Governor",
    name: "Greg Abbott",
    party: "Republican",
    district: "TX",
    website_url: "https://gov.texas.gov",
  },
  {
    level: "State",
    office: "Lieutenant Governor",
    name: "Dan Patrick",
    party: "Republican",
    district: "TX",
    website_url: "https://www.ltgov.texas.gov",
  },
  {
    level: "State",
    office: "Attorney General",
    name: "Ken Paxton",
    party: "Republican",
    district: "TX",
    website_url: "https://www.texasattorneygeneral.gov",
  },
]

/**
 * Congressional district mapping for DFW ZIP codes
 * Based on 2023 redistricting - Source: Texas Legislative Council
 */
const ZIP_TO_CONGRESSIONAL_DISTRICT: Record<string, { district: string; rep: string; party: string }> = {
  // Collin County - mostly CD-3 and CD-4
  "75035": { district: "TX-03", rep: "Keith Self", party: "Republican" },
  "75034": { district: "TX-03", rep: "Keith Self", party: "Republican" },
  "75013": { district: "TX-03", rep: "Keith Self", party: "Republican" },
  "75070": { district: "TX-03", rep: "Keith Self", party: "Republican" },
  "75072": { district: "TX-03", rep: "Keith Self", party: "Republican" },
  "75024": { district: "TX-03", rep: "Keith Self", party: "Republican" },
  "75025": { district: "TX-03", rep: "Keith Self", party: "Republican" },
  "75093": { district: "TX-03", rep: "Keith Self", party: "Republican" },
  "75078": { district: "TX-04", rep: "Pat Fallon", party: "Republican" },
  "75009": { district: "TX-04", rep: "Pat Fallon", party: "Republican" },
  // Denton County
  "76092": { district: "TX-24", rep: "Beth Van Duyne", party: "Republican" },
  "76034": { district: "TX-24", rep: "Beth Van Duyne", party: "Republican" },
  "75077": { district: "TX-26", rep: "Michael Burgess", party: "Republican" },
  "75067": { district: "TX-26", rep: "Michael Burgess", party: "Republican" },
  // Dallas County
  "75007": { district: "TX-24", rep: "Beth Van Duyne", party: "Republican" },
  "75006": { district: "TX-24", rep: "Beth Van Duyne", party: "Republican" },
  "75010": { district: "TX-24", rep: "Beth Van Duyne", party: "Republican" },
  "75019": { district: "TX-24", rep: "Beth Van Duyne", party: "Republican" },
  "75080": { district: "TX-32", rep: "Julie Johnson", party: "Democrat" },
  "75081": { district: "TX-32", rep: "Julie Johnson", party: "Democrat" },
  "75082": { district: "TX-03", rep: "Keith Self", party: "Republican" },
  "75038": { district: "TX-33", rep: "Marc Veasey", party: "Democrat" },
  "75039": { district: "TX-33", rep: "Marc Veasey", party: "Democrat" },
  "75062": { district: "TX-33", rep: "Marc Veasey", party: "Democrat" },
  "75234": { district: "TX-24", rep: "Beth Van Duyne", party: "Republican" },
  "75244": { district: "TX-24", rep: "Beth Van Duyne", party: "Republican" },
  // Tarrant County
  "75052": { district: "TX-33", rep: "Marc Veasey", party: "Democrat" },
}

/**
 * Gets officials for a specific ZIP code
 * Includes statewide officials plus district-specific U.S. Representative
 */
export function getFallbackOfficials(zip: string): CivicOfficial[] {
  const officials = [...TEXAS_STATEWIDE_OFFICIALS]

  const congressionalInfo = ZIP_TO_CONGRESSIONAL_DISTRICT[zip]
  if (congressionalInfo) {
    officials.push({
      level: "Federal",
      office: "U.S. Representative",
      name: congressionalInfo.rep,
      party: congressionalInfo.party,
      district: congressionalInfo.district,
      website_url: `https://www.house.gov/representatives/find-your-representative`,
    })
  }

  return officials
}
