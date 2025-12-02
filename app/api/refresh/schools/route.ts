import { NextResponse } from 'next/server'
import { ENABLE_LIVE_DATA, REVALIDATE_MINUTES, SOURCES } from '@/lib/config'
import { mergeZipData } from '@/lib/cache'
import { ZIP_TO_DISTRICT, getDistrictForZip } from '@/lib/zipToDistrict'
import { fetchWithRetry } from '@/lib/fetchWithRetry'

export async function GET() {
  const source = 'schools'
  const timestamp = new Date().toISOString()
  
  if (!ENABLE_LIVE_DATA) {
    console.log(`[${timestamp}] [${source}] Live data fetching is disabled`)
    return NextResponse.json(
      { ok: false, reason: 'Live data fetching is disabled' },
      { status: 403 }
    )
  }

  try {
    console.log(`[${timestamp}] [${source}] Fetching from ${SOURCES.schools}`)
    const response = await fetchWithRetry(SOURCES.schools || process.env.SCHOOLS_URL || 'https://example.com/api/schools.csv', {
      timeoutMs: 10000,
      maxRetries: 2
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch schools: ${response.statusText}`)
    }

    const csvText = await response.text()
    
    // Parse CSV/TSV (simple parser for both comma and tab delimited)
    const delimiter = csvText.includes('\t') ? '\t' : ','
    const lines = csvText.trim().split('\n')
    const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''))
    
    // Find column indices
    const districtCol = headers.findIndex(h => h.toLowerCase().includes('district'))
    const zipCol = headers.findIndex(h => h.toLowerCase().includes('zip'))
    const scoreCol = headers.findIndex(h => 
      h.toLowerCase().includes('score') || 
      h.toLowerCase().includes('rating') || 
      h.toLowerCase().includes('composite')
    )
    const gradeCol = headers.findIndex(h => h.toLowerCase().includes('grade') || h.toLowerCase().includes('rating'))
    const yearCol = headers.findIndex(h => h.toLowerCase().includes('year'))
    
    // Parse data rows
    const rows = lines.slice(1).map(line => {
      const values = line.split(delimiter).map(v => v.trim().replace(/^"|"$/g, ''))
      return {
        district: districtCol >= 0 ? values[districtCol] : null,
        zip: zipCol >= 0 ? values[zipCol] : null,
        score: scoreCol >= 0 ? values[scoreCol] : null,
        grade: gradeCol >= 0 ? values[gradeCol] : null,
        year: yearCol >= 0 ? values[yearCol] : null
      }
    })
    
    // Aggregate scores by ZIP
    const zipScores: Record<string, { sum: number; count: number; year?: string }> = {}
    
    rows.forEach(row => {
      let zip = row.zip
      
      // If no zip column, try to map from district
      if (!zip && row.district) {
        const matchedZips = Object.entries(ZIP_TO_DISTRICT)
          .filter(([_, d]) => d.toLowerCase().includes(row.district!.toLowerCase()))
          .map(([z]) => z)
        
        if (matchedZips.length > 0) {
          zip = matchedZips[0] // Use first matched ZIP for this district
        }
      }
      
      if (!zip) return // Skip if no ZIP found
      
      // Compute schoolSignal (0-100 composite)
      let signal: number | null = null
      
      if (row.score) {
        const numericScore = parseFloat(row.score)
        if (!isNaN(numericScore)) {
          // If score is already 0-100, use it; if 0-10, scale to 0-100
          signal = numericScore > 10 ? numericScore : numericScore * 10
        }
      } else if (row.grade) {
        // Convert A-F grade to 0-100
        const gradeMap: Record<string, number> = {
          'A': 95, 'A+': 98, 'A-': 92,
          'B': 85, 'B+': 88, 'B-': 82,
          'C': 75, 'C+': 78, 'C-': 72,
          'D': 65, 'D+': 68, 'D-': 62,
          'F': 50
        }
        const grade = row.grade.trim().toUpperCase()
        signal = gradeMap[grade] || null
      }
      
      if (signal !== null && signal >= 0 && signal <= 100) {
        if (!zipScores[zip]) {
          zipScores[zip] = { sum: 0, count: 0, year: row.year || undefined }
        }
        zipScores[zip].sum += signal
        zipScores[zip].count += 1
      }
    })
    
    // Build patches
    const patches = Object.entries(zipScores).map(([zip, data]) => {
      const avgSignal = Math.round(data.sum / data.count)
      
      let updatedAt: string
      if (data.year) {
        const yearMatch = data.year.match(/\d{4}/)
        updatedAt = yearMatch ? `${yearMatch[0]}-08` : new Date().toISOString().slice(0, 7)
      } else {
        updatedAt = new Date().toISOString().slice(0, 7)
      }
      
      return {
        zip,
        schoolSignal: avgSignal,
        schoolUpdatedAt: updatedAt,
        sources: ['TEA composite']
      }
    })
    
    console.log(`[${timestamp}] [${source}] Processed ${patches.length} ZIPs`)

    const updatedCount = await mergeZipData('schools', patches)

    console.log(`[${timestamp}] [${source}] Successfully updated ${updatedCount} ZIPs`)

    return NextResponse.json({
      ok: true,
      updated: updatedCount,
      zipsProcessed: patches.length,
      updatedAt: timestamp
    })

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    console.error(`[${timestamp}] [${source}] Error refreshing school data:`, errorMsg)
    return NextResponse.json(
      { ok: false, reason: `Failed to refresh school data: ${errorMsg}` },
      { status: 500 }
    )
  }
}
