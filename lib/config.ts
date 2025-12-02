// Configuration for live data fetching

export const ENABLE_LIVE_DATA = process.env.ENABLE_LIVE_DATA === 'true'

export const REVALIDATE_MINUTES = parseInt(
  process.env.REVALIDATE_MINUTES || '1440',
  10
)

// DFW metropolitan area bounding box (approximate)
export const DFW_BBOX = {
  south: 32.55,
  west: -97.5,
  north: 33.35,
  east: -96.5,
}

// Data source URLs from environment variables
export const SOURCES = {
  prices: process.env.PRICES_URL || '',
  schools: process.env.SCHOOLS_URL || '',
  // Parks will be constructed via Overpass API, no URL needed
}
