import { NextResponse } from 'next/server'
import { ENABLE_LIVE_DATA, REVALIDATE_MINUTES, DFW_BBOX } from '@/lib/config'
import { mergeZipData } from '@/lib/cache'
import { findNearestZip, getZipArea, DFW_ZIP_CENTROIDS } from '@/lib/zipCentroids'
import { fetchWithRetry } from '@/lib/fetchWithRetry'

export async function GET() {
  const source = 'parks'
  const timestamp = new Date().toISOString()
  
  if (!ENABLE_LIVE_DATA) {
    console.log(`[${timestamp}] [${source}] Live data fetching is disabled`)
    return NextResponse.json(
      { ok: false, reason: 'Live data fetching is disabled' },
      { status: 403 }
    )
  }

  try {
    const overpassQuery = `
      [out:json][timeout:25];
      (
        node["leisure"="park"](${DFW_BBOX.south},${DFW_BBOX.west},${DFW_BBOX.north},${DFW_BBOX.east});
        way["leisure"="park"](${DFW_BBOX.south},${DFW_BBOX.west},${DFW_BBOX.north},${DFW_BBOX.east});
        relation["leisure"="park"](${DFW_BBOX.south},${DFW_BBOX.west},${DFW_BBOX.north},${DFW_BBOX.east});
      );
      out center;
    `

    console.log(`[${timestamp}] [${source}] Fetching from Overpass API`)
    const response = await fetchWithRetry('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: overpassQuery,
      headers: { 'Content-Type': 'text/plain' },
      timeoutMs: 10000,
      maxRetries: 2,
      specialRetryFor429: true // Wait 30s on 429 errors
    })

    if (!response.ok) {
      throw new Error(`Overpass API failed: ${response.statusText}`)
    }

    const data = await response.json()
    
    const zipParksCount: Record<string, number> = {}
    DFW_ZIP_CENTROIDS.forEach(z => {
      zipParksCount[z.zip] = 0
    })

    if (data.elements && Array.isArray(data.elements)) {
      for (const element of data.elements) {
        let lat: number | null = null
        let lon: number | null = null

        // Extract coordinates based on element type
        if (element.type === 'node') {
          lat = element.lat
          lon = element.lon
        } else if (element.center) {
          // Ways and relations have center property
          lat = element.center.lat
          lon = element.center.lon
        }

        if (lat && lon) {
          const nearestZip = findNearestZip(lat, lon)
          if (nearestZip) {
            zipParksCount[nearestZip.zip] = (zipParksCount[nearestZip.zip] || 0) + 1
          }
        }
      }
    }

    const currentMonth = new Date().toISOString().slice(0, 7)
    const mappedData = Object.entries(zipParksCount).map(([zip, count]) => {
      const areaSqMi = getZipArea(zip)
      const density = count / areaSqMi
      
      return {
        zip,
        parksCountPerSqMi: Math.round(density * 10) / 10, // Round to 1 decimal
        parksUpdatedAt: currentMonth,
        sources: ['OSM Overpass']
      }
    })

    console.log(`[${timestamp}] [${source}] Processed ${data.elements?.length || 0} parks across ${mappedData.length} ZIPs`)

    const updatedCount = await mergeZipData('parks', mappedData)

    console.log(`[${timestamp}] [${source}] Successfully updated ${updatedCount} ZIPs`)

    return NextResponse.json({
      ok: true,
      updated: updatedCount,
      totalParks: data.elements?.length || 0,
      updatedAt: timestamp
    })

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    console.error(`[${timestamp}] [${source}] Error refreshing parks data:`, errorMsg)
    return NextResponse.json(
      { ok: false, reason: `Failed to refresh parks data: ${errorMsg}` },
      { status: 500 }
    )
  }
}
