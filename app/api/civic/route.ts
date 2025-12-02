import { NextResponse } from "next/server"
import { fetchElectedOfficials, formatAddressForApi } from "@/lib/civic/googleCivicApi"
import {
  getBlendedPoliticalLean,
  getCityFromZip,
  getCountiesForZip,
  ZIP_COUNTY_MAPPING,
} from "@/lib/civic/texasElectionData"

// ZIP to city mapping (derived from ZIP_COUNTY_MAPPING)
const ZIP_TO_CITY: Record<string, string> = Object.fromEntries(ZIP_COUNTY_MAPPING.map((m) => [m.zip, m.city]))

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const zip = searchParams.get("zip")

  if (!zip) {
    return NextResponse.json({ error: "ZIP code required" }, { status: 400 })
  }

  const city = ZIP_TO_CITY[zip] || getCityFromZip(zip)
  const counties = getCountiesForZip(zip)

  if (!city || counties.length === 0) {
    return NextResponse.json(
      {
        error: `ZIP ${zip} not in Sofee's coverage area`,
        coverage: Object.keys(ZIP_TO_CITY),
      },
      { status: 404 },
    )
  }

  const politicalLean = getBlendedPoliticalLean(zip)

  const civicResponse = await fetchElectedOfficials(formatAddressForApi(zip, city, "TX"), undefined, zip)

  const officials = civicResponse.officials

  const officialsSource =
    civicResponse.source === "google_civic_api"
      ? "Google Civic Information API"
      : "Texas Secretary of State / Official Government Sources"

  const officialsWithSource = officials.map((o) => ({
    ...o,
    source: civicResponse.source === "google_civic_api" ? "Google Civic API" : "Texas SOS",
  }))

  return NextResponse.json({
    geo: {
      zip_code: zip,
      city,
      counties,
      state: "TX",
    },
    partisan_lean: politicalLean || {
      dem_share: 0,
      rep_share: 0,
      lean_label: "Data Unavailable",
      data_scope: "No election data available",
      counties_used: [],
    },
    elected_officials: officialsWithSource,
    data_sources: {
      officials: officialsSource,
      election_data: "Texas Secretary of State (2024 Presidential Election)",
      lean_calculation:
        politicalLean?.counties_used?.length > 1
          ? "Population-weighted blend of county-level results"
          : "County-level results",
    },
    meta: {
      api_status: civicResponse.source === "google_civic_api" ? "live" : "fallback",
      api_error: civicResponse.error || null,
      multi_county: counties.length > 1,
    },
  })
}
