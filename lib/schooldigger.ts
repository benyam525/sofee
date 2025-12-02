/**
 * SchoolDigger HTML Parser
 * 
 * Optional utility to parse SchoolDigger school pages as a fallback/cross-check
 * for TEA data. Use respectfully with appropriate rate limiting.
 * 
 * NOTE: This scrapes public display pages and site structure may change.
 * TEA remains the source of truth; use this only to fill gaps or validate.
 */

export interface SchoolDiggerResult {
  name: string | null;
  zip: string | null;
  staarMathProficiency: number | null;
  staarReadingProficiency: number | null;
  accountabilityRating: string | null;
  source: string;
}

/**
 * Parse a SchoolDigger school page HTML to extract displayed stats
 * @param html - Raw HTML string from SchoolDigger school page
 * @returns Extracted school data or null values if not found
 */
export async function parseSchoolDiggerHTML(html: string): Promise<SchoolDiggerResult> {
  // Extract fields with lightweight regex (site structure may change)
  const m = {
    name: /<h1[^>]*>([^<]+)<\/h1>/i.exec(html)?.[1]?.trim() ?? null,
    zip: /\b(\d{5})(?:-\d{4})?\b/.exec(html)?.[1] ?? null,
    math: /Math[^%]*?(\d{1,3})%/i.exec(html)?.[1] ?? null,
    reading: /Reading[^%]*?(\d{1,3})%/i.exec(html)?.[1] ?? null,
    rating: /Overall\s+Rating[^A-F]*([A-F])/i.exec(html)?.[1] ?? null
  };

  return {
    name: m.name,
    zip: m.zip,
    staarMathProficiency: m.math ? Math.min(1, Number(m.math) / 100) : null,
    staarReadingProficiency: m.reading ? Math.min(1, Number(m.reading) / 100) : null,
    accountabilityRating: m.rating ?? null,
    source: "SchoolDigger (display scrape)"
  };
}

/**
 * Merge SchoolDigger data with TEA data, preferring TEA when both exist
 * @param teaData - Data from TEA source
 * @param schoolDiggerData - Data from SchoolDigger scrape
 * @returns Merged data object with TEA taking precedence
 */
export function mergeSchoolData(
  teaData: Partial<SchoolDiggerResult>,
  schoolDiggerData: SchoolDiggerResult
): SchoolDiggerResult {
  return {
    name: teaData.name ?? schoolDiggerData.name,
    zip: teaData.zip ?? schoolDiggerData.zip,
    staarMathProficiency: teaData.staarMathProficiency ?? schoolDiggerData.staarMathProficiency,
    staarReadingProficiency: teaData.staarReadingProficiency ?? schoolDiggerData.staarReadingProficiency,
    accountabilityRating: teaData.accountabilityRating ?? schoolDiggerData.accountabilityRating,
    source: teaData.name ? "TEA (primary)" : schoolDiggerData.source
  };
}
