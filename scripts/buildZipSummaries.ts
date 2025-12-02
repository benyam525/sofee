import { buildZipSummaries } from '../lib/zipSummaries'

console.log('[ZIP Summaries] Building ZIP-level school summaries...')

try {
  const count = buildZipSummaries()
  console.log(`[ZIP Summaries] ✅ Generated summaries for ${count} ZIP codes`)
  console.log('[ZIP Summaries] Written to: data/zip_school_summaries.json')
} catch (error) {
  console.error('[ZIP Summaries] ❌ Error building summaries:', error)
  process.exit(1)
}
