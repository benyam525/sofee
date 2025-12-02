// DFW ZIP code centroids and areas for reverse geocoding
// Data from Census Bureau TIGER/Line Shapefiles (approximate centroids)

export interface ZipCentroid {
  zip: string
  lat: number
  lon: number
  areaSqMi: number
  city: string
}

export const DFW_ZIP_CENTROIDS: ZipCentroid[] = [
  { zip: '75034', lat: 33.150, lon: -96.835, areaSqMi: 22.5, city: 'Frisco' },
  { zip: '75035', lat: 33.180, lon: -96.820, areaSqMi: 18.3, city: 'Frisco' },
  { zip: '75068', lat: 33.120, lon: -96.810, areaSqMi: 15.7, city: 'Little Elm' },
  { zip: '75013', lat: 33.103, lon: -96.670, areaSqMi: 21.8, city: 'Allen' },
  { zip: '75002', lat: 33.080, lon: -96.655, areaSqMi: 19.4, city: 'Allen' },
  { zip: '75070', lat: 33.197, lon: -96.615, areaSqMi: 24.6, city: 'McKinney' },
  { zip: '75071', lat: 33.160, lon: -96.580, areaSqMi: 26.3, city: 'McKinney' },
  { zip: '75074', lat: 33.019, lon: -96.698, areaSqMi: 23.1, city: 'Plano' },
  { zip: '75093', lat: 33.069, lon: -96.760, areaSqMi: 20.5, city: 'Plano' },
  { zip: '75078', lat: 33.270, lon: -96.805, areaSqMi: 28.7, city: 'Prosper' },
  { zip: '75009', lat: 33.330, lon: -96.790, areaSqMi: 32.4, city: 'Celina' },
  { zip: '76092', lat: 32.941, lon: -97.134, areaSqMi: 16.8, city: 'Southlake' },
  { zip: '76034', lat: 32.891, lon: -97.162, areaSqMi: 15.2, city: 'Colleyville' },
  { zip: '75006', lat: 32.954, lon: -96.890, areaSqMi: 19.6, city: 'Carrollton' },
  { zip: '75019', lat: 32.989, lon: -97.020, areaSqMi: 17.4, city: 'Coppell' },
  { zip: '75051', lat: 32.745, lon: -96.998, areaSqMi: 22.9, city: 'Grand Prairie' },
]

// Calculate distance between two lat/lon points (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959 // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// Find nearest ZIP for given lat/lon coordinates
export function findNearestZip(lat: number, lon: number): ZipCentroid | null {
  if (!lat || !lon) return null
  
  let nearest: ZipCentroid | null = null
  let minDistance = Infinity
  
  for (const zipData of DFW_ZIP_CENTROIDS) {
    const distance = calculateDistance(lat, lon, zipData.lat, zipData.lon)
    if (distance < minDistance) {
      minDistance = distance
      nearest = zipData
    }
  }
  
  // Only return if within reasonable distance (15 miles)
  return minDistance < 15 ? nearest : null
}

// Get area for a specific ZIP
export function getZipArea(zip: string): number {
  const zipData = DFW_ZIP_CENTROIDS.find(z => z.zip === zip)
  return zipData?.areaSqMi || 20 // Default fallback
}
