import { NextResponse } from 'next/server'
import { ENABLE_LIVE_DATA, REVALIDATE_MINUTES, SOURCES } from '@/lib/config'
import { mergeZipData } from '@/lib/cache'
import { fetchWithRetry } from '@/lib/fetchWithRetry'

const DFW_COUNTIES = ['Dallas', 'Collin', 'Denton', 'Tarrant']

function parseCSV(csvText: string): Record<string, string>[] {
  const lines = csvText.trim().split('\n')
  if (lines.length < 2) return []
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
  const rows: Record<string, string>[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
    const row: Record<string, string> = {}
    
    headers.forEach((header, index) => {
      row[header] = values[index] || ''
    })
    
    rows.push(row)
  }
  
  return rows
}

export async function GET() {
  const source = 'prices'
  const timestamp = new Date().toISOString()
  
  if (!ENABLE_LIVE_DATA) {
    console.log(`[${timestamp}] [${source}] Live data fetching is disabled`)
    return NextResponse.json(
      { ok: false, reason: 'Live data fetching is disabled' },
      { status: 403 }
    )
  }

  if (!SOURCES.prices) {
    console.log(`[${timestamp}] [${source}] PRICES_URL not configured`)
    return NextResponse.json(
      { ok: false, reason: 'PRICES_URL not configured in environment variables' },
      { status: 400 }
    )
  }

  try {
    console.log(`[${timestamp}] [${source}] Fetching from ${SOURCES.prices}`)
    const response = await fetchWithRetry(SOURCES.prices, {
      timeoutMs: 10000,
      maxRetries: 2
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch prices: ${response.statusText}`)
    }

    const csvText = await response.text()
    const rows = parseCSV(csvText)

    console.log(`[${timestamp}] [${source}] Parsed ${rows.length} rows from Redfin CSV`)

    let mostRecentMonth = ''
    rows.forEach(row => {
      const periodEnd = row.period_end || row.date || row.month
      if (periodEnd && periodEnd > mostRecentMonth) {
        mostRecentMonth = periodEnd
      }
    })
    
    // Format to YYYY-MM
    const priceUpdatedAt = mostRecentMonth.slice(0, 7)

    const zipMap: Record<string, { totalPrice: number; totalRent: number; count: number }> = {}
    
    rows.forEach(row => {
      // Check if row is in DFW counties
      const county = row.county || row.region || ''
      if (!DFW_COUNTIES.some(c => county.includes(c))) {
        return // Skip non-DFW rows
      }
      
      // Extract ZIP
      const zip = row.zip || row.zipcode || row.postal_code || ''
      if (!zip || !/^\d{5}$/.test(zip)) {
        return // Skip if no valid ZIP
      }
      
      // Extract median sale price
      const medianSalePrice = parseFloat(row.median_sale_price || row.median_price || row.price || '0')
      if (isNaN(medianSalePrice) || medianSalePrice <= 0) {
        return // Skip if no valid price
      }
      
      // Extract optional median rent
      const medianRent = parseFloat(row.median_rent || row.rent || '0')
      
      // Aggregate by ZIP (in case multiple rows per ZIP)
      if (!zipMap[zip]) {
        zipMap[zip] = { totalPrice: 0, totalRent: 0, count: 0 }
      }
      
      zipMap[zip].totalPrice += medianSalePrice
      if (!isNaN(medianRent) && medianRent > 0) {
        zipMap[zip].totalRent += medianRent
      }
      zipMap[zip].count++
    })

    const mappedData = Object.entries(zipMap).map(([zip, data]) => ({
      zip,
      medianSalePrice: Math.round(data.totalPrice / data.count),
      rentMedian: data.totalRent > 0 ? Math.round(data.totalRent / data.count) : null,
      priceUpdatedAt,
      sources: ['Redfin Data Center']
    }))

    console.log(`[${timestamp}] [${source}] Mapped ${mappedData.length} ZIPs for DFW from Redfin data`)

    const updatedCount = await mergeZipData('prices', mappedData)

    console.log(`[${timestamp}] [${source}] Successfully updated ${updatedCount} ZIPs`)

    return NextResponse.json({
      ok: true,
      updated: updatedCount,
      updatedAt: timestamp,
      priceUpdatedAt
    })

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    console.error(`[${timestamp}] [${source}] Error refreshing price data:`, errorMsg)
    return NextResponse.json(
      { ok: false, reason: `Failed to refresh price data: ${errorMsg}` },
      { status: 500 }
    )
  }
}
