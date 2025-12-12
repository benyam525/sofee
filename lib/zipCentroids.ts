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
  // Frisco
  { zip: '75034', lat: 33.150, lon: -96.835, areaSqMi: 22.5, city: 'Frisco' },
  { zip: '75035', lat: 33.180, lon: -96.820, areaSqMi: 18.3, city: 'Frisco' },
  // Allen
  { zip: '75002', lat: 33.080, lon: -96.655, areaSqMi: 19.4, city: 'Allen' },
  { zip: '75013', lat: 33.103, lon: -96.670, areaSqMi: 21.8, city: 'Allen' },
  // McKinney
  { zip: '75069', lat: 33.198, lon: -96.639, areaSqMi: 18.2, city: 'McKinney' },
  { zip: '75070', lat: 33.197, lon: -96.615, areaSqMi: 24.6, city: 'McKinney' },
  { zip: '75071', lat: 33.160, lon: -96.580, areaSqMi: 26.3, city: 'McKinney' },
  { zip: '75072', lat: 33.175, lon: -96.695, areaSqMi: 22.1, city: 'McKinney' },
  // Plano
  { zip: '75023', lat: 33.054, lon: -96.732, areaSqMi: 17.8, city: 'Plano' },
  { zip: '75024', lat: 33.070, lon: -96.798, areaSqMi: 19.2, city: 'Plano' },
  { zip: '75025', lat: 33.085, lon: -96.755, areaSqMi: 18.5, city: 'Plano' },
  { zip: '75074', lat: 33.019, lon: -96.698, areaSqMi: 23.1, city: 'Plano' },
  { zip: '75075', lat: 33.015, lon: -96.752, areaSqMi: 16.4, city: 'Plano' },
  { zip: '75093', lat: 33.069, lon: -96.760, areaSqMi: 20.5, city: 'Plano' },
  // Prosper
  { zip: '75078', lat: 33.270, lon: -96.805, areaSqMi: 28.7, city: 'Prosper' },
  // Celina
  { zip: '75009', lat: 33.330, lon: -96.790, areaSqMi: 32.4, city: 'Celina' },
  // Flower Mound
  { zip: '75022', lat: 33.014, lon: -97.078, areaSqMi: 16.3, city: 'Flower Mound' },
  { zip: '75028', lat: 33.035, lon: -97.115, areaSqMi: 21.7, city: 'Flower Mound' },
  // Southlake
  { zip: '76092', lat: 32.941, lon: -97.134, areaSqMi: 16.8, city: 'Southlake' },
  // Colleyville
  { zip: '76034', lat: 32.891, lon: -97.162, areaSqMi: 15.2, city: 'Colleyville' },
  // Carrollton
  { zip: '75006', lat: 32.954, lon: -96.890, areaSqMi: 19.6, city: 'Carrollton' },
  { zip: '75007', lat: 32.978, lon: -96.895, areaSqMi: 17.3, city: 'Carrollton' },
  { zip: '75010', lat: 33.005, lon: -96.910, areaSqMi: 18.1, city: 'Carrollton' },
  // Coppell
  { zip: '75019', lat: 32.989, lon: -97.020, areaSqMi: 17.4, city: 'Coppell' },
  // Grand Prairie
  { zip: '75052', lat: 32.745, lon: -96.998, areaSqMi: 22.9, city: 'Grand Prairie' },
  // Richardson
  { zip: '75080', lat: 32.948, lon: -96.730, areaSqMi: 14.2, city: 'Richardson' },
  { zip: '75081', lat: 32.932, lon: -96.708, areaSqMi: 12.8, city: 'Richardson' },
  { zip: '75082', lat: 32.978, lon: -96.685, areaSqMi: 15.1, city: 'Richardson' },
  // Irving
  { zip: '75038', lat: 32.868, lon: -96.975, areaSqMi: 16.7, city: 'Irving' },
  { zip: '75039', lat: 32.885, lon: -96.945, areaSqMi: 14.5, city: 'Irving' },
  { zip: '75062', lat: 32.845, lon: -96.955, areaSqMi: 18.3, city: 'Irving' },
  // Farmers Branch
  { zip: '75234', lat: 32.918, lon: -96.875, areaSqMi: 13.6, city: 'Farmers Branch' },
  { zip: '75244', lat: 32.935, lon: -96.845, areaSqMi: 11.9, city: 'Farmers Branch' },
  // Lewisville
  { zip: '75067', lat: 33.045, lon: -96.995, areaSqMi: 20.4, city: 'Lewisville' },
  { zip: '75077', lat: 33.072, lon: -97.015, areaSqMi: 18.8, city: 'Lewisville' },
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
